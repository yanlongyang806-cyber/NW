#include "stdtypes.h"
#include "mathutil.h"
#include "StashTable.h"
#include "file.h"
#include "wininclude.h"
#include "FolderCache.h"
#include "winutil.h"

int main(int argc, char** argv)
{
// This is just random crap to make sure the compiler tries to actually link in stuff
	Vec3 test = {0};
	StashTable test2 = stashTableCreateWithStringKeys(10, StashDefault);
	int buflen;
	char *buf;

	FolderCacheChooseMode();
	buf = fileAlloc("sound/Ogg/testtone.ogg",&buflen);
	
	if (!buf)
		errorDialog(0, "Loading failed", "Failure", 0, 0);
	else
	{
		errorDialog(0, "Loading succeeded", "Success", 0, 0);
		SAFE_FREE(buf);
	}

	Sleep(10000);
	
	return 0;
}