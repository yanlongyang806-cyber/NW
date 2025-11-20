// Tests for Cryptic synchronization functions.

#include "mutex.h"
#include "TestHarness.h"
#include "semaphore.h"
#include "synchronization.h"
#include "timing.h"
#include "wininclude.h"

AUTO_TEST_GROUP(Synchronization, UtilitiesLib);
AUTO_TEST_GROUP(synchperf, Performance);

static int count;

static CrypticSemaphore shared_semaphore = NULL;

static int concurrency = 3;

static volatile int current_concurrency = 0;

static bool use_delay = false;

const static int normal_max_count = 1000;

static int max_count;

static int workerthread_sync1(void *dummy)
{
	int i;

	EXCEPTION_HANDLER_BEGIN

	InterlockedIncrement(&count);
	for (i = 0; i != max_count; ++i)
	{
		int now;
		semaphoreWait(shared_semaphore);
		now = InterlockedIncrement(&current_concurrency);
		assert(now <= concurrency);
		assert(now > 0);
		if (use_delay)
			Sleep(rand()%8);
		InterlockedDecrement(&current_concurrency);
		semaphoreSignal(shared_semaphore);
	}
	InterlockedDecrement(&count);

	EXCEPTION_HANDLER_END

	return 0;
}

static int workerthread_sync2(void *dummy)
{
	int i;

	EXCEPTION_HANDLER_BEGIN

	InterlockedIncrement(&count);
	for (i = 0; i != max_count; ++i)
	{
		int now;
		semaphoreWait(shared_semaphore);
		if (use_delay)
			Sleep(rand()%2);
		semaphoreWait(shared_semaphore);
		if (use_delay)
			Sleep(rand()%3);
		semaphoreWait(shared_semaphore);
		now = InterlockedExchangeAdd(&current_concurrency, 3) + 3;
		assert(now <= concurrency);
		assert(now >= 3);
		if (use_delay)
			Sleep(rand()%3);
		InterlockedExchangeAdd(&current_concurrency, -3);
		semaphoreSignalMulti(shared_semaphore, 3);
	}
	InterlockedDecrement(&count);

	EXCEPTION_HANDLER_END

	return 0;
}

// Basic semaphore tests
AUTO_TEST_CHILD(Synchronization);
void TestSemaphore(void)
{
	CrypticSemaphore semaphore = NULL;
	int i;
	HANDLE handles[50] = {0};

	// Basic semaphore run without any real waits.
	// This should run almost every line of code; there are a few lines of code that require contention, that are not exercised this this.
	semaphoreInit(&semaphore, 2, 0);
	semaphoreInit(&semaphore, 2, 0);
	semaphoreWait(semaphore);
	semaphoreWait(semaphore);
	semaphoreSetMax(semaphore, 5);
	semaphoreSetMax(semaphore, 3);
	semaphoreSignal(semaphore);
	semaphoreSetMaxAndWait(semaphore, 5);
	semaphoreSetMaxAndWait(semaphore, 3);
	semaphoreSignal(semaphore);
	Sleep(2);  // wait for semaphoreSetMaxAndWait() to complete
	semaphoreDestroy(&semaphore);
	semaphoreInit(&semaphore, 2, 0);

	// High contention run, fast lock.
	concurrency = 3;
	max_count = normal_max_count;
	use_delay = false;
	semaphoreInit(&shared_semaphore, concurrency, 0);
	for (i = 0; i != ARRAY_SIZE(handles); ++i)
	{
		handles[i] = (HANDLE)_beginthread(workerthread_sync1, 0, NULL);
	}
	Sleep(2);
	for (;;)
	{
		if (!count)
			break;
		Sleep(1);
	}
	WaitForMultipleObjects(ARRAY_SIZE(handles), handles, TRUE, INFINITE);
	semaphoreDestroy(&shared_semaphore);

	// High contention run, slow lock.
	concurrency = 3;
	max_count = 10;
	use_delay = true;
	semaphoreInit(&shared_semaphore, concurrency, 0);
	for (i = 0; i != ARRAY_SIZE(handles); ++i)
	{
		handles[i] = (HANDLE)_beginthread(workerthread_sync1, 0, NULL);
	}
	Sleep(2);
	for (;;)
	{
		if (!count)
			break;
		Sleep(1);
	}
	WaitForMultipleObjects(ARRAY_SIZE(handles), handles, TRUE, INFINITE);
	semaphoreDestroy(&shared_semaphore);
}

