// Memory tests

#include "EString.h"
#include "MemAlloc.h"
#include "MemoryPool.h"
#include "MemTrack.h"
#include "rand.h"
#include "ScratchStack.h"
#include "TestHarness.h"
#include "ThreadSafeMemoryPool.h"
#include "timing.h"
#include "utilitiesLib.h"
#include "wininclude.h"

AUTO_TEST_GROUP(Memory, UtilitiesLib);
AUTO_TEST_GROUP(MemoryPerf, Performance);

// Uncomment the following to run tests that throw exceptions
//#define ALLOW_CANFAIL_TESTS

// ********* Regular memory tests *********

// Just a basic coverage of different malloc-related functions we can call.
AUTO_TEST_CHILD(Memory);
void TestReallyBasicMemory(void)
{
	void *p = malloc(42);
	testAssert(p);
	p = realloc(p, 24);
	testAssert(p);
	free(p);
	p = calloc(1,2);
	testAssert(p);
	free(p);

	p = realloc(0, 345);
	testAssert(p);
	p = realloc(p, 234);
	testAssert(p);
	p = realloc(p, 0);
	testAssert(!p);

	p = calloc_special_heap(3,4,CRYPTIC_CONTAINER_HEAP);
	testAssert(p);
	free(p);
	p = calloc_canfail(5,6);
	testAssert(p);
	free(p);
	p = calloc_canfail_special_heap(8,7,CRYPTIC_CONTAINER_HEAP);
	testAssert(p);
	free(p);

	p = malloc_special_heap(9,CRYPTIC_PACKET_HEAP);
	testAssert(p);
	free(p);
	p = malloc_canfail(8);
	testAssert(p);
	free(p);
	p = malloc_canfail_special_heap(7,CRYPTIC_CONTAINER_HEAP);
	testAssert(p);

	p = realloc_special_heap(p,6,CRYPTIC_CONTAINER_HEAP);
	testAssert(p);
	p = realloc_canfail(p,7);
	testAssert(p);
	p = realloc_canfail_special_heap(p,8,CRYPTIC_PACKET_HEAP);
	testAssert(p);
	free(p);
}

// Iterate through the different heaps.
static int next_type(int type)
{
	switch (type)
	{
		case _NORMAL_BLOCK:
			return CRYPTIC_CONTAINER_HEAP;
		case CRYPTIC_CONTAINER_HEAP:
			return CRYPTIC_PACKET_HEAP;
		case CRYPTIC_PACKET_HEAP:
			return 0;
	}
	testAssert(0);
	return 0;
}

AUTO_TEST_CHILD(Memory);
void TestRealloc(void)
{
	int blockType;
	for(blockType = _NORMAL_BLOCK; blockType; blockType = next_type(blockType))
	{
		char *p;
		char pattern[255];
		int i;
		int seed = 0xdeadbeef;
	
		// Realloc to allocate
		p = realloc_special_heap(NULL, 42, blockType);
		testAssert(p);
	
		// Normal realloc up.
		p = realloc(p, 50);
		testAssert(p);
	
		// Realloc to free.
		p = realloc(p, 0);
		testAssert(!p);
	
		// Realloc noop.
		// I'm not actually sure what this should do.
		//p = realloc(0, 0);
		//testAssert(!p);
	
		// Initialize pattern, for below.
		for (i = 0; i != 255; ++i)
			pattern[i] = randomU32Seeded(&seed, RandType_BLORN);
		memcpy(pattern, "abcdefghijklmnopqrstuvwxyz", 26);
	
		// Realloc between various sizes, including over the small to big boundary.
		p = malloc_special_heap(1, blockType);
		*p = 42;
		p = realloc(p, 2);
		testAssert(*p == 42);
		p = realloc(p, 1);
		testAssert(*p == 42);
		p = realloc(p, 2);
		testAssert(*p == 42);
		p = realloc(p, 254);
		testAssert(*p == 42);
		memcpy(p, pattern, 254);
		p = realloc(p, 255);
		testAssert(memcmp(p, pattern, 254) == 0);
		p = realloc(p, 256);
		testAssert(memcmp(p, pattern, 254) == 0);
		p = realloc(p, 250);
		testAssert(memcmp(p, pattern, 250) == 0);
		p = realloc(p, 1000);
		testAssert(memcmp(p, pattern, 250) == 0);
		p = realloc(p, 7);
		testAssert(memcmp(p, pattern, 7) == 0);
		p = realloc(p, 1000);
		testAssert(memcmp(p, pattern, 7) == 0);
		p = realloc(p, 3);
		testAssert(memcmp(p, pattern, 3) == 0);
		p = realloc(p, 0);
		testAssert(!p);
		assertHeapValidateAll();
	}
}

