#include "osdependent.h"

#include "version/AppRegCache.h"
#include "winutil.h"
#include "mathutil.h"
#include "crypt.h"
#include "sysutil.h"
#include "utils.h"
#include "error.h"
#include "FolderCache.h"
#include "BitStream.h"
#include "net/net.h"
#include "file.h"
#include "earray.h"
#include <conio.h>
#include "WorldLib.h"
#include "GraphicsLib.h"
#include "GfxSprite.h"
#include "GfxTexAtlas.h"
#include "GfxFont.h"
#include "GfxFontStructs.h"
#include "GfxSpriteText.h"
#include "GfxPrimitive.h"
#include "GfxTesting.h"
#include "GfxConsole.h"
#include "GfxCamera.h"
#include "GfxTexWords.h"
#include "MemoryMonitor.h"
#include "MemoryBudget.h"
#include "textparser.h"
#include "inputLib.h"
#include "inputMouse.h"
#include "inputXbox.h"
#include "timing.h"
#include "rand.h"
#include "Resource.h"
#include "dynFxManager.h"
#include "DebugState.h"
#include "GfxCommandParse.h"
#include "RdrCommandParse.h"
#include "RdrStandardDevice.h"
#include "wlCommandParse.h"
#include "inputCommandParse.h"
#include "wlAutoLOD.h"
#include "dynSkeleton.h"
#include "dynDraw.h"
#include "dynBitField.h"
//#include "dynAnimTrack.h"
#include "dynNode.h"
#include "../GraphicsLibPrivate.h"
#include "stringUtil.h"
#include "StringCache.h"
#include "WorldGrid.h"
#include "wlModel.h"
#include "wlTerrain.h"
#include "wlCostume.h"
#include "../../Utilities/AskOptions/askOptions.h"
#include "wlTime.h"
#include "inputKeyBind.h"
#include "referencesystem.h"
#include "utilitiesLib.h"
#include "Materials.h"
#include "dynFxInterface.h"
#include "AutoStartupSupport.h"

#define TRACE_RECORDING ( _XBOX && 1 )
#if TRACE_RECORDING
#include "ThreadManager.h"
#include "xtl.h"
#include "tracerecording.h"
#pragma comment( lib, "tracerecording.lib" )
#pragma comment( lib, "xbdm.lib" )
#endif

// Enable the #define below to force DirectX on Win32. 
#define USE_DIRECTX_ON_WIN32 1

#if defined(_XBOX) || USE_DIRECTX_ON_WIN32
#include "XRenderLib.h"

#ifdef _XBOX

#pragma comment(lib, "Xonline.lib")
#pragma comment(lib, "xboxkrnl.lib")
#pragma comment(lib, "xbdm.lib")
#else
#pragma comment(lib, "../../3rdparty/directx/lib/d3d9.lib")
#endif

#endif

#ifndef _XBOX
#include "GLRenderLib.h"
#endif

#define	PHYSX_SRC_FOLDER "../../3rdparty"
#include "PhysicsSDK.h"

AUTO_RUN_ANON(memBudgetSetConfigFile("editor/BudgetsGameClient.txt"););

int num_devices=1;
typedef struct DeviceDesc {
	RdrDevice *device;
	GfxCameraController freecamera;
} DeviceDesc;
DeviceDesc **devices;

int wireframe=0;
int rotate=0;
F32 lod_test_distance=10;
F32 lod_test_distance_actual=10;

int two_devices=0; 
int fullscreen=0; 
int test_models=0;
int test_text=0;
int test_sprites=0;
int test_primitives=0;
int test_dynamics=1;
int test_animation=1;
int test_lods=0;
int test_texWords=0;
#ifdef _XBOX
int test_parser=0;
int test_threaded=0;
#else
int test_parser=0;
int test_threaded=0;
#endif
int test_colortint=0;
int test_postprocessing=1;
int test_postprocessing_debug=0;
int test_world=0;
int test_material_parameters=0;

AUTO_CMD_INT(test_models, test_models) ACMD_CATEGORY(CommandLine);
AUTO_CMD_INT(test_world, test_world) ACMD_CATEGORY(CommandLine);
AUTO_CMD_INT(test_threaded, test_threaded) ACMD_CATEGORY(CommandLine);
AUTO_CMD_INT(test_animation, test_animation) ACMD_CATEGORY(CommandLine);

Vec4 clearcolor = {0, 0, 0, 0};

#define MAX_TEST_SKELETONS 64

static DynSkeleton* pTestSkeletonSet[ MAX_TEST_SKELETONS ] = { NULL };
static DynFxManager* pTestManager;

static OptionList option_list[] = {
	{"Two Devices", &two_devices, "TwoDevices"},
	{"Fullscreen", &fullscreen, "Fullscreen"},
	{"Test Models", &test_models, "TestModels"},
	{"Test Sprites", &test_sprites, "TestSprites"},
	{"Test Primitives", &test_primitives, "TestPrimitives"},
	{"Test Parser", &test_parser, "TestParser"},
	{"Test Dynamics", &test_dynamics, "TestDynamics"},
	{"Test Animation", &test_animation, "TestAnimation"},
	{"Test ColorTinting", &test_colortint, "TestColorTint"},
	{"Test PostProcessing", &test_postprocessing, "TestPostProcess"},
	{"Debug", &test_postprocessing_debug, "TestPostProcessDebug", OLF_CHILD},
	{"Test World", &test_world, "TestTerrain"},
	{"Test LODs", &test_lods, "TestLODs"},
	{"Test Text", &test_text, "TestText"},
	{"Test TexWords", &test_texWords, "TestTexWords"},
	{"Test Material Params", &test_material_parameters, "TestMaterialParams"},
	{"Run Threaded", &test_threaded, "RunThreaded"},
};

