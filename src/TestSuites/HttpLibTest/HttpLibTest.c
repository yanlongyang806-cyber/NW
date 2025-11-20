/***************************************************************************



***************************************************************************/

#include "GlobalTypes.h"
#include "TestHarness.h"
#include "wininclude.h"
#include "sysutil.h"

AUTO_TEST_GROUP(HttpLib, NULL);

int wmain(int argc, WCHAR** argv_wide)
{
	char **argv;
	SetAppGlobalType(GLOBALTYPE_TESTSUITE);
	ARGV_WIDE_TO_ARGV

	DO_AUTO_RUNS

	if (argc == 1)
	{
		testRunMatchedCases("HttpLib*");
		testReportToConsole();
	}

	return 0;
}