// Realloc one-by-one downward to try to catch any problems with realloc() to smaller values.
AUTO_TEST_CHILD(Memory);
void ReallocCascadeDescending(void)
{
	int blockType;
	for(blockType = _NORMAL_BLOCK; blockType; blockType = next_type(blockType))
	{
		char pattern[2000];
		int i;
		int seed = 0xdeadbeef;
		char *p;
	
		// Initialize pattern, for below.
		for (i = 0; i != 2000; ++i)
			pattern[i] = randomU32Seeded(&seed, RandType_BLORN);
	
		// Realloc from 2000 to 0.
		p = realloc_special_heap(NULL, 2000, blockType);
		memcpy(p, pattern, 2000);
		for (i = 2000; i; --i)
		{
			testAssert(memcmp(p, pattern, i) == 0);
			p = realloc(p, i - 1);
		}
		testAssert(!p);
		assertHeapValidateAll();
	}
}

// Realloc one-by-one upward  to try to catch any problems with realloc() to larger values.
AUTO_TEST_CHILD(Memory);
void ReallocCascadeAscending(void)
{
	int blockType;
	for(blockType = _NORMAL_BLOCK; blockType; blockType = next_type(blockType))
	{
		char pattern[2000];
		int i;
		int seed = 0xdeadbeef;
		char *p = 0;
	
		// Initialize pattern, for below.
		for (i = 0; i != 2000; ++i)
			pattern[i] = randomU32Seeded(&seed, RandType_BLORN);
	
		// Realloc from 2000 to 0.
		for (i = 0; i != 2000; ++i)
		{
			p = realloc_special_heap(p, i + 1, blockType);
			p[i] = pattern[i];
			testAssert(memcmp(p, pattern, i + 1) == 0);
		}
		p = realloc(p, 0);
		testAssert(!p);
		assertHeapValidateAll();
	}
}

// Test basic Scratch Stack functionality.
AUTO_TEST_CHILD(Memory);
void ScratchStackBasic(void)
{
	char *p;
	int i;
	char *estr = NULL;

	// Allocate a buffer.
	p = ScratchAlloc(43);
	testAssert(p);

	// Make sure the buffer is initialized, and overwrite it.
	for (i = 0; i != 43; ++i)
	{
		testAssert(!p[i]);
		p[i] = 42;
	}

	// Free the buffer.
	ScratchFree(p);

	// Test the uninitialized allocator.
	p = ScratchAllocUninitialized(123);
	testAssert(p);
	memset(p, 12, 123);
	ScratchFree(p);

	// Check stack EStrings.
	estrStackCreate(&estr);
	estrSetSize(&estr, MIN_STACK_ESTR);
	memset(estr, 251, MIN_STACK_ESTR);
	estrDestroy(&estr);
}

