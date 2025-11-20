#include "RenderLib.h"
#include "rt_xtextures.h"

#if _PS3
#include "rt_ps3textures.h"

// external functions
D3DBaseTexture* rps3CreateCellTexture( uint16_t width, uint16_t height, uint16_t levels,  D3DFORMAT format, int numMipmaps, RdrTexType tex_type, D3DBaseTexture **dstTexture );
int rps3CellTextureAddRef( D3DBaseTexture *tex );
int rps3CellTextureRelease( D3DBaseTexture *tex );

void releaseTexture(RdrDeviceDX *device, RdrTextureDataDX *tex_data);
D3DFORMAT rps3GetSrcFormat(RdrTexFormat src_format_in, U32 width, U32 *compressed);
D3DFORMAT rps3GetDstFormat(RdrTexFormat dst_format, U32 width, U32 *compressed);

// function prototypes that are in rt_xtextures.c
void rxbxCopyComponent(void *dst, void *src, int dst_bytes, int src_bytes, int dst_float, int src_float);
#endif

void TestTextures(void)
{
#if _PS3
	RdrDeviceDX	device;
	RdrTexParams	rtex;
	RdrTexFormat	format = RTEX_BGRA_U8;
	D3DFORMAT		cellFormat;
	U32				compressed;
	D3DBaseTexture* pTex1;
	D3DBaseTexture* pTex2;
	int				ret = 0;

	memset(&device, 0, sizeof(device));
	memset(&rtex, 0, sizeof(rtex));

	cellFormat = rps3GetSrcFormat( format, 512, &compressed);
	cellFormat = rps3GetDstFormat( format, 512, &compressed);

	rps3CreateCellTexture(512, 512, 1, cellFormat, 1, RTEX_2D, &pTex1);
	rps3CreateCellTexture(256, 256, 1, cellFormat, 9, RTEX_2D, &pTex2);

	ret = rps3CellTextureAddRef(pTex1);
	ret = rps3CellTextureRelease(pTex1);

	ret = rps3CellTextureRelease(pTex2); // should free it
	ret = rps3CellTextureRelease(pTex1); // should free it

	//rxbxSetTextureDataDirect(&device, &rtex, NULL);
#endif
}