// Semaphore tests using Signal with count > 1
AUTO_TEST_CHILD(Synchronization);
void TestSemaphoreMulti(void)
{
	int i;
	HANDLE handles[3] = {0};

	// High contention run, fast lock.
	concurrency = 9;
	max_count = normal_max_count;
	use_delay = false;
	semaphoreInit(&shared_semaphore, concurrency, 0);
	for (i = 0; i != ARRAY_SIZE(handles); ++i)
	{
		handles[i] = (HANDLE)_beginthread(workerthread_sync2, 0, NULL);
	}
	Sleep(2);
	for (;;)
	{
		if (!count)
			break;
		Sleep(1);
	}
	WaitForMultipleObjects(ARRAY_SIZE(handles), handles, TRUE, INFINITE);
	semaphoreDestroy(&shared_semaphore);

	// High contention run, slow lock.
	concurrency = 9;
	max_count = 10;
	use_delay = true;
	semaphoreInit(&shared_semaphore, concurrency, 0);
	for (i = 0; i != ARRAY_SIZE(handles); ++i)
	{
		handles[i] = (HANDLE)_beginthread(workerthread_sync2, 0, NULL);
	}
	Sleep(2);
	for (;;)
	{
		if (!count)
			break;
		Sleep(1);
	}
	WaitForMultipleObjects(ARRAY_SIZE(handles), handles, TRUE, INFINITE);
	semaphoreDestroy(&shared_semaphore);
}

// Simulate RW lock situation with semaphoreSignalMulti().
AUTO_TEST_CHILD(Synchronization);
void TestSemaphoreMultiRw(void)
{
	int i;
	HANDLE handles[4] = {0};

	// Without delays
	concurrency = 3;
	max_count = normal_max_count;
	use_delay = false;
	semaphoreInit(&shared_semaphore, concurrency, 0);
	for (i = 0; i != ARRAY_SIZE(handles) - 1; ++i)
	{
		handles[i] = (HANDLE)_beginthread(workerthread_sync1, 0, NULL);
	}
	_beginthread(workerthread_sync2, 0, NULL);
	Sleep(2);
	for (;;)
	{
		if (!count)
			break;
		Sleep(1);
	}
	WaitForMultipleObjects(ARRAY_SIZE(handles), handles, TRUE, INFINITE);
	semaphoreDestroy(&shared_semaphore);

	// With delays
	concurrency = 3;
	max_count = 10;
	use_delay = true;
	semaphoreInit(&shared_semaphore, concurrency, 0);
	for (i = 0; i != ARRAY_SIZE(handles) - 1; ++i)
	{
		handles[i] = (HANDLE)_beginthread(workerthread_sync1, 0, NULL);
	}
	handles[ARRAY_SIZE(handles) - 1] = (HANDLE)_beginthread(workerthread_sync2, 0, NULL);
	Sleep(2);
	for (;;)
	{
		if (!count)
			break;
		Sleep(1);
	}
	WaitForMultipleObjects(ARRAY_SIZE(handles), handles, TRUE, INFINITE);
	semaphoreDestroy(&shared_semaphore);
}

// Basic CrypticLock tests.
AUTO_TEST_CHILD(Synchronization);
void TestCrypticLock(void)
{
	CrypticLock lock = {0};
	bool success;
	Lock(&lock);
	success = TryLock(&lock);
	testAssert(success);
	Unlock(&lock);
	Unlock(&lock);
}

#define DURATION 3600000000LL*5

//#define PERF_CRITSEC
//#define PERF_CRITSEC_NOTIMERS
//#define PERF_MUTEX
//#define PERF_CRYPTICLOCK
//#define PERF_WRAPPER
//#define PERF_CRYPTICALSECTION
//#define PERF_THREADAGNOSTICMUTEX
//#define PERF_INTERLOCKED
//#define PERF_SEMAPHORE
//#define PERF_CRYPTICSEMAPHORE
//#define PERF_SRW
//#define PERF_FILE_ADVISORY
//#define PERF_FILE_MANDITORY

static CRITICAL_SECTION critsec;
static CRITICAL_SECTION critsec_notimers;
static HANDLE mutex;
static CrypticLock lock;
static CriticalSectionWrapper *wrapper = NULL;
static CrypticalSection crysec;
static ThreadAgnosticMutex tam;
static U32 interlocked = 0;
static HANDLE semaphore;
static CrypticSemaphore csemaphore;
static SRWLOCK srw;
static HANDLE file_advisory;
static HANDLE file_manditory;

volatile int i = 42;