// Test Scratch Stack overflow behavior.
AUTO_TEST_CHILD(Memory);
void ScratchStackOverflow(void)
{
	char *p;
	int i;

	// Basic working condition.
	p = ScratchAllocNoOverflow(56);
	testAssert(p);
	for (i = 0; i != 56; ++i)
	{
		testAssert(!p[i]);
		p[i] = 41;
	}
	ScratchFree(p);

	// Basic working condition, with no initialization.
	p = ScratchAllocNoOverflowUninitialized(144);
	testAssert(p);
	memset(p, 77, 144);
	ScratchFree(p);

	// Test failure condition.
	p = ScratchAllocNoOverflow(1024*1024*1024);
	testAssert(!p);
	p = ScratchAllocNoOverflowUninitialized(1024*1024*1024);
	testAssert(!p);
}

static int ssthread_count = 0;

static int ssmax_count = 10;

static int workerthreadss(void *dummy)
{
	char *table[10];
	int i;
	const int max_rand_size = 1024*1024;

	EXCEPTION_HANDLER_BEGIN

	++ssthread_count;
	for (i = 0; i != sizeof(table)/sizeof(*table); ++i)
	{
		table[i] = ScratchAlloc(rand()%max_rand_size);
	}
	for (i = 0; i != ssmax_count; ++i)
	{
		int j = rand() % sizeof(table)/sizeof(*table);
		ScratchFree(table[j]);
		table[j] = ScratchAlloc(rand()%max_rand_size);
	}
	for (i = 0; i != sizeof(table)/sizeof(*table); ++i)
	{
#pragma warning(suppress:6001) // /analzye flags "Using uninitialized memory '*ScratchStackPerThreadAllocEx((rand())%max_rand_size, 1, 1, "C:\src\TestSuites\UtilitiesLibTest\memory.c", 287)"
		ScratchFree(table[i]);
	}
	--ssthread_count;

	EXCEPTION_HANDLER_END

	return 0;
}

AUTO_TEST_CHILD(Memory);
void TortureScratchStack(void)
{
	int i;

	for (i = 0; i != 50; ++i)
	{
		_beginthread(workerthreadss, 0, NULL);
	}
	Sleep(2);
	for (;;)
	{
		if (!ssthread_count)
			break;
		Sleep(1);
		utilitiesLibOncePerFrame(0,1);
	}
	utilitiesLibOncePerFrame(0,1);
}

// Count of running workerthreadssthr.
static int count_ssthr = 0;

// For ScratchStackThreaded()
static int workerthreadssthr(void *dummy)
{
	int i;

	EXCEPTION_HANDLER_BEGIN

	++count_ssthr;
	for (i = 0; i != 5000; ++i)
	{
		void *p = ScratchAlloc(50);
		char *estr = NULL;
		estrStackCreate(&estr);
		estrCopy2(&estr, "hey");
		estrDestroy(&estr);
		ScratchFree(p);
	}
	--count_ssthr;

	EXCEPTION_HANDLER_END

	return 0;
}

// Test threaded scratch stack allocations, specifically cleanup.
// May duplicate TortureScratchStack() somewhat, but a little different.
AUTO_TEST_CHILD(Memory);
void ScratchStackThreaded(void)
{
	int i;

	for (i = 0; i != 50; ++i)
	{
		_beginthread(workerthreadssthr, 0, NULL);
		utilitiesLibOncePerFrame(0,1);
	}
	Sleep(2);
	for (;;)
	{
		if (!count_ssthr)
			break;
		Sleep(1);
	}
	utilitiesLibOncePerFrame(0,1);
}

// ********* Canfail tests *********

