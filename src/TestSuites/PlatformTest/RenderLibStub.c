#include "RenderLibStub.h"
#include "..\..\libs\renderers\rdrdeviceprivate.h"
#include "rdrsurface.h"
#include "rt_xsurface.h"

RdrSurface **texhandle_surfaces;

void rdrSetMsgHandler(RdrDevice *device, RdrUserMsgHandler msg_handler, RdrWinMsgHandler winmsg_handler, void *userdata)
{
//	device->user_msg_handler = msg_handler;
//	device->user_data = userdata;
}

static void rxbxGetDeviceSize(RdrDevice *device, int *xpos, int *ypos, int *width, int *height, int *refresh_rate, int *fullscreen, int *maximized, int *windowed_fullscreen)
{
	if (xpos)
		*xpos = 0;
	if (ypos)
		*ypos = 0;
	if (refresh_rate)
		*refresh_rate = 60;
	if (fullscreen)
		*fullscreen = 1;
	if (maximized)
		*maximized = 0;

	if (width)
		*width = 100;
	if (height)
		*height = 100;
	if (windowed_fullscreen)
		*windowed_fullscreen = 0;
}

static void *rxbxGetHWND(RdrDevice *device)
{
	return NULL;
}

static void rxbxProcessMessages(RdrDevice *device)
{
}

RdrDevice *DummyInitRdr(void)
{
	RdrDevice *device = (RdrDevice *)calloc(1, sizeof(RdrDevice));
	device->getSize = rxbxGetDeviceSize;
	device->getWindowHandle = rxbxGetHWND;
	device->processMessages = rxbxProcessMessages;

	return device;
}
typedef struct RdrTextureDataDX RdrTextureDataDX;

void rxbxNotifyTextureFreed(RdrDeviceDX *device, RdrTextureDataDX *tex_data) {}
void rdrTrackUserMemoryDirect(RdrDevice *device, const char *moduleName, int staticModuleName, intptr_t memTrafficDelta) {}
void rxbxFatalHResultErrorf(RdrDeviceDX *device, HRESULT hr, const char *action_str, FORMAT_STR const char *detail_str, ...) {}
RdrSurface *rdrGetSurfaceForTexHandle(RdrTexHandle tex_handle){ return NULL;}
TexHandle rdrSurfaceToTexHandleEx(RdrSurface *surface, RdrSurfaceBuffer buffer, int set_index, int force_flags)
{
	TexHandle handle = 0;
	return handle;
}
void rxbxDeviceDetachDeadSurfaceTextures(RdrDeviceDX *device){}

int getImageByteCount(RdrTexType tex_type, RdrTexFormat tex_format, U32 width, U32 height, U32 depth)
{
	return(width*height*depth*4);
}

TexHandle rdrGenTexHandle(RdrTexFlags flags) 
{
	TexHandle handle = 0;
	return handle;
}

void rdrChangeTexHandleFlags(TexHandle *handle, RdrTexFlags flags) {}

#if !_XBOX && !_PS3
//void D3DResolve( D3DDevice * d3d_device, RdrSurfaceDX *pSrcSurface, D3DTexture *pDstTexture, int face, bool bIsCubemapTexture ) {}
#endif

D3DFORMAT rxbxGetD3DFormatForSBT(RdrSurfaceBufferType sbt) { return 0;}