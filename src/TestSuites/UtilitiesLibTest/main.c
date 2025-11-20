/***************************************************************************



***************************************************************************/

#include "ContinuousBuilderSupport.h"
#include "cmdparse.h"
#include "error.h"
#include "FolderCache.h"
#include "gimmeDLLWrapper.h"
#include "GlobalTypes.h"
#include "MemReport.h"
#include "MemoryMonitor.h"
#include "StringUtil.h"
#include "sysutil.h"
#include "TestHarness.h"
#include "timing_profiler_interface.h"
#include "utilitiesLib.h"
#include "taskServerDriver.h"

// Use to switch off threading.
static bool sbThreadTestHarness = true;
AUTO_CMD_INT(sbThreadTestHarness, ThreadTestHarness) ACMD_COMMANDLINE;

AUTO_TEST_GROUP(UtilitiesLib, NULL);
AUTO_TEST_GROUP(Interview, NULL);
AUTO_TEST_GROUP(Performance, NULL);
AUTO_TEST_GROUP(LargeBlocksIndex, NULL);
AUTO_TEST_GROUP(PipeBufferTest, NULL);
AUTO_TEST_GROUP(OneOff, NULL);
AUTO_TEST_GROUP(PerfOneOff, NULL);

static char gSpecificTestGroup[MAX_PATH] = "";
AUTO_CMD_STRING(gSpecificTestGroup, SpecificTestGroup) ACMD_CMDLINE;

// Testbed for interview questions
static bool sbTestInterview = false;
AUTO_CMD_INT(sbTestInterview, Interview) ACMD_COMMANDLINE;

// Performance tests
static bool sbTestPerformance = false;
AUTO_CMD_INT(sbTestPerformance, Performance) ACMD_COMMANDLINE;

// LargeBlocksIndex one-off tests
static bool sbTestLargeBlocksIndex = false;
AUTO_CMD_INT(sbTestLargeBlocksIndex, LargeBlocksIndex) ACMD_COMMANDLINE;

// General-purpose one-off tests
static bool sbOneOff = false;
AUTO_CMD_INT(sbOneOff, OneOff) ACMD_COMMANDLINE;

// General-purpose one-off perf tests
static bool sbPerfOneOff = false;
AUTO_CMD_INT(sbPerfOneOff, PerfOneOff) ACMD_COMMANDLINE;


static char *pPipeBufferTestExecutablePath, *pPipeBufferTestString;

// Pipe buffer test, for use with CrypticLauncher PW bypass login
AUTO_COMMAND;
void PipeBufferTest(char *pExecutablePath, char *pString)
{
	pPipeBufferTestExecutablePath = strdup(pExecutablePath);
	pPipeBufferTestString = strdup(pString);
}

void RunPipeBufferTest(char *pExecutablePath, char *pString);

int wmain(int argc, WCHAR** argv_wide)
{
	int result = 0;
	bool performance;
	char **argv;

	EXCEPTION_HANDLER_BEGIN
	ARGV_WIDE_TO_ARGV

	WAIT_FOR_DEBUGGER


	loadstart_printf("UtilitiesLibtest running...\n");
	loadstart_printf("Initialization...\n");

	SetAppGlobalType(GLOBALTYPE_TESTSUITE);

	// Do general startup initialization.
	DO_AUTO_RUNS
	setDefaultAssertMode();
	memMonitorInit();
	gimmeDLLDisable(1);
	FolderCacheChooseMode();
	utilitiesLibStartup();

	// Parse command line.
	cmdParseCommandLine(argc, argv);
	testEnableThreading(sbThreadTestHarness);
	performance = sbTestPerformance || sbPerfOneOff;
	if (!performance)
		testSetTimeout(4000 * (!!g_isContinuousBuilder*9+1));  // CB gets 10

	loadend_printf("Initialization...done\n");

	// for testing TaskServer infrastructure
	//TaskServerGeneralRequestTest();

	// Special-purpose tests
	if (gSpecificTestGroup[0] != 0)
	{
		testRunMatchedCasesEx(gSpecificTestGroup, false);
		result = testReportToConsole();
	}
	else if (sbTestInterview)
	{
		testRunMatchedCases("Interview*");
		result = testReportToConsole();
	}
	else if (sbTestPerformance)
	{
		testSetTimeout(0);
		testRunMatchedCases("Performance*");
		result = testReportToConsole();
	}
	else if (sbTestLargeBlocksIndex)
	{
		testRunMatchedCases("LargeBlocksIndex*");
		result = testReportToConsole();
	}
	else if (sbOneOff)
	{
		testRunMatchedCases("OneOff*");
		result = testReportToConsole();
	}
	else if (sbPerfOneOff)
	{
		testRunMatchedCases("PerfOneOff*");
		result = testReportToConsole();
	}

	else if (pPipeBufferTestExecutablePath)
	{
		RunPipeBufferTest(pPipeBufferTestExecutablePath, pPipeBufferTestString);
	}

	// Regular unit tests.
	else
	{
		testRunMatchedCases("UtilitiesLib*");
		result = testReportToConsole();
	}

	if (!performance)
		mmplShort();

	loadend_printf("UtilitiesLibtest complete.\n");

	//(void)getchar();

	EXCEPTION_HANDLER_END

	return result;
}
