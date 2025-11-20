#if 0
#include "fmod.h"
#include "fmod_errors.h"
#include "soundLib.h"
#include "earray.h"
#include "../../libs/SoundLib/sndSource.h"
#include "../../libs/SoundLib/sndLibPrivate.h"

#if _PS3
#include "fmodps3.h"
#include <cell/spurs.h>
extern CellSpurs* GetPs3SpursInstance(void);
#elif _WIN32
#include "wininclude.h"
#endif

extern void SoundTestFmodEventSys();


static FMOD_SYSTEM  *fmodSystem = 0;
static FMOD_SOUND   *fmodSound = 0;
static FMOD_CHANNEL *fmodChannel  = 0;

#define ERRCHECK(a) SoundTestFmodErrCheck(a)

static void SoundTestFmodErrCheck(FMOD_RESULT result)
{
    if (result != FMOD_OK)
    {
        printf("FMOD error! (%d) %s\n", result, FMOD_ErrorString(result));
        exit(-1);
    }
}


int SoundTestInit()
{
    FMOD_RESULT    result;
    unsigned int   version;

#if 0
    // INITIAL DISPLAY MODE HAS TO BE SET BY RUNNING SETMONITOR.SELF
    if (!Common_Init())
    {
        return -1;
    }
#endif

    // Create a System object and initialize.
    result = FMOD_System_Create(&fmodSystem);
    SoundTestFmodErrCheck(result);

    result = FMOD_System_GetVersion(fmodSystem,&version);
    SoundTestFmodErrCheck(result);

    if (version < FMOD_VERSION)
    {
        printf("Error!  You are using an old version of FMOD %08x.  This program requires %08x\n", version, FMOD_VERSION);
        return -1;
    }

#if _PS3
    {
        FMOD_PS3_EXTRADRIVERDATA extradriverdata;

        memset(&extradriverdata, 0, sizeof(FMOD_PS3_EXTRADRIVERDATA));

        CellSpurs* spurs = GetPs3SpursInstance();
        extradriverdata.spurs = spurs;                                /* Using SPURS */

        result = FMOD_System_Init(fmodSystem, 1, FMOD_INIT_NORMAL, (void *)&extradriverdata);
        SoundTestFmodErrCheck(result);
    }
#else
    result = FMOD_System_Init(fmodSystem, 1, FMOD_INIT_NORMAL, NULL);
    SoundTestFmodErrCheck(result);
#endif

    return 0;
}

