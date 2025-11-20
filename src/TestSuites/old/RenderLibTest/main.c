#include "SuperAssert.h"
#include "winutil.h"
#include "mathutil.h"
#include "crypt.h"
#include "sysutil.h"
#include "utils.h"
#include "error.h"
#include "FolderCache.h"
#include "BitStream.h"
#include "netio.h"
#include "file.h"
#include "timing.h"

#ifdef _XBOX
#include "XRenderLib.h"
#pragma comment(lib, "\\Program Files\\Microsoft Xbox 360 SDK\\lib\\xbox\\Xonline.lib")
#pragma comment(lib, "\\Program Files\\Microsoft Xbox 360 SDK\\lib\\xbox\\xboxkrnl.lib")
#pragma comment(lib, "\\Program Files\\Microsoft Xbox 360 SDK\\lib\\xbox\\xbdm.lib")
#else
#include "GLRenderLib.h"
#endif
#include "RdrTexture.h"

#include "inputLib.h"
#include "inputMouse.h"
#include "inputXbox.h"
#include "soundLib.h"

#include "Resource.h"

#ifdef _XBOX
#define TWO_DEVICES 0
#define DRAW_PRIMITIVE 1
#define DRAW_3D 1
#define DRAW_CURSOR 1
#define RUN_THREADED 1
#define DO_INPUT 1
#define DO_SOUND 0
#define DO_SIMPLE_XBOXTEST 0
#else
#define TWO_DEVICES 0
#define DRAW_PRIMITIVE 1
#define DRAW_3D 1
#define DRAW_CURSOR 1
#define RUN_THREADED 0
#define DO_INPUT 1
#define DO_SOUND 1
#define DO_SIMPLE_XBOXTEST 0
#endif
static void libTest(HINSTANCE hInstance);
static void updateBox(RdrDevice *device, GeoHandle geo);
#if DO_SIMPLE_XBOXTEST
void simpleXBoxTest(void);
#endif

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
			sprintf(author, "%s is Responsible", temp);
		else 
			strcpy(author, temp);
	}
	rdrSafeErrorMsg(errMsg, 0, author[0]? author: NULL, errorWasForceShown());
}

void clientFatalErrorfCallback(char* errMsg)
{
	rdrSafeErrorMsg(errMsg, "Fatal Error", 0, 1);
	assertmsg(0, errMsg);
}

void clientErrorfCallback(char* errMsg)
{
	printf("%s\n", errMsg);
	GimmeErrorDialog(errMsg);
}

