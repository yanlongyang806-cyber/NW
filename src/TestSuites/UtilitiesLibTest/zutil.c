// Tests for zutils.c

#include "MemAlloc.h"
#include "MemReport.h"
#include "TestHarness.h"
#include "timing.h"
#include "wininclude.h"
#include "zutils.h"
#include "zlib.h"

AUTO_TEST_GROUP(zutil, UtilitiesLib);
AUTO_TEST_GROUP(zutilperf, Performance);

#define TESTDATA "testdata"
#define TESTDATA2 TESTDATA TESTDATA TESTDATA TESTDATA TESTDATA TESTDATA TESTDATA TESTDATA TESTDATA TESTDATA
#define TESTDATA3 TESTDATA2 TESTDATA2 TESTDATA2 TESTDATA2 TESTDATA2 TESTDATA2 TESTDATA2 TESTDATA2 TESTDATA2 TESTDATA2
#define TESTDATA4 TESTDATA3 TESTDATA3 TESTDATA3 TESTDATA3 TESTDATA3 TESTDATA3 TESTDATA3 TESTDATA3 TESTDATA3 TESTDATA3
#define TESTDATA5 TESTDATA4 TESTDATA4
static const char testdata[] = TESTDATA5;
#undef TESTDATA
#undef TESTDATA2
#undef TESTDATA3
#undef TESTDATA4
#undef TESTDATA5

// Basic compression test.
AUTO_TEST_CHILD(zutil);
void TestCompression(void)
{
	char *in = "testdata";
	void *zipped;
	int zipped_size;
	char out[1024];
	int out_size = ARRAY_SIZE_CHECKED(out);
	int ret;

	zipped = zipData(in, (U32)strlen(in), &zipped_size);
	ret = unzipDataEx(out, &out_size, zipped, zipped_size, true);
	out[out_size] = '\0';
	testAssertEqual(ret, 0);
	testAssertEqual(strlen(in), out_size);
	testAssertStrEqual(in, out);
	free(zipped);
	clearZipData();
}

// Basic compression test, on a special heap.
AUTO_TEST_CHILD(zutil);
void TestCompressionSpecialHeap(void)
{
	char *in = "testdata";
	void *zipped;
	int zipped_size;
	char out[1024];
	int out_size = ARRAY_SIZE_CHECKED(out);
	int ret;

	zipped = zipDataEx(in, (U32)strlen(in), &zipped_size, 9, false, CRYPTIC_CONTAINER_HEAP);
	ret = unzipDataEx(out, &out_size, zipped, zipped_size, true);
	out[out_size] = '\0';
	testAssertEqual(ret, 0);
	testAssertEqual(strlen(in), out_size);
	testAssertStrEqual(in, out);
	free(zipped);
	clearZipData();
}

// Test a longer compression size than TestCompression().
AUTO_TEST_CHILD(zutil);
void TestCompressionLong(void)
{
	const char *in = testdata;
	void *zipped;
	int zipped_size;
	char out[16100];
	int out_size = ARRAY_SIZE_CHECKED(out);
	int ret;

	zipped = zipData(in, (U32)strlen(in), &zipped_size);
	ret = unzipDataEx(out, &out_size, zipped, zipped_size, true);
	out[out_size] = '\0';
	testAssertEqual(ret, 0);
	testAssertEqual(strlen(in), out_size);
	testAssertStrEqual(in, out);
	free(zipped);
	clearZipData();
}

// Helper for TestCompressionLonger().
static void TestCompressionHelper(const char *in, size_t in_size, int special_heap)
{
	void *zipped;
	int zipped_size;
	char *out;
	int out_size;
	int ret;

	// Zip.
	zipped = zipDataEx(in, (U32)in_size, &zipped_size, 3, false, special_heap);

	// Unzip.
	out = malloc(in_size);
	out_size = (int)in_size;
	ret = unzipDataEx(out, &out_size, zipped, zipped_size, true);
	testAssertEqual(ret, 0);

	// Check.
	testAssertEqual(in_size, out_size);
	testAssert(!memcmp(in, out, in_size));
	free(zipped);
	free(out);
	clearZipData();
}

// Test compression of buffers large enough to require scratch stacking and no temporary buffer at all.
AUTO_TEST_CHILD(zutil);
void TestCompressionLonger(void)
{
	char *buffer = malloc(50000);
	int i;

	// Medium-sized buffer.
	for (i = 0; i != 50000; ++i)
		buffer[i] = rand();
	TestCompressionHelper(buffer, 50000, false);
	TestCompressionHelper(buffer, 50000, true);

	// Large-sized buffer.
	buffer = realloc(buffer, 20*1024*1024);
	for (i = 50000; i != 20*1024*1024; ++i)
		buffer[i] = rand();
	TestCompressionHelper(buffer, 20*1024*1024, false);
	TestCompressionHelper(buffer, 20*1024*1024, true);
	free(buffer);
}

static int thread_count = 0;

static int max_count = 10;

static int workerthreadz1(void *dummy)
{
	int i;
	const int full_out_size = 2*1024*1024+1;
	char *out;

	EXCEPTION_HANDLER_BEGIN

	out = malloc(full_out_size);

	++thread_count;
	for (i = 0; i != max_count; ++i)
	{
		const char *in = testdata;
		//const char *in = (void *)GetModuleHandle(NULL);
		void *zipped;
		int zipped_size;
		int ret;
		int out_size = full_out_size;
		U32 rand_amount = rand() % strlen(in);
		//U32 rand_amount = rand() % 2*1024*1024;

		zipped = zipDataEx(in, rand_amount, &zipped_size, rand() % 10, true, 0);
		ret = unzipDataEx(out, &out_size, zipped, zipped_size, true);
		out[out_size] = '\0';
		testAssertEqual(ret, 0);
		testAssertEqual(rand_amount, out_size);
		//testAssertStrEqual(in, out);
		testAssert(!memcmp(in, out, rand_amount));
		free(zipped);
	}
	--thread_count;
	clearZipData();
	free(out);

	EXCEPTION_HANDLER_END

	return 0;
}

AUTO_TEST_CHILD(zutil);
void TestCompressionThreaded(void)
{
	int i;

	for (i = 0; i != 50; ++i)
	{
		_beginthread(workerthreadz1, 0, NULL);
	}
	Sleep(2);
	for (;;)
	{
		if (!thread_count)
			break;
		Sleep(1);
	}
}

#define DURATION 3600000000LL*5

static volatile int sink = 42;

static void do_perf_test()
{
	/*U32 size;
	char buffer[1024];
	U32 outsize = sizeof(buffer);
	void *zipped = zipDataEx(testdata, sizeof(testdata), &size, 1, false, 0);
	unzipData(buffer, &outsize, zipped, size);
	free(zipped);*/
	++sink;
	debugZipTestContextAcquire();
}

// Manual performance test harness for zipping
AUTO_TEST_CHILD(zutilperf);
void TestCompressionPerf(void)
{
#if 0
	unsigned count = 0;
	int timer = timerAlloc();
	U64 start;
	float elapsed;

	// Set high priority and prepare to run.
	Sleep(1);
	SetPriorityClass(GetCurrentProcess(), HIGH_PRIORITY_CLASS);

	GET_CPU_TICKS_64(start);
	timerStart(timer);
	for (;;)
	{
		U64 now;

		if ((count & 0xffff) == 0)
		{
			GET_CPU_TICKS_64(now);
			if (now - start >= DURATION)
				break;
		}

		do_perf_test();

		++count;
	}

	elapsed = timerElapsed(timer);

	printf("%f ns\n", elapsed/count*1000000000);

	(void)getchar();
#endif
}
