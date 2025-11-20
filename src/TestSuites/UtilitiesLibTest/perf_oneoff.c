// One-off performance test harness

#include "TestHarness.h"
#include "timing.h"
#include "wininclude.h"

// The number of total trials
#define TRIALS 5

// Target duration to test each configuration, in CPU cycles
#define DURATION 3600000000LL/3

// For performance, the number of trials after which we check if we should abort.
// For relatively fast operations, 0xffff is a good value
// For slow operations, 1 is fine
#define TRIAL_COUNT_GRANULARITY 1

// Time scale for reporting results
// 1000000000 ns
#define TIME_SCALE 1000 // ms

// State can be used to pass data to the test, or to prevent the compiler from eliding operations in optimization
#define STATE_TYPE unsigned

// How to accumulate state
#define ACCUMULATE_STATE(X, Y) X += Y		// addition prevents elision, and is very cheap

// Official timer
static int timer;

// Base case, for testing the performance test machinery itself.
static STATE_TYPE operation_noop(STATE_TYPE state)
{
	return state;
}

// Test case
static STATE_TYPE operation_test1(STATE_TYPE state)
{
	return state;
}

// Test case
static STATE_TYPE operation_test2(STATE_TYPE state)
{
	return state;
}

static void check_state(STATE_TYPE state)
{
	assert(state != 0xdeadbeef);
}

#define RUN_TRIAL(FUNC)										\
static double run_trial_ ## FUNC()							\
{															\
	unsigned count = 0;										\
	STATE_TYPE state = 0;									\
	U64 start;												\
	float elapsed;											\
															\
	GET_CPU_TICKS_64(start);								\
	timerStart(timer);										\
	for (;;)												\
	{														\
		U64 now;											\
															\
		GET_CPU_TICKS_64(now);								\
		if ((count & TRIAL_COUNT_GRANULARITY) == 0)			\
		{													\
			GET_CPU_TICKS_64(now);							\
			if (now - start >= DURATION)					\
				break;										\
		}													\
															\
		ACCUMULATE_STATE(state, operation_ ## FUNC(state));	\
		++count;											\
		GET_CPU_TICKS_64(now);								\
	}														\
															\
	elapsed = timerElapsed(timer);							\
	check_state(state);										\
	return (double)elapsed/count*TIME_SCALE;				\
}

RUN_TRIAL(noop)
RUN_TRIAL(test1)
RUN_TRIAL(test2)

static run_trial()
{
	double noop = run_trial_noop();
	double test1 = run_trial_test1();
	double test2 = run_trial_test2();
	printf("%f %f %f\n", noop, test1, test2);
}

AUTO_TEST_CHILD(PerfOneOff);
void PerfOneOffTest(void)
{
	int i;

	// Create timer.
	timer = timerAlloc();

	// Set high priority and prepare to run.
	Sleep(1);
	SetPriorityClass(GetCurrentProcess(), HIGH_PRIORITY_CLASS);

	// Warming run.
	printf("\nWarming: ");
	run_trial();

	for (i = 0; i != TRIALS; ++i)
		run_trial();
}