AUTO_TEST_CHILD(Memory);
void TestCanfail(void)
{
#ifdef ALLOW_CANFAIL_TESTS
#ifdef _M_X64
#define FAIL_SIZE 500*1024*1024*1024ULL
#else
#define FAIL_SIZE 3*1024*1024*1024U
#endif

	int blockType;
	for(blockType = _NORMAL_BLOCK; blockType; blockType = next_type(blockType))
	{
		void *ptr2, *ptr;

		// Test calloc success.
		ptr = calloc_canfail_special_heap(1,1,blockType);
		testAssert(ptr);
		free(ptr);
	
		// Test calloc failure.
		ptr = calloc_canfail_special_heap(1,FAIL_SIZE,blockType);
		testAssert(!ptr);
	
		// Test malloc sucess.
		ptr = malloc_canfail_special_heap(1,blockType);
		testAssert(ptr);
		free(ptr);
	
		// Test malloc failure.
		ptr = malloc_canfail_special_heap(FAIL_SIZE,blockType);
		testAssert(!ptr);
	
		// Test realloc failure.
		ptr2 = malloc_special_heap(1,blockType);
		ptr = realloc_canfail(ptr2, FAIL_SIZE);
		testAssert(!ptr);
	
		// Test realloc success.
		ptr = realloc_canfail(ptr2, 2);
		testAssert(ptr);
	
		// Test realloc to zero.
		ptr = realloc_canfail(ptr, 0);
		testAssert(!ptr);
	
		// Test realloc alloc failure
		ptr = realloc_canfail_special_heap(0, FAIL_SIZE, blockType);
		testAssert(!ptr);
	
		// Test realloc alloc success.
		ptr = realloc_canfail_special_heap(NULL, 2, blockType);
		testAssert(ptr);
		free(ptr);
	
		//for(;;)
		//{
		//	void *ptr = calloc_canfail(1,1024);
		//}
	}
#endif // ALLOW_CANFAIL_TESTS
}

// ********* Performance tests *********

#define DURATION 3600000000LL*5

volatile int sink = 42;

static void do_alloc_perf_test()
{
//	void *ptr = calloc_canfail(1,1);
//	++sink;
//	free(ptr);

	void *ptr = malloc(1);
	//void *ptr = malloc_special_heap(1,CRYPTIC_CONTAINER_HEAP);
//	void *ptr = realloc(NULL,1);
	++sink;
	free(ptr);
}

// Manual performance test harness for allocator performance
AUTO_TEST_CHILD(MemoryPerf);
void TestAllocPerf(void)
{
#if 0
	unsigned counter = 0;
	int timer = timerAlloc();
	U64 start;
	float elapsed;

	// Set high priority and prepare to run.
	Sleep(100);
	SetPriorityClass(GetCurrentProcess(), HIGH_PRIORITY_CLASS);

	GET_CPU_TICKS_64(start);
	timerStart(timer);
	for (;;)
	{
		U64 now;

		if ((counter & 0xffff) == 0)
		{
			GET_CPU_TICKS_64(now);
			if (now - start >= DURATION)
				break;
		}

		do_alloc_perf_test();

		++counter;
	}

	elapsed = timerElapsed(timer);

	printf("%f ns\n", elapsed/counter*1000000000);
#endif
}

static volatile bool mt_start = 0;
static volatile unsigned mt_exit = 0;

static void do_alloc_perf_test_multithread(U64 *i)
{
	//	void *ptr = calloc_canfail(1,1);
	//void *ptr = realloc(NULL,1);

	void *ptr = malloc(1);
	++*i;
	free(ptr);
}

static int workerthread1(void *x)
{
	U64 *count = x;

	EXCEPTION_HANDLER_BEGIN

	for(;;)
	{
		if (mt_start)
			break;
	}

	for(;;)
	{
		if (mt_exit)
			return 0;
		do_alloc_perf_test_multithread(count);
	}

	EXCEPTION_HANDLER_END

	return 0;
}