// record a frame-long instruction trace for profiling; Xbox only
// must have threaded rendering and audio off, and all non-main threads paused
#if TRACE_RECORDING
static S64 startFrameTimeSecs = 0;
static char g_szDebugTraceFile[ CRYPTIC_MAX_PATH ];
static int g_nDebugTrace = 0;
#endif
AUTO_COMMAND;
void debugStartTrace( const char * file )
{
#if TRACE_RECORDING
	strcpy( g_szDebugTraceFile, file );
	g_nDebugTrace = 1;
	XTraceSetBufferSize( 4096*1024 );
#endif
}

//__forceinline 
static void TraceSection(const char * section)
{
#if TRACE_RECORDING
	char szFullPath[ CRYPTIC_MAX_PATH ];

	if ( g_nDebugTrace < 2 )
		return;

	if ( g_nDebugTrace >= 4 )
		XTraceStopRecording();

	strcpy( szFullPath, "xe:\\" );
	strcat( szFullPath, g_szDebugTraceFile );
	strcat( szFullPath, "_" );
	strcat( szFullPath, section );
	strcat( szFullPath, ".pix2" );
	OutputDebugStringf( "Trace starting %s\n", szFullPath );
	XTraceStartRecording( szFullPath );
	g_nDebugTrace = 4;
#endif
}

//__forceinline 
static void TraceStop()
{
#if TRACE_RECORDING
	if ( g_nDebugTrace >= 4 )
		XTraceStopRecording();
#endif
}

void libTest(HINSTANCE hInstance, int argc, char **argv);
void toggleMaterials(void);

//////////////////////////////////////////////////////////////////////////

void GimmeErrorDialog(char* errMsg)
{
	char author[200] = {0};
	char temp[200] = {0};
	char* intro = strstr(errMsg, g_lastAuthorIntro);
	if (intro)
	{
		strncpyt(temp, intro + strlen(g_lastAuthorIntro), 200);
		intro = strchr(temp, '\n');
		if (intro) *intro = 0;

		// HACK: if an actual author instead of an error message
		if (strlen(temp) < 15) 
			sprintf_s(SAFESTR(author), "%s is Responsible", temp);
		else 
			Strcpy(author, temp);
	}
#ifdef _XBOX
	printf(errMsg);
	//assert(0);
#endif
	//rdrSafeErrorMsg(errMsg, 0, author[0]? author: NULL, errorWasForceShown());
}

void clientFatalErrorfCallback(char* errMsg)
{
	rdrSafeErrorMsg(errMsg, "Fatal Error", 0, 1);
	assertmsg(0, errMsg);
}

void clientErrorfCallback(char* errMsg)
{
	printf("%s\n", errMsg);
	if (ErrorfCount() < 5 && UserIsInErrorGroup())
		GimmeErrorDialog(errMsg);
}

// static void doFastMathTest(void)
// {
// 	FastMat44 fproj, fworld, fworldproj, finvworld;
// 	Mat44 proj, world, worldproj, fworldproj44, invworld, finvworld44;
// 	FastVec fv1, fv2;
// 	Vec3 v1, v3;
// 	Vec4 v2;
// 	F32 scale;
// 	Mat4 world4, invworld4;
// 
// 	// test matrix multiply
// 	rdrSetupPerspectiveProjection(FASTPTR(fproj), 45, 1.33f, 0.73f, 20000.f);
// 	getFastMat44(proj, fproj);
// 
// 	setFastMat44Columnf(FASTPTR(fworld), 0, -1,  0,  0);
// 	setFastMat44Columnf(FASTPTR(fworld), 1,  0,  1,  0);
// 	setFastMat44Columnf(FASTPTR(fworld), 2,  0,  0,  1);
// 	setFastMat44Columnf(FASTPTR(fworld), 3,  0,  0, 80);
// 
// 	setVec4(world[0], -1,  0,  0,  0);
// 	setVec4(world[1],  0,  1,  0,  0);
// 	setVec4(world[2],  0,  0,  1,  0);
// 	setVec4(world[3],  0,  0, 80,  1);
// 
// 	mulFastMat44(fproj, fworld, FASTPTR(fworldproj));
// 	mulMat44Inline(proj, world, worldproj);
// 
// 	getFastMat44(fworldproj44, fworldproj);
// 
// 	assert(nearSameVec3(worldproj[0], fworldproj44[0]));
// 	assert(nearSameVec3(worldproj[1], fworldproj44[1]));
// 	assert(nearSameVec3(worldproj[2], fworldproj44[2]));
// 	assert(nearSameVec3(worldproj[3], fworldproj44[3]));
// 
// 
// 	// test matrix vector multiply
// 	setFastVecf(FASTPTR(fv1), 5, 2, -1);
// 	setVec3(v1, 5, 2, -1);
// 
// 	mulFastVecMat44(fv1, fworldproj, FASTPTR(fv2));
// 	mulVecMat44(v1, worldproj, v2);
// 	scale = 1.f / v2[3];
// 	scaleVec3(v2, scale, v2);
// 
// 	getFastVec(v3, fv2);
// 	assert(nearSameVec3(v2, v3));
// 
// 
// 	// test matrix quick invert
// 	invertFastMat44Quick(FASTPTR(finvworld), fworld);
// 	getFastMat44(finvworld44, finvworld);
// 	mat44to43(world, world4);
// 	transposeMat4Copy(world4, invworld4);
// 	mat43to44(invworld4, invworld);
// 
// 	assert(nearSameVec3(invworld[0], finvworld44[0]));
// 	assert(nearSameVec3(invworld[1], finvworld44[1]));
// 	assert(nearSameVec3(invworld[2], finvworld44[2]));
// 	assert(nearSameVec3(invworld[3], finvworld44[3]));
// }