__inline static void acquire()
{
#ifdef PERF_CRITSEC
	EnterCriticalSection(&critsec);
#endif
#ifdef PERF_CRITSEC_NOTIMERS
	(EnterCriticalSection)(&critsec_notimers);
#endif
#ifdef PERF_MUTEX
	WaitForSingleObject(mutex, INFINITE);
#endif
#ifdef PERF_CRYPTICLOCK
	Lock(&lock);
#endif
#ifdef PERF_WRAPPER
	EnterCriticalSection_wrapper(wrapper);
#endif
#ifdef PERF_CRYPTICALSECTION
	csEnter(&crysec);
#endif
#ifdef PERF_THREADAGNOSTICMUTEX
	tam = acquireThreadAgnosticMutex("bob");
#endif
#ifdef PERF_INTERLOCKED
	while (InterlockedIncrement(&interlocked) != 1)
		InterlockedDecrement(&interlocked);
#endif
#ifdef PERF_SEMAPHORE
	WaitForSingleObject(semaphore, INFINITE);
#endif
#ifdef PERF_CRYPTICSEMAPHORE
	semaphoreWait(csemaphore);
#endif
#ifdef PERF_SRW
	AcquireSRWLockExclusive(&srw);
#endif
#ifdef PERF_FILE_ADVISORY
	while ((file_advisory = CreateFile("lock1.txt", GENERIC_READ | GENERIC_WRITE, 0, NULL, CREATE_NEW, 0, NULL)) == NULL)
	{
	}
#endif
#ifdef PERF_FILE_MANDITORY
	LockFile(file_manditory, 0, 0, -1, -1);
#endif
}

__inline static void release()
{
#ifdef PERF_CRITSEC
	LeaveCriticalSection(&critsec);
#endif
#ifdef PERF_CRITSEC_NOTIMERS
	(LeaveCriticalSection)(&critsec_notimers);
#endif
#ifdef PERF_MUTEX
	ReleaseMutex(mutex);
#endif
#ifdef PERF_CRYPTICLOCK
	Unlock(&lock);
#endif
#ifdef PERF_WRAPPER
	LeaveCriticalSection_wrapper(wrapper);
#endif
#ifdef PERF_CRYPTICALSECTION
	csLeave(&crysec);
#endif
#ifdef PERF_THREADAGNOSTICMUTEX
	releaseThreadAgnosticMutex(tam);
#endif
#ifdef PERF_INTERLOCKED
	InterlockedDecrement(&interlocked);
#endif
#ifdef PERF_SEMAPHORE
	ReleaseSemaphore(semaphore, 1, NULL);
#endif
#ifdef PERF_CRYPTICSEMAPHORE
	semaphoreSignal(csemaphore);
#endif
#ifdef PERF_SRW
	ReleaseSRWLockExclusive(&srw);
#endif
#ifdef PERF_FILE_ADVISORY
	CloseHandle(file_advisory);
	DeleteFile("lock1.txt");
#endif
#ifdef PERF_FILE_MANDITORY
	UnlockFile(file_manditory, 0, 0, -1, -1);
#endif
}

static void do_cs_perf_test()
{
	acquire();
	++i;
	release();
}

static int otherwaiter(void *dummy)
{
	EXCEPTION_HANDLER_BEGIN

	for(;;)
		do_cs_perf_test();

	EXCEPTION_HANDLER_END

	return 0;
}

// Manual performance test harness for critical section performance.
AUTO_TEST_CHILD(synchperf);
void TestCsPerf(void)
{
#if 0
	unsigned counter = 0;
	int timer = timerAlloc();
	U64 start;
	float elapsed;

	// Initialize.
#ifdef PERF_CRITSEC
	InitializeCriticalSection(&critsec);
#endif
#ifdef PERF_CRITSEC_NOTIMERS
	InitializeCriticalSection(&critsec_notimers);
#endif
#ifdef PERF_MUTEX
	mutex = CreateMutex(NULL, false, "llamaMutex");
#endif
#ifdef PERF_CRYPTICLOCK
	// none necessary
#endif
#ifdef PERF_WRAPPER
	InitializeCriticalSection_wrapper(&wrapper);
#endif
#ifdef PERF_CRYPTICALSECTION
	// none necessary?
#endif
#ifdef PERF_THREADAGNOSTICMUTEX
	// none necessary?
#endif
#ifdef PERF_INTERLOCKED
	interlocked = 0;
#endif
#ifdef PERF_SEMAPHORE
	semaphore = CreateSemaphore(NULL, 1, 10, "llamasemaphore");
#endif
#ifdef PERF_CRYPTICSEMAPHORE
	semaphoreInit(&csemaphore, 1, 1);
#endif
#ifdef PERF_SRW
	InitializeSRWLock(&srw);
#endif
#ifdef PERF_FILE_ADVISORY
	DeleteFile("lock1.txt");
#endif
#ifdef PERF_FILE_MANDITORY
	file_manditory = CreateFile("lock2.txt", GENERIC_READ | GENERIC_WRITE, 0, NULL, CREATE_NEW, 0, NULL);
#endif

	//EnterCriticalSection(&critsec);
	//_beginthread(otherwaiter, 0, NULL);
	mutex = CreateMutex(NULL, FALSE, NULL);

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

		do_cs_perf_test();

		++counter;
	}

	elapsed = timerElapsed(timer);

	
	//LeaveCriticalSection(&critsec);

	printf("%f ns\n", elapsed/counter*1000000000);

	//(void)getchar();
#endif
}