// Manual performance test harness for multithreaded allocator performance
AUTO_TEST_CHILD(MemoryPerf);
void TestAllocPerfThreaded(void)
{
#if 0
	unsigned counter = 0;
	int timer = timerAlloc();
	U64 start;
	float elapsed;
	int i;
	U64 **array;
	int threadcount = 8;
	U64 mt_count = 0;

	// Create a bunch of threads.
	array = malloc(threadcount * sizeof(*array));
	array[0] = malloc(4096);
	for (i = 1; i != threadcount; ++i)
	{
		_beginthread(workerthread1, 0, (array[i] = malloc(4096)));
	}

	// Set high priority and prepare to run.
	Sleep(100);
	SetPriorityClass(GetCurrentProcess(), HIGH_PRIORITY_CLASS);

	GET_CPU_TICKS_64(start);
	timerStart(timer);
	mt_start = true;
	for (;;)
	{
		U64 now;

		if ((counter & 0xffff) == 0)
		{
			GET_CPU_TICKS_64(now);
			if (now - start >= DURATION)
				break;
		}

		do_alloc_perf_test_multithread(array[0]);

		++counter;
	}
	InterlockedIncrement(&mt_exit);
	elapsed = timerElapsed(timer);

	for (i = 0; i != threadcount; ++i)
	{
		mt_count += *(array[i]);
	}

	printf("%f ns\n", elapsed/mt_count*1000000000);
#endif
}

#define TSMP_SIZE 1024*1024

#define TSMP_TYPE U64

TSMP_TYPE *tsmp_array[TSMP_SIZE];

static U32 seed;

//#define NOOP 1
//#define CALLOC 1
//#define MP 1
//#define TSMP 1

#if NOOP
static TSMP_TYPE static_tsmp_array[TSMP_SIZE];
static void do_tsmp_perf_test()
{
	int i = randomStepSeed(&seed, RandType_BLORN_Static) % TSMP_SIZE;
	(*tsmp_array[i]) = i;
}
static void do_tsmp_init()
{
	int i;
	seed = 0xdeadbeef;
	for (i = 0; i != TSMP_SIZE; ++i)
	{
		tsmp_array[i] = static_tsmp_array + i;
	}
}
static void do_tsmp_free()
{
}
#endif

#if CALLOC
static void do_tsmp_perf_test()
{
	int i = randomStepSeed(&seed, RandType_BLORN_Static) % TSMP_SIZE;
	free(tsmp_array[i]);
	tsmp_array[i] = calloc(1, sizeof(TSMP_TYPE));
	*tsmp_array[i] = i; 
}
static void do_tsmp_init()
{
	int i;

	seed = 0xdeadbeef;

	for (i = 0; i != TSMP_SIZE; ++i)
	{
		tsmp_array[i] = calloc(1, sizeof(TSMP_TYPE));
	}
}
static void do_tsmp_free()
{
	int i;
	for (i = 0; i != TSMP_SIZE; ++i)
	{
		free(tsmp_array[i]);
	}
}
#endif

#if MP

MP_DEFINE(TSMP_TYPE);

static void do_tsmp_perf_test()
{
	int i = randomStepSeed(&seed, RandType_BLORN_Static) % TSMP_SIZE;
	MP_FREE(TSMP_TYPE, tsmp_array[i]);
	tsmp_array[i] = MP_ALLOC(TSMP_TYPE);
	*tsmp_array[i] = i; 
}
static void do_tsmp_init()
{
	int i;

	seed = 0xdeadbeef;

	MP_CREATE(TSMP_TYPE, 256);

	for (i = 0; i != TSMP_SIZE; ++i)
	{
		tsmp_array[i] = MP_ALLOC(TSMP_TYPE);
	}
}
static void do_tsmp_free()
{
	int i;
	for (i = 0; i != TSMP_SIZE; ++i)
	{
		MP_FREE(TSMP_TYPE, tsmp_array[i]);
	}
}
#endif