#ifdef _XBOX
int main(int argc_in, char** argv_in)
{
	HINSTANCE hInstance = 0;
	LPSTR lpCmdLine;
	EXCEPTION_HANDLER_BEGIN
	DO_AUTO_RUNS

#else
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
{
	EXCEPTION_HANDLER_BEGIN
	DO_AUTO_RUNS
	memCheckInit();
	newConsoleWindow();
	showConsoleWindow();
	winSetHInstance(hInstance);
#endif
	lpCmdLine = GetCommandLine();

	regSetAppName("GraphicsLibTest");
	FolderCacheChooseMode();
	//FolderCacheEnableCallbacks(0);
	FolderCacheSetManualCallbackMode(1);

	fileLoadGameDataDirAndPiggs();

	ErrorfSetCallback(clientErrorfCallback);
	FatalErrorfSetCallback(clientFatalErrorfCallback);

	bsAssertOnErrors(true);
	disableRtlHeapChecking(NULL);
	setDefaultAssertMode();
	memBudgetStartup();

	logSetDir("GameClient");
	errorLogStart();
	cryptAdler32Init();
	//atexit(packetShutdown);

	//packetStartup(1024, 1);

	if (0==doAskOptions("GraphicsLibTest", option_list, ARRAY_SIZE(option_list), 3.f, 0, NULL))
		return 0;

	if (test_parser) {
		TestTextParser(); // MAK - my own testing
	}

// 		doFastMathTest();
	{
		int argc = 0;
		char *args[1000];
		char **argv = args;
		char buf[1000]={0};
		char *firstArg = strchr(lpCmdLine, ' ');

		loadCmdline("./cmdline.txt",buf,sizeof(buf));
		if (firstArg)
			strcat(buf, firstArg);
		args[0] = "file.exe";
		argc = 1 + tokenize_line_quoted_safe(buf,&args[1],ARRAY_SIZE(args)-1,0);

		libTest(hInstance, argc, argv);
	}

	EXCEPTION_HANDLER_END

	return 0;
}


#define BUF_SIZE 1024*1024
void debugConsole(void)
{
#ifndef _XBOX
	static char *buf = NULL;
	if (!buf) {
		buf = malloc(BUF_SIZE);
	}
	assert(buf);
	if (!test_threaded)
		BringWindowToTop(compatibleGetConsoleWindow());
	printf(">");
	gets_s(buf, BUF_SIZE);
	globCmdParse(buf);
	if (!test_threaded)
		BringWindowToTop(rdrGetWindowHandle(devices[0]->device));
#endif
}
#undef BUF_SIZE

//////////////////////////////////////////////////////////////////////////

static int g_run = 1;
static Vec3 g_campos={0,6,80}, g_pyr;
static bool bRunParticles = false, bPauseParticles = false, bRunOneParticle = false;

void quitProgram(void)
{
	g_run = 0;
}

static int testOkToInput(int keyScanCode, int state)
{
	return 1;
}

AUTO_COMMAND ACMD_ACCESSLEVEL(0);
void ToggleMove(void)
{
	int skeletonIndex;
	for (skeletonIndex = 0; skeletonIndex < MAX_TEST_SKELETONS; ++skeletonIndex)
	{
		DynSkeleton * pTestSkeleton = pTestSkeletonSet[skeletonIndex];
		if ( pTestSkeleton )
		{
			static bool bMove = false;
			bMove = !bMove;
			if ( bMove )
			{
				if ( pTestSkeleton )
					dynSeqSetBitsByName(pTestSkeleton, eDynBitType_Mode, "MOVE");
			}
			else
			{
				if ( pTestSkeleton )
					dynSeqSetBitsByName(pTestSkeleton, eDynBitType_Mode, "IDLE");
			}
		}
	}
}


AUTO_COMMAND ACMD_ACCESSLEVEL(0);
void ToggleRun(void)
{
	int skeletonIndex;
	for (skeletonIndex = 0; skeletonIndex < MAX_TEST_SKELETONS; ++skeletonIndex)
	{
		DynSkeleton * pTestSkeleton = pTestSkeletonSet[skeletonIndex];
		if ( pTestSkeleton )
		{
			static bool bRun = false;
			bRun = !bRun;
			if ( bRun )
			{
				if ( pTestSkeleton )
					dynSeqSetBitsByName(pTestSkeleton, eDynBitType_Mode, "JUMP");
			}
			else
			{
				if ( pTestSkeleton )
					dynSeqClearBitsByName(pTestSkeleton, eDynBitType_Mode, "JUMP");
			}
		}
	}
}
// set time
AUTO_COMMAND ACMD_NAME("time") ACMD_ACCESSLEVEL(0);
void CmdTime(F32 newTime)
{
	wlTimeSet(newTime);
}

// Set time scale
AUTO_COMMAND ACMD_NAME("timeScale") ACMD_ACCESSLEVEL(0);
void CmdTimeScale(F32 newTime)
{
	wlTimeSetScale(newTime);
}

// Set time step scale
AUTO_COMMAND ACMD_NAME("timeStepScale") ACMD_ACCESSLEVEL(0);
void CmdTimeStepScale(F32 newTime)
{
	wlTimeSetStepScale(newTime);
}

AUTO_COMMAND ACMD_NAME("timeStepPause") ACMD_ACCESSLEVEL(0);
void CmdTimeStepPause(void) {
	if (wlTimeGetStepScale() > 0.01) {
		CmdTimeStepScale(0.0000001);
	} else {
		CmdTimeStepScale(1);
	}
}

static bool bCostumeChanged = true;
static const char* pcTestCostume = "Hero_01";

AUTO_COMMAND ACMD_CATEGORY(costume);
void ChangeCostume(ACMD_NAMELIST("Costume", REFDICTIONARY) char *costumeName)
{
	bCostumeChanged = true;
	pcTestCostume = allocAddString(costumeName);
}

AUTO_COMMAND;
void incTestVar(int test_var)
{
	switch (test_var)
	{
		xcase 1:
			++dbg_state.test1;
		xcase 2:
			++dbg_state.test2;
		xcase 3:
			++dbg_state.test3;
		xcase 4:
			++dbg_state.test4;
		xcase 5:
			++dbg_state.test5;
		xcase 6:
			++dbg_state.test6;
		xcase 7:
			++dbg_state.test7;
		xcase 8:
			++dbg_state.test8;
		xcase 9:
			++dbg_state.test9;
	}
}

AUTO_COMMAND;
void decTestVar(int test_var)
{
	switch (test_var)
	{
		xcase 1:
			--dbg_state.test1;
		xcase 2:
			--dbg_state.test2;
		xcase 3:
			--dbg_state.test3;
		xcase 4:
			--dbg_state.test4;
		xcase 5:
			--dbg_state.test5;
		xcase 6:
			--dbg_state.test6;
		xcase 7:
			--dbg_state.test7;
		xcase 8:
			--dbg_state.test8;
		xcase 9:
			--dbg_state.test9;
	}
}

int reloadTestTexWord=0;
AUTO_CMD_INT(reloadTestTexWord, reloadTestTexWord);

// Put any command binds you want as defaults here
// Since the second param has to be a cmd, you might need to use autocommand or add it to the cmd table
static void setGLTDefaultKeys()
{
	keybind_BindKeyInUserProfile("XB","++shadows");
	keybind_BindKeyInUserProfile("YB","++comicShading");
	keybind_BindKeyInUserProfile("AB","wlTimeSetScale 0");
	keybind_BindKeyInUserProfile("BB","++wireframe");
	keybind_BindKeyInUserProfile("SELECT", "++whiteTextures");
	keybind_BindKeyInUserProfile("START","reloadShaders");
	keybind_BindKeyInUserProfile("LB","decTestVar 1");
	keybind_BindKeyInUserProfile("RB","incTestVar 1");
	keybind_BindKeyInUserProfile("LTRIGGER","decTestVar 2");
	keybind_BindKeyInUserProfile("RTRIGGER","incTestVar 2");
	keybind_BindKeyInUserProfile("o", "toggle_move");
	keybind_BindKeyInUserProfile("i", "toggle_run");
	keybind_BindKeyInUserProfile("-", "testDynFx TestDyn");
	keybind_BindKeyInUserProfile("p", "runperfinfo_client -1");
	keybind_BindKeyInUserProfile("0", "testDynFx DemoFire");
	keybind_BindKeyInUserProfile("1","++test1");
	keybind_BindKeyInUserProfile("2","++test2");
	keybind_BindKeyInUserProfile("3","++test3");
	keybind_BindKeyInUserProfile("4","++test4");
	keybind_BindKeyInUserProfile("5","++test5");
	keybind_BindKeyInUserProfile("6","++test6");
}

//////////////////////////////////////////////////////////////////////////

static RdrSurface *createSecondSurface(RdrDevice *device)
{
	RdrSurface *surface;
	RdrSurfaceParams surfaceparams = {0};
	surfaceparams.flags = 0;
	surfaceparams.width = surfaceparams.height = 128;
	surfaceparams.desired_multisample_level = 1;
	surfaceparams.required_multisample_level = 1;
	rdrSetDefaultTexFlagsForSurfaceParams(&surfaceparams);

	rdrLockActiveDevice(device, false);
	surface = rdrCreateSurface(device, &surfaceparams);
	rdrUnlockActiveDevice(device, false, false, false);
	return surface;
}

void newDevice(HINSTANCE hInstance)
{
	WindowCreateParams params={0};
	char buf[32];
	DeviceDesc *device = calloc(sizeof(*device),1);
	InputDevice *inpdev;
	GfxResolution *res;

	params.fullscreen = fullscreen;
	params.threaded = test_threaded;
	rdrGetSupportedResolutions(&res);

	if ( fullscreen )
	{
		params.width = res->width;
		params.height = res->height;
		params.refreshRate = 60;
	}
	else
	{
#ifndef _XBOX
		RECT rectWorkArea={0};
		SystemParametersInfo(SPI_GETWORKAREA, 0, &rectWorkArea, 0);
		params.xpos = rectWorkArea.left + 5 + (eaSize(&devices)/2) * 650;
		params.ypos = rectWorkArea.top + 5 + (eaSize(&devices)%2) * 500;
		params.height = 500;
#else
		params.height = 720;
#endif
		params.width = round(params.height * res->width / (F32)res->height);
	}

	device->device = rdrCreateDeviceXBox(&params, hInstance, false, 2);

	if (!device->device)
		return;
	inpdev = inpCreateInputDevice(device->device,hInstance,keybind_ExecuteKey);
	sprintf_s(SAFESTR(buf), "Cryptic App; Device #%d", eaSize(&devices));
	rdrSetTitle(device->device, buf);
	rdrSetIcon(device->device, IDI_CRYPTIC);
	gfxRegisterDevice(device->device, inpdev);
	gfxInitCameraController(&device->freecamera, gfxFreeCamFunc, NULL);
	gfxSetActiveCameraController(&device->freecamera, true);
	eaPush(&devices, device);
}

void removeDevice(void)
{
	DeviceDesc *device = eaPop(&devices);
	if (!device)
		return;

	gfxUnregisterDevice(device->device);
	rdrDestroyDevice(device->device);
	if (eaSize(&devices))
		gfxSetActiveDevice(devices[0]->device);
}

static Mat4 box_matrix = {0};

void updateBoxMat(F32 elapsed)
{
	static bool inited=false;
	static int dx=0, dy=0, dz=0;
	F32 rpy[3];

	if (!inited) {
		inited = true;
		identityMat4(box_matrix);
	}

	if (rotate) {
		dx = 3;
		dy = 2;
		dz = 1;
	} else {
		dx = dy = dz = 0;
	}
	rpy[2] = dx/4.f*elapsed;
	rpy[1] = dy/4.f*elapsed;
	rpy[0] = dz/4.f*elapsed;
	rotateMat3(rpy, box_matrix);
}

//static const char *dummy_material_name = "Test28_default";
static const char *dummy_material_name = "ExampleParameterized_default";
//static const char *dummy_material_name = "test_texWords";
//static const char *dummy_material_name = "Test_default";
//static const char *dummy_material_name = "TestRefract_default";

AUTO_COMMAND;
void toggleMaterials(void)
{
	int i;
	static const char *materials[] = {
		"default",
		"TestRefract_default",
		"ExampleParameterized_default",
		"Test_default",
		"test_dualcolor",
/*		"test_bump",
		"test_scroller",
		"test_hardtint_alpha",
		"ptype_wall_chainlink",
		"tenement_sets_sheet02",*/
	};
	for (i=0; i<ARRAY_SIZE(materials); i++) {
		if (materials[i] == dummy_material_name) {
			dummy_material_name = materials[(i+1)%ARRAY_SIZE(materials)];
			return;
		}
	}
	dummy_material_name = materials[1];
}

static const char *test_model_name = "matED_primitives_organic";
static const char *test_model_filename = "object_library/system/matED/matED_primitives.geo";
//static const char *test_model_name = "jimb_test_box";
//static const char *test_model_filename = "object_library/test/jtest/jtest.geo";
void toggleModels(void)
{
	int i;
	static const char *models[][2] = {
		{ "matED_primitives_organic", "object_library/system/matED/matED_primitives.geo"},
		{ "jimb_test_box", "object_library/test/jtest/jtest.geo"},
	};
	for (i=0; i<ARRAY_SIZE(models); i++) {
		if (models[i][0] == test_model_name) {
			test_model_name = models[(i+1)%ARRAY_SIZE(models)][0];
			test_model_filename = models[(i+1)%ARRAY_SIZE(models)][1];
			return;
		}
	}
	test_model_name = models[1][0];
	test_model_filename = models[1][1];
}

void drawModelTest(Model *model, Mat4 matrix)
{
	int i, j;
	RdrAddParams params={0};
	ModelToDraw models[NUM_MODELTODRAWS];
	int model_count;
	static char last_buf[1024];
	char buf[1024]={0};
	static MaterialNamedConstant **eaNamedConstants=NULL;
	MaterialNamedConstant color1;
	MaterialNamedConstant param2;
	SingleModelParams smparams = {0};

	eaClear(&eaNamedConstants);

	// Shared data (not per-instance)
	if (test_colortint) {
		setVec3(smparams.color, 1, 0, 1);
		color1.name = allocAddString("Color1");
		setVec4(color1.value, 0, 1, 0, 1);
		eaPush(&eaNamedConstants, &color1);
	} else {
		setVec3(smparams.color, 1, 1, 1);
	}
	if (test_material_parameters) {
		F32 v;
		param2.name = allocAddString("Refractivity");
		v = timerGetSecondsAsFloat();
		v = v - 2*(int)(v/2);
		if (v>1)
			v = 2 - v;
		setVec4same(param2.value, v);
		eaPush(&eaNamedConstants, &param2);
	}

	smparams.model = model;
	copyMat4(matrix, smparams.world_mat);
	smparams.dist = lod_test_distance_actual;
	smparams.wireframe = wireframe;
	smparams.eaNamedConstants = eaNamedConstants;
	smparams.alpha = 255;
	setVec3same(smparams.ambient, 0.1f);
	if (stricmp(dummy_material_name, "default")!=0) 
	{
		Material *material = materialFind(dummy_material_name, WL_FOR_WORLD);
		smparams.material_replace = material;
	}

	gfxQueueSingleModelTinted(&smparams, -1);

	// Look at each LOD model (drawing happens internally now)
	model_count = gfxDemandLoadModel(model, NULL, models, ARRAY_SIZE(models), lod_test_distance_actual, 1, -1, NULL, NULL);
	if (test_lods) {
		extern int g_debug_model_fixup;
		for (j=0; j<model_count; j++) 
		{
			// Find index
			int index=0;
			for (i=eaSize(&model->lod_info->lods)-1; i>=0; i--) {
				if (model->lod_info->lods[i]->cached_model == models[j].model) {
					index = i;
				}
			}
			gfxfont_Printf(10,35+12*index, 0, 1.0, 1.0, 0, "%d: %d", index, (int)models[j].alpha);
			strcatf_s(SAFESTR(buf), "%d: %d\t", index, (int)models[j].alpha);
		}
		strcatf_s(SAFESTR(buf), "GDMF: %d", g_debug_model_fixup);
		if (stricmp(buf, last_buf)!=0) {
			//printf("%s\n", buf);
			Strcpy(last_buf, buf);
		}
		if (g_debug_model_fixup) {
			gfxfont_Printf(10, 35+12*5, 0, 1, 1, 0, "Models recently loaded... (%d)", g_debug_model_fixup);
		}
	}
}

//do_not_AUTO_RUN;
void breakFiles(void)
{
	fileAlloc("blarg", NULL);
}

AUTO_COMMAND;
void debugPerf()
{
	globCmdParse("time 12");
	globCmdParse("timescale 0");
	globCmdParse("setCamPos 2400 180 2600");
	globCmdParse("setCamPYR 0 180 0");
	globCmdParse("showcampos 1");
	globCmdParse("show_frame_counters 1");
}

AUTO_STARTUP(GraphicsLibTest) ASTRT_DEPS(GraphicsLib, WorldLib);
void gfxTestStartup(void)
{

}

void libTest(HINSTANCE hInstance, int argc, char **argv)
{
	int i;
	Model *test_model=NULL;
	FrameLockedTimer* flt;
	const char* pcBindList = "keybinds/GraphicsLibTester.bindlist";

	RefSystem_Init();

	keybind_Init(conPrintf, NULL, quitProgram, "GraphicsLibTest");

	setGLTDefaultKeys();

	keybind_LoadUserBinds(pcBindList);

	globCmdParse("showfps 1");

	cmdParseCommandLine(argc, argv);

	gfxSetFeatures(GFEATURE_SHADOWS|GFEATURE_POSTPROCESSING|GFEATURE_OUTLINING|GFEATURE_DOF);
	if (!test_dynamics && !test_animation) {
		wlSetLoadFlags(wlGetLoadFlags() | WL_NO_LOAD_DYNFX | WL_NO_LOAD_DYNANIMATIONS | WL_NO_LOAD_COSTUMES);
	}

	AutoStartup_SetTaskIsOn("GraphicsLibTest", 1);
	DoAutoStartup();

	if (test_world) {
		//worldLoadWorldGrid("maps/Adventure_Zones/MID.worldgrid", "maps/Adventure_Zones/MID/MID.zone", false, false);
		worldLoadWorldGrid("maps/Master_Test_Map.worldgrid", "maps/Master_Test_Map/InteriorExteriorPreviewnator.zone", false, false);
		//worldLoadWorldGrid("maps/_test_maps/Sandbox/Sandbox.worldgrid", "maps/_test_maps/Sandbox/Sandbox/Sandbox_Map.zone", false, false);
		//worldLoadWorldGrid("maps/Action_Zones/XMA/Brotherhood_Reunited.worldgrid", "maps/Action_Zones/XMA/Brotherhood_Reunited/Brotherhood_Reunited.zone", false, false);
		//worldLoadWorldGrid("maps/Missions/MID/Frightful_Four.worldgrid", "maps/Missions/MID/Frightful_Four/FrightfulFour.zone", false, false);
	} else {
		globCmdParse("noDrawTerrain 1");
	}

	if (two_devices)
		num_devices = 2;

	for (i=0; i<num_devices; i++)
	{
		newDevice(hInstance);
	}






	if (test_postprocessing) {
		globCmdParse("comicShading 1");
		//globCmdParse("deferredlighting 1");
		//globCmdParse("outlining 1");
		//globCmdParse("postprocessing 1");
	}
	if (test_postprocessing_debug) {
		globCmdParse("MRTDebug 1");
	}

	frameLockedTimerCreate(&flt, 3000, 3000 / 60);

#ifdef _XBOX
	// DJR I disabled this because it makes the file system stat every file open operation, and
	// some of those happen in the main thread, causing big stalls on Xbox. However, this would
	// break the manual reloading of files, such as shaders, so I've put a call to this function
	// in reloadShaders, to reenable the stat and allow reloadShaders to work. This will cause
	// stalls after use of reloadShaders!
	//FolderCacheSetMode(FOLDER_CACHE_MODE_FILESYSTEM_ONLY); // CD: folder cache does not get updated on xbox yet
#endif
	FolderCacheEnableCallbacks(1);

	while (g_run && eaSize(&devices))
	{
		F32 elapsed;
		// Nothing goes above autoTimerTickBegin()!!!!!
		autoTimerTickBegin();

		gfxResetFrameCounters();

		frameLockedTimerStartNewFrame(flt, wlTimeGetStepScale());

		frameLockedTimerGetPrevTimes(flt, &elapsed, NULL, NULL);

#if TRACE_RECORDING
		if ( g_nDebugTrace == 2 )
		{
		}
#endif

		FolderCacheDoCallbacks();

#ifndef _XBOX
		if (kbhit()) {
			switch(getch()) {
			xcase 'a':
				printf("Adding a new device.\n");
				newDevice(hInstance);
			xcase 'b':
				reloadTestTexWord = 1;
			xcase 'd':
				printf("Deleting the most recent device.\n");
				removeDevice();
			xcase 'e':
				toggleMaterials();
			xcase 'l':
				memCheckDumpAllocs();
			xcase 'm':
				memMonitorDisplayStats();
				{
					extern int texMemoryUsage[2];
					extern U32 geoMemoryUsage;
					printf("Texture memory usage: %d\n", texMemoryUsage[0]);
					printf("Geometry memory usage: %d\n", geoMemoryUsage);
				}
			xcase 'r':
				toggleModels();
			xcase 't':
				rotate = !rotate;
			xcase '`':
			case '~':
				debugConsole();
			}
		}
#endif

		if (test_models)
			test_model = modelFindInGeoFile(test_model_name, test_model_filename, GEO_LOAD_BACKGROUND, WL_FOR_WORLD, NULL);

		if (test_dynamics) {
			/*
			if (bRunParticles && !bPauseParticles && dynManGetFxCount(pTestManager) == 0 )
				dynTestDyn(pTestManager);


			if ( bRunOneParticle )
			{
				dynTestDyn(pTestManager);
				bRunOneParticle = false;
			}
			*/
		}

#if !PROFILE_PERF
		//assert(heapValidateAllPeriodic(100));
#endif

		utilitiesLibOncePerFrame(elapsed, 1.0f);
		if (!bPauseParticles)
			worldLibOncePerFrame(elapsed);

		gfxOncePerFrame(elapsed, elapsed, false);
		updateBoxMat(elapsed);
		copyVec4(clearcolor, devices[0]->freecamera.clear_color);

		if (test_sprites) {
			BasicTexture *bind = texLoadBasic("ColorPicker", TEX_LOAD_IN_BACKGROUND, WL_FOR_UTIL|WL_FOR_UI);
			AtlasTex *atex = atlasLoadTexture("button_L");
			//display_sprite_tex(bind, 10, 10, 0, 0.2, 0.2, 0xFFFFFFFF);
			display_sprite(atex, 10, 120, 1, 1.0f, 1.0f, 0xFFFFFFFF);
			display_sprite_effect(atex, 140, 120, 1, 1.0f, 1.0f, 0xFFE8A6FF, RdrSpriteEffect_Desaturate, 0.9);
			display_sprite_tex(bind, 0, 0, 0, 1.f, 1.f, 0xFFFFFFFF); // Making sure the upper left corner is correct
			display_sprite_effect_tex(bind, 130, 0, 0, 1.f, 1.f, 0xFFE8A6FF, RdrSpriteEffect_Desaturate, 0.9); // Making sure the upper left corner is correct
		}

		if (test_texWords) {
			static bool inited=false;
			static BasicTexture *texWordTest;

			if (texWordTest && reloadTestTexWord) {
				reloadTestTexWord = 0;
				texUnloadDynamic(texWordTest);
				texWordTest = NULL;
			}
			if (!inited || !texWordTest) {
				TexWordParams *params = createTexWordParams();
				inited = true;
				eaPush(&params->parameters, "I Like");
				eaPush(&params->parameters, "MONKEYS!");
				texWordTest = texFindDynamic("test_dynamic", params, WL_FOR_UTIL, "noname.txt");
			}
			if (texWordTest) {
				display_sprite_tex(texWordTest, 120, 10, 0, 1, 1, 0xFFFFFFFF);
			}

			{
				BasicTexture *bind = texLoadBasic("test_dynamic2", TEX_LOAD_IN_BACKGROUND, WL_FOR_UTIL);
				display_sprite_tex(bind, 10, 240, 0, 1, 1, 0xFFFFFFFF);
				bind = texLoadBasic("test_texWords", TEX_LOAD_IN_BACKGROUND, WL_FOR_UTIL);
				display_sprite_tex(bind, 10, 240+130, 0, 1, 1, 0xFFFFFFFF);
			}
		}

		if (test_text) {
			int colors[] = {-1, -1, -1, -1};
			char *test_string = "The five boxing wizards jump quickly."; // Didn't know there were so many great pangrams
			gfxfont_PrintEx(&g_font_Sans, 30, 110, 0, 1.1, 1.1, 0, test_string, (U32)strlen(test_string), colors);
			//font_color(0xFFFFFFFF, 0xFFFFFFFF);
			//prnt(30,230, 0, 1.0, 1.0, "mousepos: %d %d", mousepos[0], mousepos[1]);
			g_font_Game.renderParams.outlineWidth = 4;
			setVec4same(colors, 0xFFFFFF7F);
			gfxfont_PrintEx(&g_font_Game, 30, 130, 0, 1.1, 1.1, 0, test_string, (U32)strlen(test_string), colors);

		}

		if (test_lods) {
			gfxfont_SetColorRGBA(0xFFFFFFFF, 0xFFFFFFFF);
			lod_test_distance_actual = lod_test_distance_actual + (lod_test_distance - lod_test_distance_actual) * MIN(elapsed, 0.5);
			gfxfont_Printf(10,20, 0, 1.0, 1.0, 0, "LOD distance: %1.1f", lod_test_distance_actual);
		}

		if (test_animation)
		{
			if (bCostumeChanged)
			{
				static DynDrawSkeleton* pTestDrawSkeletonSet[ MAX_TEST_SKELETONS ] = { NULL };
				static DynNode* pTestSkeletonDynNode[ MAX_TEST_SKELETONS ] = { NULL };
				int skeletonIndex;
				int maxActiveSkeletons = test_animation == 1 ? MAX_TEST_SKELETONS : 1;
				const WLCostume* pCostume = wlCostumeFromName(pcTestCostume);
				bCostumeChanged = false;
				for (skeletonIndex = 0; skeletonIndex < maxActiveSkeletons; ++skeletonIndex)
				{
					DynDrawSkeleton* pTestDrawSkeleton = pTestDrawSkeletonSet[skeletonIndex];
					DynSkeleton* pTestSkeleton = pTestSkeletonSet[skeletonIndex];
					if (!pTestSkeletonDynNode[skeletonIndex])
						pTestSkeletonDynNode[skeletonIndex] = dynNodeAlloc();
					if (pTestDrawSkeleton)
					{
						DynSkeleton* pSkeleton = pTestDrawSkeleton->pSkeleton;
						dynDrawSkeletonFree(pTestDrawSkeleton);
					}
					if (pTestSkeleton)
						dynSkeletonFree(pTestSkeleton);
					pTestSkeleton = dynSkeletonCreate(pCostume, true, false);
					if ( pTestSkeleton )
					{
						if (test_dynamics && skeletonIndex == 0) {
							if (pTestManager)
							{
								dynFxManDestroy(pTestManager, false);
							}
							
							pTestManager = dynFxManCreate(pTestSkeleton->pRoot, NULL, eFxManagerType_Entity, 0, 0);

							FOR_EACH_IN_EARRAY(pTestSkeleton->eaSqr, DynSequencer, pSqr)
								dynSequencerSetFxManager(pSqr, pTestManager);
							FOR_EACH_END;
							dynEngineSetTestManager(pTestManager);
						}

						pTestDrawSkeleton = dynDrawSkeletonCreate(pTestSkeleton, pCostume, pTestManager, true);
						
						{
							Mat4 skelMtx;

							dynNodeParent(pTestSkeleton->pRoot, pTestSkeletonDynNode[skeletonIndex]);
							copyMat4(unitmat, skelMtx);
							/*
							skelMtx[3][0] = (skeletonIndex % 8) * 4;
							skelMtx[3][2] = (skeletonIndex / 8) * 4;
							skelMtx[3][0] += 5.0f;
							*/
							dynNodeSetFromMat4(pTestSkeletonDynNode[skeletonIndex], skelMtx);
						}

						if (skeletonIndex == 0)
							dynDebugSetDebugSkeleton(pTestDrawSkeleton);
					}
					pTestDrawSkeletonSet[skeletonIndex] = pTestDrawSkeleton;
					pTestSkeletonSet[skeletonIndex] = pTestSkeleton;
				}
			}
		}

		if (test_primitives) {
			F32 size=20;
			Vec3 v000 = {0,0,0};
			Vec3 v100 = {size,0,0};
			Vec3 v010 = {0,size,0};
			Vec3 v001 = {0,0,size};
			Vec3 v011 = {0,size,size};
			Vec3 v111 = {size,size,size};
			Color c1 = {0x00, 0xFF, 0xFF, 0x00}, c2 = {0xFF, 0x00, 0xFF, 0xFF};
			gfxDrawLineEx(10, 10, 0, 100, 100, c1, c2, 2.f, true);
			//gfxDrawLineWidth(width - 10, 10, 10, height - 10, 0xFFFFFF00, 0xFF0000FF, 2.f);
			gfxDrawQuadARGB(20, 20, 100, 100, 1, 0x7FFFFFFF);
			gfxDrawLine3DARGB(v000, v100, 0xFFFF0000);
			gfxDrawLine3DARGB(v000, v010, 0xFF00FF00);
			gfxDrawLine3DARGB(v000, v001, 0xFF0000FF);
			//gfxDrawQuad3D(v000, v010, v011, v001, 0xFF00FF7F, 0);
			//gfxDrawBox3D(v000, v111, unitmat, 0x2FFF7F00, 0);
			scaleVec3(v100, 0.75, v100);
			scaleVec3(v010, 0.75, v010);
			scaleVec3(v001, 0.75, v001);
			gfxDrawTriangle3D_3ARGB(v000, v010, v001, 0x7F000000, 0x7F00FF00, 0x7F0000FF);
			gfxDrawTriangle3D_3ARGB(v000, v010, v100, 0x7F000000, 0x7F00FF00, 0x7FFF0000);
			gfxDrawTriangle3D_3ARGB(v000, v001, v100, 0x7F000000, 0x7F0000FF, 0x7FFF0000);
			{
				F32 size2=100;
				Vec2 cps[] = {{0,0}, {size2*2,0}, {0,size2}, {size2*2,size2}};
				gfxDrawBezier(cps, 0, c1, c2, 1.5f);
			}
		}

		for (i=0; i<eaSize(&devices); i++)
		{
			gfxSetActiveDevice(devices[i]->device);
			inpUpdateEarly(gfxGetActiveInputDevice());
			inpUpdateLate(gfxGetActiveInputDevice());

			gfxSetActiveProjection(45, -1, 0.73f, 20000.f);
			gfxRunActiveCameraController(-1, NULL);
			if (i==0)
				gfxTellWorldLibCameraPosition(); // Call this only on the primary camera

			gfxStartMainFrameAction(false, false, false, false);
			if (test_models)
				drawModelTest(test_model, box_matrix);

			gfxFillDrawList(!gfx_state.debug.no_draw_static_world, true);
			gfxDrawFrame();
			printf("");
		}

		gfxRunAuxDevices();
		gfxOncePerFrameEnd();

#if TRACE_RECORDING
		if ( g_nDebugTrace == 1 )
			g_nDebugTrace = 2;
		if ( g_nDebugTrace == 4 )
		{
			TraceStop();
			g_nDebugTrace = 0;

			OutputDebugStringf( "Trace completed\n" );
			g_nDebugTrace = 0;
		}
#endif
		// HEY YOU: Don't put anything after autoTimerTickEnd()!!!!!!
		autoTimerTickEnd();
		// Nothing goes down here.
	}

	// Log our key binds
	keybind_SaveUserBinds(pcBindList);

	frameLockedTimerDestroy(&flt);

	for (i=0; i<eaSize(&devices); i++) {
		gfxSettingsSave(devices[i]->device);
		gfxUnregisterDevice(devices[i]->device);
		rdrDestroyDevice(devices[i]->device);
	}

	worldLibShutdown();

	assert(heapValidateAll());
}


