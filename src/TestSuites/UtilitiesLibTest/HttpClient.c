// Tests for HttpClient.c

#include "TestHarness.h"
#include "HttpClient.h"
#include "net.h"
#include "timing.h"
#include "utilitiesLib.h"

AUTO_TEST_GROUP(HttpClient, UtilitiesLib);

static bool g_timed_out = false;

static void timeoutCB(HttpClient *client, void *userdata)
{
	g_timed_out = true;
}

#if 0

// Disabled because it's slow.

AUTO_TEST_CHILD(HttpClient);
void TestTimeout(void)
{
	HttpClient *client = httpClientConnect("google.com", 80, NULL, NULL, NULL, timeoutCB, commDefault(), false, 5);
	U32 t = timerAlloc(), total=0, step;
	while(!g_timed_out && total < 30)
	{
		step = timerElapsedAndStart(t);
		total += step;
		commMonitor(commDefault());
		utilitiesLibOncePerFrame(step, 1);
	}
	testAssert(g_timed_out);
	timerFree(t);
}
#endif