#ifdef _XBOX
int main(int argc, char** argv)
{
	HINSTANCE hInstance = 0;
	EXCEPTION_HANDLER_BEGIN
#else
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
{
	EXCEPTION_HANDLER_BEGIN
		memCheckInit();
		newConsoleWindow();
		showConsoleWindow();
#endif
		FolderCacheChooseMode();

		fileDataDir();

		ErrorfSetCallback(clientErrorfCallback);
		FatalErrorfSetCallback(clientFatalErrorfCallback);

		FolderCacheChooseMode();
		FolderCacheEnableCallbacks(0);
		FolderCacheSetManualCallbackMode(1);
		bsAssertOnErrors(true);
		disableRtlHeapChecking(NULL);
		setAssertMode(ASSERTMODE_DEBUGBUTTONS);

		logSetDir("game");
		errorLogStart();
		cryptAdler32Init();
		atexit(packetShutdown);

#if DO_SIMPLE_XBOXTEST
		simpleXBoxTest();
#else
		libTest(hInstance);
#endif
	EXCEPTION_HANDLER_END

	return 0;
}

//////////////////////////////////////////////////////////////////////////


static int g_run = 1, g_hide = 0, g_boxwireframe = 0, g_primwireframe = 0;
static Vec3 g_campos={0,0,80}, g_pyr;

static int testOkToInput(int keyScanCode, int state, int x, int y )
{
	return 1;
}

static int testExecKey(int keyScanCode, int state, U32 timeStamp, int x, int y )
{
	if (state)
	{
		switch (keyScanCode)
		{
			xcase INP_H:
			case INP_YB:
				g_hide = 1;
			xcase INP_R:
			case INP_AB:
				g_boxwireframe = 2;
			xcase INP_XB:
				g_boxwireframe = 1;
			xcase INP_BB:
				g_primwireframe = 1;
			xcase INP_W:
				g_campos[2] -= 2;
			xcase INP_S:
				g_campos[2] += 2;
			xcase INP_A:
				g_campos[0] += 2;
			xcase INP_D:
				g_campos[0] -= 2;
			xcase INP_E:
				g_campos[1] += 2;
			xcase INP_C:
				g_campos[1] -= 2;
			xcase INP_CLOSEWINDOW:
				g_run = 0;
#if DO_SOUND
			xcase INP_P:
				sndPlay("testtone",SOUND_GAME);
#endif
		}
	}
	else
	{
		switch (keyScanCode)
		{
			xcase INP_H:
			case INP_YB:
				g_hide = 0;
			xcase INP_R:
			case INP_AB:
				g_boxwireframe = 0;
			xcase INP_XB:
				g_boxwireframe = 0;
			xcase INP_BB:
				g_primwireframe = 0;
		}
	}
	return 1;
}

//////////////////////////////////////////////////////////////////////////

static void hwcursorBlit(RdrDevice *device, RdrSurface *cursor_surf, TexHandle tex, int width, int height, F32 x, F32 y, F32 scale, Color clr)
{
	RdrSpritesPkg *pkg;
	RdrSpriteState *cmd;
	RdrSpriteVertex *vertices;
	F32	x1, x2, y1, y2, u1, u2, v1, v2;
	int	v_size;
	int cursor_size = rdrGetCursorSize(device);

	pkg = rdrStartDrawSprites(device, 1, cursor_size, cursor_size, &cmd, &vertices);

/*	if (!supportsGdiPlus() && !game_state.compatibleCursors)
	{
		x += (cursor_size/2) - curr_hotspot_x;
		y += (cursor_size/2) - curr_hotspot_y;
	}
*/
	rdrSurfaceGetVirtualSize(cursor_surf, 0, &v_size);

//	width = MIN(width, bind->width);
//	height = MIN(height, bind->height);

	width = (int)(scale * width);
	height = (int)(scale * height);

	x1 = x;
	x2 = x + width;
	y1 = v_size - y;
	y2 = v_size - (y + height);

//	tex = atlasDemandLoadTexture(bind);

	u1 = v1 = 0;
	u2 = v2 = 1;
//	atlasGetModifiedUVs(tex, 0, 0, &u1, &v1);
//	atlasGetModifiedUVs(tex, 1, 1, &u2, &v2);

	cmd->tex_handle = tex;
	cmd->additive = 0;
	cmd->use_scissor = 0;

	// increase x first
	vertices[0].point[0] = x1;
	vertices[0].point[1] = y1;
	vertices[0].point[2] = 0;
	colorToVec4(vertices[0].color, clr);
	vertices[0].texcoord[0] = u1;
	vertices[0].texcoord[1] = v1;

	vertices[1].point[0] = x2;
	vertices[1].point[1] = y1;
	vertices[1].point[2] = 0;
	colorToVec4(vertices[1].color, clr);
	vertices[1].texcoord[0] = u2;
	vertices[1].texcoord[1] = v1;

	vertices[2].point[0] = x2;
	vertices[2].point[1] = y2;
	vertices[2].point[2] = 0;
	colorToVec4(vertices[2].color, clr);
	vertices[2].texcoord[0] = u2;
	vertices[2].texcoord[1] = v2;

	vertices[3].point[0] = x1;
	vertices[3].point[1] = y2;
	vertices[3].point[2] = 0;
	colorToVec4(vertices[3].color, clr);
	vertices[3].texcoord[0] = u1;
	vertices[3].texcoord[1] = v2;

	rdrEndDrawSprites(device);
}

static void setupCursor(RdrDevice *device, RdrSurface *cursor_surface)
{
	U32 byte_count;
	RdrTexParams *params;
	TexHandle white = rdrGenTexHandle();

	rdrLockActiveDevice(device);

	// create white texture
	params = rdrStartUpdateTexture(device, white, RTEX_2D, RTEX_LA_U8, 1, 1, 1, 1, &byte_count);
	memset(params+1, 0xffffffff, byte_count);
	rdrEndUpdateTexture(device);

	rdrSurfaceSetActive(cursor_surface);
	rdrClearActiveSurface(device, CLEAR_COLOR|CLEAR_DEPTH, zerovec4, 1);
	hwcursorBlit(device, cursor_surface, white, 10, 10, 0, 5, 1, CreateColor(255, 255, 0, 255));
	rdrSetCursorFromActiveSurface(device, 0, 0, 0);
	rdrShowCursor(device, 1);

	rdrUnlockActiveDevice(device);
}

//////////////////////////////////////////////////////////////////////////

static RdrSurface *createCursorSurface(RdrDevice *device)
{
	RdrSurface *surface;
	RdrSurfaceParams surfaceparams = {0};
	surfaceparams.flags = SF_ALPHA;
	surfaceparams.width = surfaceparams.height = rdrGetCursorSize(device);
	surfaceparams.desired_multisample_level = 1;
	surfaceparams.required_multisample_level = 1;

	rdrLockActiveDevice(device);
	surface = rdrCreateSurface(device, &surfaceparams);
	rdrUnlockActiveDevice(device);
	return surface;
}

static void libTest(HINSTANCE hInstance)
{
	WindowCreateParams params={0};
	RdrDevice *device1;
	InputDevice *inpdev1=0;
	RdrSurface *surface, *cursor_surface=0;
	RdrPrimitive prim = {0};
	GeoHandle box_handle;
	RdrMaterial box_material={0};
	RdrMaterial *material_ptr;
	RdrDrawList *draw_list;
	RdrAddModelParams model_params={0};
	TexHandle box_texture;
	FastMat4 box_matrix = {0};
	Vec3 box_mid = {0};
#if TWO_DEVICES
	RdrDevice *device2;
	InputDevice *inpdev2=0;
#endif
	GfxResolution *desktop_res;
	Vec4 clearvec = {0,0,0,0};
	U32 frame_timer;

	frame_timer = timerAlloc();
	timerStart(frame_timer);

	FolderCacheEnableCallbacks(1);

	rdrGetSupportedResolutions(&desktop_res);
#ifdef _XBOX
	params.width = desktop_res->width;
	params.height = desktop_res->height;
#else
	params.width = 640;
	params.height = 480;
#endif
	params.xpos = 0;
	params.ypos = 0;

#ifdef _XBOX
	device1 = rdrCreateDeviceXBox(&params, hInstance, 0, RUN_THREADED);
#else
	device1 = rdrCreateDeviceWinGL(&params, hInstance, 0, RUN_THREADED);
#endif
	if (!device1)
		return;
#if DO_INPUT
	inpdev1 = inpCreateInputDevice(device1,hInstance,testOkToInput,testExecKey);
#endif
	rdrSetTitle(device1, "Cryptic App");
	rdrSetIcon(device1, IDI_CRYPTIC);

#if TWO_DEVICES
	params.ypos += params.height + 30;
#ifdef _XBOX
	device2 = rdrCreateDeviceXBox(&params, hInstance, 0, RUN_THREADED);
#else
	device2 = rdrCreateDeviceWinGL(&params, hInstance, 0, RUN_THREADED);
#endif
	if (!device2)
		return;
#if DO_INPUT
	inpdev2 = inpCreateInputDevice(device2,hInstance,testOkToInput,testExecKey);
#endif
	rdrSetTitle(device2, "LibTester App");
	rdrSetIcon(device2, IDI_LIBTESTER);
#endif

#if DO_SOUND
	sndInit((HWND)rdrGetWindowHandle(device1)); //sound needs to be bound to a certain window
#endif

	prim.in_3d = 1;
	prim.linewidth = 2;
	setVec3(prim.vertices[0].pos, -10, -10, 0);
	setVec3(prim.vertices[1].pos, 10, -10, 0);
	setVec3(prim.vertices[2].pos, 10, 10, 0);
	setVec3(prim.vertices[3].pos, -10, 10, 0);
	setVec4(prim.vertices[0].color, 1, 0, 0, 0.5f);
	setVec4(prim.vertices[1].color, 1, 1, 0, 0.5f);
	setVec4(prim.vertices[2].color, 1, 0, 1, 0.5f);
	setVec4(prim.vertices[3].color, 0, 0, 1, 0.5f);
	prim.type = RP_QUAD;
	prim.screen_width_2d = prim.screen_height_2d = 60;

#if DRAW_CURSOR
	cursor_surface = createCursorSurface(device1);
	setupCursor(device1, cursor_surface);
#endif

	box_handle = rdrGenGeoHandle();
	box_material.has_bump_map = 0;
	box_material.need_alpha_sort = 0;
	box_material.shader = 0;
	box_material.tex_count = 1;
	box_texture = 0;
	box_material.textures = &box_texture;
	setFastMat4Columnf(FASTPTR(box_matrix), 0, 1, 0, 0);
	setFastMat4Columnf(FASTPTR(box_matrix), 1, 0, 1, 0);
	setFastMat4Columnf(FASTPTR(box_matrix), 2, 0, 0, 1);
	setFastMat4Columnf(FASTPTR(box_matrix), 3, 0, 0, 0);

#if DRAW_3D
	rdrLockActiveDevice(device1);
	updateBox(device1, box_handle);
	rdrUnlockActiveDevice(device1);

#if TWO_DEVICES
	rdrLockActiveDevice(device2);
	updateBox(device2, box_handle);
	rdrUnlockActiveDevice(device2);
#endif
#endif

	draw_list = rdrCreateDrawList();

	while (g_run)
	{
		int width, height;
		F32 elapsed = timerElapsedAndStart(frame_timer);

		FolderCacheDoCallbacks();

#if DO_INPUT
		inpUpdate(inpdev1);
#endif
		rdrProcessMessages(device1);

		{
			F32 xdiff, ydiff;
			gamepadGetLeftStick(&xdiff, &ydiff);
			g_pyr[1] += elapsed * xdiff;
			g_pyr[0] += elapsed * ydiff;

			gamepadGetRightStick(&xdiff, &ydiff);
			g_campos[2] -= elapsed * ydiff * 15.f;
		}
		if (mouseIsDown(MS_LEFT))
		{
			int xdiff, ydiff;
			mouseDiff(&xdiff, &ydiff);
			g_pyr[1] += xdiff * 0.005f;
			g_pyr[0] += ydiff * 0.005f;
			mouseLockThisFrame();
		}
		else if (mouseIsDown(MS_RIGHT))
		{
			int xdiff, ydiff;
			mouseDiff(&xdiff, &ydiff);
			g_campos[2] += ydiff * 0.25f;
			mouseLockThisFrame();
		}

		if (g_campos[2] < 0)
			g_campos[2] = 0;
		if (g_pyr[0] > PI*0.5f)
			g_pyr[0] = PI*0.5f;
		if (g_pyr[0] < -PI*0.5f)
			g_pyr[0] = -PI*0.5f;

#if TWO_DEVICES
#if DO_INPUT
		inpUpdate(inpdev2);
#endif
		rdrProcessMessages(device2);
#endif

		rdrClearDrawList(draw_list);
		setVec4(model_params.color[0].rgba, 255, 255, 255, 255);
		setVec4(model_params.color[1].rgba, 255, 255, 255, 255);
		model_params.distance_offset = 0;
		model_params.geometry = box_handle;
		model_params.material_count = 1;
		material_ptr = &box_material;
		model_params.materials = &material_ptr;
		model_params.wireframe = g_boxwireframe;
		model_params.debug_model_backpointer = (void *)1;
		rdrDrawListAddModel(draw_list, box_matrix, box_mid, &model_params);



		surface = rdrGetPrimarySurface(device1);
		rdrSurfaceGetSize(surface, &width, &height);
		rdrSetupPerspectiveProjection(FASTPTR(surface->projection_matrix), 55, ((F32)width)/height, 0.73f, 20000.f);
		createMat3PYR(surface->camera_matrix, g_pyr);
		mulVecMat3(g_campos, surface->camera_matrix, surface->camera_matrix[3]);
		rdrSurfaceUpdateMatrices(surface);

#if DRAW_3D
		rdrSortDrawList(device1, draw_list, surface->view_matrix);
#endif

		rdrLockActiveDevice(device1);
		rdrClearActiveSurface(device1, CLEAR_DEFAULT, clearvec, 1.f);
#if DRAW_3D
		rdrDrawOpaqueObjects(device1, draw_list);
		rdrDrawAlphaObjects(device1, draw_list);
#endif
#if DRAW_PRIMITIVE
		prim.filled = !g_primwireframe;
		if (!g_hide)
			rdrDrawPrimitive(device1, &prim);
#endif
		rdrFrameFinished(device1);
		rdrUnlockActiveDevice(device1);

#if TWO_DEVICES
		surface = rdrGetPrimarySurface(device2);
		rdrSurfaceGetSize(surface, &width, &height);
		rdrSetupPerspectiveProjection(FASTPTR(surface->projection_matrix), 55, ((F32)width)/height, 0.73f, 20000.f);
		copyVec3(g_campos, surface->camera_matrix[3]);
		rdrSurfaceUpdateMatrices(surface);

#if DRAW_3D
		rdrSortDrawList(device2, draw_list, surface->view_matrix);
#endif

		rdrLockActiveDevice(device2);
		rdrClearActiveSurface(device2, CLEAR_DEFAULT, zerovec4, 1.f);
#if DRAW_3D
		rdrDrawOpaqueObjects(device2, draw_list);
		rdrDrawAlphaObjects(device2, draw_list);
#endif
#if DRAW_PRIMITIVE
		if (!g_hide)
			rdrDrawPrimitive(device2, &prim);
#endif
		rdrFrameFinished(device2);
		rdrUnlockActiveDevice(device2);		
#endif

		// This is the right place to call sndUpdate, and the ambient sound update function
	}

	rdrFreeDrawList(draw_list);

	rdrDestroyDevice(device1);
#if TWO_DEVICES
	rdrDestroyDevice(device2);
#endif
	sndExit();
}

static F32 box_verts[] = { -8,0,8, 8,0,8, -8,0,-8, 8,0,-8, -8,16,8, 8,16,8, -8,16,-8, 8,16,-8 };
static F32 box_tcs[] = { 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0 };
static F32 box_norms[] = { 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0 };
static int box_tris[] = { 0,2,3, 3,1,0, 4,5,7, 7,6,4, 0,1,5, 5,4,0, 1,3,7, 7,5,1, 3,2,6, 6,7,3, 2,0,4, 4,6,2 };

static void updateBox(RdrDevice *device, GeoHandle geo)
{
	int i;
	U8 *extra_data_ptr;
	RdrGeometryData *data;
	U32 tri_size = 12 * 3 * sizeof(int);
	U32 subobj_size = sizeof(int);
	int usage = RUSE_POSITIONS | RUSE_NORMALS | RUSE_TEXCOORDS;
	RdrVertexDeclaration *decl = rdrGetVertexDeclaration(usage);
	U32 byte_count = tri_size + subobj_size + subobj_size + decl->stride * 8;

	// generate normals
	for (i=0; i<ARRAY_SIZE(box_verts)/3; i++) {
		copyVec3(&box_verts[i*3], &box_norms[i*3]);
		normalVec3(&box_norms[i*3]);
	}
	// generate texture coordinates
	for (i=0; i<ARRAY_SIZE(box_verts)/3; i++) {
		int sx = box_verts[i*3+0]>0;
		int sy = box_verts[i*3+1]>0;
		int sz = box_verts[i*3+2]>0;
		box_tcs[i*2+0] = sx;
		box_tcs[i*2+1] = sy;
		if (1 && sz) {
			box_tcs[i*2+0] = !box_tcs[i*2+0];
			box_tcs[i*2+1] = !box_tcs[i*2+1];
		}
	}

	data = rdrStartUpdateGeometry(device, geo, usage, byte_count);
	extra_data_ptr = (U8 *)(data+1);

	data->tri_count = 12;

	data->tris = (int *)extra_data_ptr;
	memcpy(data->tris, box_tris, tri_size);
	extra_data_ptr += tri_size;
	
	data->subobject_count = 1;

	data->subobject_tri_counts = (int *)extra_data_ptr;
	data->subobject_tri_counts[0] = 12;
	extra_data_ptr += subobj_size;
	
	data->subobject_tri_bases = (int *)extra_data_ptr;
	data->subobject_tri_bases[0] = 0;
	extra_data_ptr += subobj_size;

	data->vert_count = 8;
	data->vert_data = extra_data_ptr;

	for (i = 0; i < data->vert_count; i++)
	{
		memcpy(extra_data_ptr + decl->position_offset, box_verts + i * 3, sizeof(Vec3));
		memcpy(extra_data_ptr + decl->normal_offset, box_norms + i * 3, sizeof(Vec3));
		memcpy(extra_data_ptr + decl->texcoord_offset, box_tcs + i * 2, sizeof(Vec2));
		extra_data_ptr += decl->stride;
	}

	rdrEndUpdateGeometry(device);
}

