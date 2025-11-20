// Tests for timing.h and other timing functions

#include "file.h"
#include "fileWatch.h"
#include "TestHarness.h"
#include "sys/stat.h"
#include "timing.h"
#include "winfiletime.h"

AUTO_TEST_GROUP(timing, UtilitiesLib);

AUTO_TEST_CHILD(timing);
void TestTimestamps(void)
{
	const char filename1[] = "testing1.txt";
	char file1[MAX_PATH];
	FILE *fp;
	__time32_t now = _time32(NULL);
	FWStatType info;
	S32 ret;
	struct _stat32i64 info2;
	__time32_t mtime;

	fileLocateWrite(filename1, file1);

	// fwStat() == now
	fp = fopen(file1, "w");
	fclose(fp);
	ret = fwStat(file1, &info);
	testAssertEqual(ret, 0);
	testAssert(info.st_mtime == now || info.st_mtime == now + 1);

	// _stat32i64 == fwStat()
	ret = _stat32i64(file1, &info2);
	testAssertEqual(ret, 0);
	testAssert(info.st_mtime == info2.st_mtime);

	// _AltStat() == fwStat()
	ret = _AltStat(file1, &info2);
	testAssertEqual(ret, 0);
	testAssert(info.st_mtime == info2.st_mtime);

	// fileLastChanged() == fwStat()
	testAssert(info.st_mtime == fileLastChanged(file1));

	// fileLastChangedAltStat() == fwStat()
	testAssert(info.st_mtime == fileLastChangedAltStat(file1));

	// _GetUTCFileTimes() == fwStat()
	ret = _GetUTCFileTimes(file1, NULL, &mtime, NULL);
	testAssertEqual(ret, 1);
	testAssert(info.st_mtime == mtime);
}