void SoundTestShutdown()
{
    FMOD_RESULT    result;
    result = FMOD_System_Close(fmodSystem);
    SoundTestFmodErrCheck(result);
    result = FMOD_System_Release(fmodSystem);
    SoundTestFmodErrCheck(result);
}
void SoundTestFmod()
{
    unsigned int   ms       = 0;
    unsigned int   lenms    = 0;
    FMOD_BOOL      playing  = false;
    FMOD_BOOL      paused   = false;
//    int            err;
    FMOD_RESULT    result;

    if ( 0 > SoundTestInit() )
    {
        return;
    }

    result = FMOD_System_CreateSound(fmodSystem, "/app_home/wave.mp3", FMOD_CREATESTREAM | FMOD_SOFTWARE | FMOD_LOOP_NORMAL | FMOD_2D, 0, &fmodSound);
    SoundTestFmodErrCheck(result);

    result = FMOD_System_PlaySound(fmodSystem, FMOD_CHANNEL_FREE, fmodSound, false, &fmodChannel);

    SoundTestFmodErrCheck(result);

    while (true)
    {
        FMOD_System_Update(fmodSystem);

        //Common_Update();

        /*
        if (gPressedButtons & PAD_BUTTON_CROSS)
        {
            bool paused;
            FMOD_Channel->getPaused(&paused);
            channel->setPaused(!paused);
        }

        if (gPressedButtons & PAD_BUTTON_START)
        {
            break;
        }
        */

        if (fmodChannel)
        {
            FMOD_SOUND *currentsound = 0;

            result = FMOD_Channel_IsPlaying(fmodChannel, &playing);
            if ((result != FMOD_OK) && (result != FMOD_ERR_INVALID_HANDLE) && (result != FMOD_ERR_CHANNEL_STOLEN))
            {
                SoundTestFmodErrCheck(result);
            }

            result = FMOD_Channel_GetPaused(fmodChannel, &paused);
            if ((result != FMOD_OK) && (result != FMOD_ERR_INVALID_HANDLE) && (result != FMOD_ERR_CHANNEL_STOLEN))
            {
                SoundTestFmodErrCheck(result);
            }

            result = FMOD_Channel_GetPosition(fmodChannel, &ms, FMOD_TIMEUNIT_MS);
            if ((result != FMOD_OK) && (result != FMOD_ERR_INVALID_HANDLE) && (result != FMOD_ERR_CHANNEL_STOLEN))
            {
                SoundTestFmodErrCheck(result);
            }
            
            FMOD_Channel_GetCurrentSound(fmodChannel, &currentsound);
            if (currentsound)
            {
                result = FMOD_Sound_GetLength(currentsound, &lenms, FMOD_TIMEUNIT_MS);
                if ((result != FMOD_OK) && (result != FMOD_ERR_INVALID_HANDLE) && (result != FMOD_ERR_CHANNEL_STOLEN))
                {
                    SoundTestFmodErrCheck(result);
                }
            }
        }

        printf("SountTest: Time %02d:%02d:%02d/%02d:%02d:%02d : %s\r", ms / 1000 / 60, ms / 1000 % 60, ms / 10 % 100, lenms / 1000 / 60, lenms / 1000 % 60, lenms / 10 % 100, paused ? "Paused " : playing ? "Playing" : "Stopped");
    }

    // Shut down
    result = FMOD_Sound_Release(fmodSound);
    SoundTestFmodErrCheck(result);

    SoundTestShutdown();
}

void sndSetupFakeOptions(void)
{
	g_audio_state.options.main_volume = 1.0;
	g_audio_state.options.fx_volume = 1.0;
	g_audio_state.options.amb_volume = 1.0;
	g_audio_state.options.music_volume = 1.0;
	g_audio_state.options.voice_volume = 1.0;
	g_audio_state.options.ui_volume = 1.0;
	g_audio_state.ui_volumes.main_volume = 1.0;
	g_audio_state.ui_volumes.fx_volume = 1.0;
	g_audio_state.ui_volumes.amb_volume = 1.0;
	g_audio_state.ui_volumes.music_volume = 1.0;
	g_audio_state.ui_volumes.voice_volume = 1.0;
	g_audio_state.ui_volumes.ui_volume = 1.0;
}

void SoundTestSoundLib()
{
    Vec3 pos = { 0.0f, 0.0f, 0.0f };
    Vec3 vel = { 0.0f, 0.0f, 0.0f };
    Vec3 fwd = { 0.0f, 0.0f, 0.0f };
    Vec3 up  = { 0.0f, 1.0f, 0.0f };
    float elapsedTime = 0.0f;
	SoundSource *source;

	g_audio_state.d_useNetListener = 1;
	g_audio_state.active_volume = 1;
	sndSetupFakeOptions();
    sndInit();

	source = sndPlayAtCharacter("TestProject/Pulse", NULL, -1, NULL, NULL);
	source->emd->ignore3d = 1;

	while(eaSize(&space_state.sources))
	{
		sndLibOncePerFrame(elapsedTime);
		Sleep(15);
	}

    sndShutdown();

    printf("Sound Lib Shutdown \n");
}

int SoundTest(void)
{

    //SoundTestFmodEventSys();
    //SoundTestFmod();
    SoundTestSoundLib();


    printf("\n** Finished **\n");

    return 0;
}

#endif