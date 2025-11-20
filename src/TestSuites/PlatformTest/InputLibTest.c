#include "inputLib.h"
#include "inputGamepad.h"
#include "..\..\InputLib\input.h"
#include "RenderLibStub.h"

#if _PS3
#include <sysutil/sysutil_common.h>

static void sysutil_exit_callback(uint64_t status, uint64_t param, void* userdata);
#endif

extern WinDXInpDev *gInput;

typedef enum 
{
	StateTestInit = 0,
	StateTestLTrigger,
	StateTestRTrigger,
	StateTestLStickL,
	StateTestLStickU,
	StateTestRStickR,
	StateTestRStickD,

	StateTestStart,
	StateTestBack,
	StateTestA,
	StateTestB,
	StateTestX,
	StateTestY,
	StateTestLeftSh,
	StateTestRightSh,
	StateTestLeftTh,
	StateTestRightTh,

	StateTestEnd
} TestState;


void TestInputLib(void)
{
	RdrDevice*		rdr = DummyInitRdr();
	HINSTANCE		hInstance;
	KeyBindExec		bind = NULL;
	InputDevice*	inp_device = NULL;
	TestState		state = StateTestInit;

#if _XBOX || _PS3
	hInstance = NULL;
#else
	hInstance = (HINSTANCE)GetModuleHandle(NULL);
#endif
	
	inp_device = inpCreateInputDevice(rdr, hInstance, bind);

#if _PS3
	cellSysutilRegisterCallback(0, sysutil_exit_callback, NULL);
#endif

	// iterate through each test state
	while(state != StateTestEnd)
	{
		float x = 0.0f;
		float y = 0.0f;

		inpUpdateInternal();
		switch(state)
		{
		case(StateTestInit):
			printf("Press Left Trigger\n");
			state++;
			break;
		case(StateTestLTrigger):
			gamepadGetTriggerValues(&x,&y);
			if(x>0.5f)
			{
				printf("Press Right Trigger\n");
				state++;
			}
			break;
		case(StateTestRTrigger):
			gamepadGetTriggerValues(&x,&y);
			if(y>0.5f)
			{
				printf("Press Left Stick Left\n");
				state++;
			}
			break;

		case(StateTestLStickL):
			gamepadGetLeftStick(&x,&y);
			if(x < -0.5f)
			{
				printf("Press Left Stick Up\n");
				state++;
			}
			break;
		case(StateTestLStickU):
			gamepadGetLeftStick(&x,&y);
			if(y > 0.5f)
			{
				printf("Press Right Stick Right\n");
				state++;
			}
			break;
		case(StateTestRStickR):
			gamepadGetRightStick(&x,&y);
			if(x > 0.5f)
			{
				printf("Press Right Stick Down\n");
				state++;
			}
			break;
		case(StateTestRStickD):
			gamepadGetRightStick(&x,&y);
			if(y < -0.5f)
			{
				printf("Press Start Button\n");
				state++;
			}
			break;
		case(StateTestStart):
			if (gamepadGetButtonValue(INP_START))
			{
				printf("Press BackButton\n");
				state++;
			}
			break;


		case(StateTestBack):
			if (gamepadGetButtonValue(INP_SELECT))
			{
				printf("Press A Button\n");
				state++;
			}
			break;

		case(StateTestA):
			if (gamepadGetButtonValue(INP_AB))
			{
				printf("Press B Button\n");
				state++;
			}
			break;

		case(StateTestB):
			if (gamepadGetButtonValue(INP_BB))
			{
				printf("Press X Button\n");
				state++;
			}
			break;

		case(StateTestX):
			if (gamepadGetButtonValue(INP_XB))
			{
				printf("Press Y Button\n");
				state++;
			}
			break;
		
		case(StateTestY):
			if (gamepadGetButtonValue(INP_YB))
			{
				printf("Press Left Shoulder\n");
				state++;
			}
			break;
		
		case(StateTestLeftSh):
			if (gamepadGetButtonValue(INP_LB))
			{
				printf("Press Right Shoulder \n");
				state++;
			}
			break;
		
		case(StateTestRightSh):
			if (gamepadGetButtonValue(INP_RB))
			{
				printf("Press Left Thumb\n");
				state++;
			}
			break;

		case(StateTestLeftTh):
			if (gamepadGetButtonValue(INP_LSTICK))
			{
				printf("Press Right Thumb \n");
				state++;
			}
			break;
		
		case(StateTestRightTh):
			if (gamepadGetButtonValue(INP_RSTICK))
			{
//				printf("Press DPad Up\n");
				state++;
			}
			break;
		}
	}
	printf("InputLib test successful!\n");
}

#if _PS3
void sysutil_exit_callback(uint64_t status, uint64_t param, void* userdata)
{
	(void) param;
	(void) userdata;

	switch(status) {
	case CELL_SYSUTIL_REQUEST_EXITGAME:

		break;
	case CELL_SYSUTIL_DRAWING_BEGIN:
	case CELL_SYSUTIL_DRAWING_END:
	case CELL_SYSUTIL_SYSTEM_MENU_OPEN:
	case CELL_SYSUTIL_SYSTEM_MENU_CLOSE:
	case CELL_SYSUTIL_BGMPLAYBACK_PLAY:
	case CELL_SYSUTIL_BGMPLAYBACK_STOP:
	default:
		break;
	}
}
#endif