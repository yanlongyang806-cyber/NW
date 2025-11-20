/***************************************************************************
*     Copyright (c) 2008, Cryptic Studios
*     All Rights Reserved
*     Confidential Property of Cryptic Studios
***************************************************************************/
#include "stdtypes.h"
#include "GfxPrimitive.h"

bool gbNoGraphics = false;

void conPrintfUpdate(char const *fmt, ...)
{
    char str[MAX_PATH];
    va_list ap;

	va_start(ap, fmt);
	vsprintf(str, fmt, ap);
	str[ARRAY_SIZE(str)-1]='\0';
	va_end(ap);
	printf("%s", str);
}

void gfxDrawBox3DEx(const Vec3 min, const Vec3 max, const Mat4 mat, Color color, F32 line_width, VolumeFaces faceBits)
{
}
void gfxDrawLine3DWidth(const Vec3 p1, const Vec3 p2, Color color1, Color color2, F32 width)
{
}
bool gfxIsInactiveApp(void)
{
    return true;
}