#if TSMP
TSMP_DEFINE(TSMP_TYPE);
static void do_tsmp_perf_test()
{
	int i = randomStepSeed(&seed, RandType_BLORN_Static) % TSMP_SIZE;
	TSMP_FREE(TSMP_TYPE, tsmp_array[i]);
	tsmp_array[i] = TSMP_ALLOC(TSMP_TYPE);
	*tsmp_array[i] = i;
}
static void do_tsmp_init()
{
	int i;

	seed = 0xdeadbeef;

	TSMP_CREATE(TSMP_TYPE, 256);

	for (i = 0; i != TSMP_SIZE; ++i)
	{
		tsmp_array[i] = TSMP_ALLOC(TSMP_TYPE);
	}
}
static void do_tsmp_free()
{
	int i;
	for (i = 0; i != TSMP_SIZE; ++i)
	{
		TSMP_FREE(TSMP_TYPE, tsmp_array[i]);
	}
}
#endif

// Manual performance test harness for pool allocator performance
AUTO_TEST_CHILD(MemoryPerf);
void TestTSMPPerf(void)
{
#if 0
	unsigned counter = 0;
	int timer = timerAlloc();
	U64 start;
	float elapsed;

	// Set high priority and prepare to run.
	do_tsmp_init();
	Sleep(100);
	SetPriorityClass(GetCurrentProcess(), HIGH_PRIORITY_CLASS);

	GET_CPU_TICKS_64(start);
	timerStart(timer);
	for (;;)
	{
		U64 now;

		if ((counter & 0xffff) == 0)
		{
			GET_CPU_TICKS_64(now);
			if (now - start >= DURATION)
				break;
		}

		do_tsmp_perf_test();

		++counter;
	}

	elapsed = timerElapsed(timer);

	do_tsmp_free();

	printf("%f ns\n", elapsed/counter*1000000000);
#endif
}

// ********* Miscellaneous tests that don't fit into the above *********

// This change requires a way to force an allocation to be reserved.  I have not added this for performance reasons.
#if 0
AUTO_TEST_CHILD(Memory);
void TestReserved(void)
{
	void *p;

	memTrackReserveMemoryChunk(1024*1024*1024);

	p = malloc(31337);  // Tester: Force this allocation to be reserved

	memcpy(p, "bob", 4);
	p = realloc(p, 100);
	testAssertStrEqual((char *)p, "bob");
	p = realloc(p, 1024*1024);
	testAssertStrEqual((char *)p, "bob");
	free(p);
}
#endif


AUTO_TEST_CHILD(LargeBlocksIndex);
void TestLargeBlocksIndex(void)
{
	volatile int i = 42;
	void *b1, *b2, *b3;

	for (i=0;i<300;i++)
	{
		b1=malloc(65536);
		free(b1);
	}

	b1=malloc(1024*1024+42);
	b2=malloc(1024*1024+42);
	//b3=malloc(41952);
	//free(b1);
	free(b2);
	//free(b3);

//	((unsigned char *)b1)[35000]=0;
//	((unsigned char *)b2)[35000]=0;
//	((unsigned char *)b3)[35000]=0;

	((U64 *)b1)[0]=(U64)b1;
	((U64 *)b2)[0]=(U64)b1;
	//((U64 *)b3)[0]=0;


	b1=malloc(1024*1024+42);
	b2=malloc(1024*1024+42);
	b3=malloc(41952);
	free(b1);
	free(b2);
	free(b3);
}

AUTO_TEST_CHILD(Memory);
void TestSmallEstrings(void)
{
	char *testString = NULL;
	estrHeapCreate(&testString, 1, 0);
	estrReserveCapacity(&testString, 16);
	estrDestroy(&testString);

	estrHeapCreate(&testString, 2, 0);
	estrReserveCapacity(&testString, 16);
	estrDestroy(&testString);

	estrHeapCreate(&testString, 3, 0);
	estrReserveCapacity(&testString, 16);
	estrDestroy(&testString);

	estrHeapCreate(&testString, 4, 0);
	estrReserveCapacity(&testString, 16);
	estrDestroy(&testString);

	estrHeapCreate(&testString, 5, 0);
	estrReserveCapacity(&testString, 16);
	estrDestroy(&testString);
}