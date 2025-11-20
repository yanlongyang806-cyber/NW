#if 0
#if _PS3
#include "fmodps3.h"
#include <cell/spurs.h>
#endif

#include "fmod.hpp"
#include "fmod_event.hpp"
#include "fmod_errors.h"
#include "soundLib.h"

extern "C"
{
void SoundTestFmodEventSys();
#if _PS3
extern CellSpurs* GetPs3SpursInstance(void);
#endif
}

#define ERRCHECK(a) SoundTestFmodErrCheck(a)

static void SoundTestFmodErrCheck(FMOD_RESULT result)
{
    if (result != FMOD_OK)
    {
        printf("FMOD error! (%d) %s\n", result, FMOD_ErrorString(result));
        exit(-1);
    }
}


void SoundTestFmodEventSys()
{
    FMOD_RESULT        result;
    FMOD::EventSystem *eventsystem;
    //FMOD::EventGroup  *eventgroup;
    //FMOD::Event       *event;
    //int                err;
    //FMOD_PS3_EXTRADRIVERDATA extradriverdata;
    unsigned int    version;
    FMOD::System *sys;
/*
    if ( debugGlobals )
    {
        FMOD::gGlobal->gSystemHead->initNode();
    }
*/
    ERRCHECK(result = FMOD::EventSystem_Create(&eventsystem));
    ERRCHECK(result = eventsystem->getSystemObject(&sys));
    ERRCHECK(result = sys->getVersion(&version));
    printf("FMOD version %x\n", version );

#if _PS3
    FMOD_PS3_EXTRADRIVERDATA extradriverdata;
    memset(&extradriverdata, 0, sizeof(FMOD_PS3_EXTRADRIVERDATA));
    CellSpurs* spurs = GetPs3SpursInstance();
    extradriverdata.spurs = spurs;                                /* Using SPURS */

    ERRCHECK(result = eventsystem->init(64, FMOD_INIT_NORMAL, (void *)&extradriverdata, FMOD_EVENT_INIT_NORMAL));
#endif
    /*
    ERRCHECK(result = eventsystem->setMediaPath(MEDIA_PATH));
    ERRCHECK(result = eventsystem->load("examples.fev", 0, 0));
    ERRCHECK(result = eventsystem->getGroup("examples/FeatureDemonstration/SequencingAndStitching", FMOD_EVENT_DEFAULT, &eventgroup));
    */

}
#endif