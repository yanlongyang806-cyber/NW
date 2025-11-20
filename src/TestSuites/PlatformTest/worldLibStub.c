/***************************************************************************
*     Copyright (c) 2008, Cryptic Studios
*     All Rights Reserved
*     Confidential Property of Cryptic Studios
***************************************************************************/

#include "wininclude.h"
#include "WorldLib.h"
#include "WorldColl.h"
#include "ZoneMapLayer.h"
#include "WorldCellEntry.h"
#include "wlVolumes.h"
#include "dynFxParticle.h"
#include "dynFxInfo.h"

#if _WIN32
#pragma warning(disable:6387)
#endif

U32 wl_frame_timestamp = 0;
CRITICAL_SECTION model_unpack_cs;


const char *layerGetFilename(NN_PTR_GOOD const ZoneMapLayer *layer)
{
    return NULL;
}

U32 wlVolumeTypeNameToBitMask(SA_PRE_NNS SA_POST_NNS const char *volume_type)
{
    return 0;
}
const WorldVolume **wlVolumeCacheQuerySphereByType(NN_PTR_GOOD WorldVolumeQueryCache *query_cache, NN_PTR_GOOD_BYTES(sizeof(Vec3)) const Vec3 world_mid, F32 radius, U32 volume_type)
{
    return NULL;
}
void *wlVolumeGetVolumeData(NN_PTR_GOOD const WorldVolume *volume)
{
    return NULL;
}

static int wlStatusPrintfDefault(const char *fmt, ...)
{
	int result;
	va_list argptr;

	va_start(argptr, fmt);
	result = vprintf_timed(fmt, argptr);
	va_end(argptr);
	printf("\n");

	return result;
}
PrintfFunc wlStatusPrintf = wlStatusPrintfDefault;

F32 wlTimeGet(void)
{
	//return wl_state.time;
    return 0.0f;
}
void worldLibSetSoundFunctions(CreateSoundFunc create_sound_func, 
							   RemoveSoundFunc remove_sound_func, 
							   SoundValidateFunc sound_validate_func,
							   SoundRadiusFunc sound_radius_func,
							   SoundDirFunc sound_dir_func,
							   SoundVolumeUpdateFunc sound_volume_create_func,
							   SoundVolumeDestroyFunc sound_volume_destroy_func,
							   SoundConnUpdateFunc sound_conn_create_func,
							   SoundConnDestroyFunc sound_conn_destroy_func,
							   SoundEventExistsFunc sound_event_exists_func,
							   SoundGetProjectFileByEventFunc sound_get_project_file_by_event_func)
{
}
void worldLibSetSndCallbacks(UnloadMapGameCallback unload_map_callback, LoadMapGameCallback load_map_callback)
{
}
WorldVolumeQueryCache *wlVolumeQueryCacheCreate_dbg(U32 query_type, void *query_data MEM_DBG_PARMS)
{
    return NULL;
}
U32 wlVolumeQueryCacheTypeNameToBitMask(SA_PRE_NNS SA_POST_NNS const char *query_type)
{
    return 0;
}
F32 wlVolumeGetSize(NN_PTR_GOOD const WorldVolume *volume)
{
    return 0.0f;
}
void dynFxSetSoundStartFunc(dynFxSoundCreateFunc func)
{
}
void dynFxSetSoundStopFunc(dynFxSoundDestroyFunc func)
{
}
void dynFxSetSoundCleanFunc(dynFxSoundCleanFunc func)
{
}

void dynFxSetSoundMoveFunc(dynFxSoundMoveFunc func)
{
}

void dynFxSetSoundGuidFunc(dynFxSoundGetGuidFunc func)
{
}
void dynFxSetSoundVerifyFunc(dynFxSoundVerifyFunc func)
{
}

void dynFxSetSoundInvalidateFunc(dynFxSoundInvalidateFunc func)
{
}
bool modelLODIsLoaded(ModelLOD *model_lod)
{
    return false;
}
void geoUnpackDeltas(PackData *pack, void *data, int stride, int count, PackType type, const char *modelname, const char *filename)
{
}
void modelLODUpdateMemUsage(ModelLOD *model_lod)
{
}
ModelLOD *modelLoadLOD(NN_PTR_GOOD Model *model, int lod_index)
{
    return NULL;
}
void allocCTri_dbg(CTri **ctriOut, const char *caller_fname, S32 line)
{
}
S32	createCTri(CTri *ctri,const Vec3 v0,const Vec3 v1,const Vec3 v2)
{
    return 0;
}
F32 ctriCollide(const CTri *cfan,const Vec3 A,const Vec3 B,Vec3 col)
{
    return 0.0f;
}
PhysicalProperties *physicalPropertiesGetDefault(void)
{
    return NULL;
}
