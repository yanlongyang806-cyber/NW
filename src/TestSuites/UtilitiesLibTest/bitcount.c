// One of our interview questions

#include "rand.h"
#include "TestHarness.h"
#include "timing.h"
#include "wininclude.h"

AUTO_TEST_GROUP(bitcount, Interview);

// Target duration to test each configuration, in CPU cycles
#define DURATION 3600000000LL*5

// Number of trials
unsigned bitcount_trials = 10;
AUTO_CMD_INT(bitcount_trials, bitcount_trials);

// Size of bit count lookup table
#ifdef _M_X64
#define LOOKUP_TABLE_SIZE (size_t)4*1024*1024*1024
#else
#define LOOKUP_TABLE_SIZE 1*1024*1024*1024
#endif

// Initial seed
#define INITIAL_SEED 0xdeadbeef

// Official timer
static int timer;

// Random seed, reset to INITIAL_SEED before each trial.
static U32 seed;

// Reset RNG to initial seed.
static void rand_reset()
{
	seed = INITIAL_SEED;
}

// Generate a single 32-bit random value.
static U32 rand_stepU32()
{
	return randomStepSeed(&seed, RandType_BLORN_Static);
	//return randomStepSeed(NULL, RandType_Mersenne_Static);
	//seed = (seed << 3) ^ INITIAL_SEED;
	//return seed;
	//return 0;
	//return 42;
	//return 0xdeadbeef;
}

// Generate a single 64-bit random value.
static U64 rand_stepU64()
{
	U64 low = rand_stepU32();
	U64 high = rand_stepU32();
	return low | high << 32;
}

// Allocate BLORN, warm up, etc.
static void rand_init()
{
	int i;
	rand_reset();
	initRand();
	for (i = 0; i != 10000; ++i)
		randomStepSeed(&seed, RandType_BLORN_Static);
}

// Noop functions
static unsigned char bitcount_noopU32(U32 dummy)
{
	return 15;
}
static unsigned char bitcount_noopU64(U64 dummy)
{
	return 31;
}

// Direct loop implemention.
#define BITCOUNT_LOOP(TYPE)												\
	static unsigned char bitcount_loop ## TYPE(TYPE number)				\
	{																	\
		int result = 0;													\
																		\
		while (number)													\
		{																\
			result += number & 1;										\
			number >>= 1;												\
		}																\
																		\
		return result;													\
	}
BITCOUNT_LOOP(U32)
BITCOUNT_LOOP(U64)

//  Optimized bitcount loop, looping once per set bit; Peter Wegner 1960.
#define BITCOUNT_LOOP_FAST(TYPE)										\
	static unsigned char bitcount_loop_fast ## TYPE(TYPE number)		\
	{																	\
		int result = 0;													\
																		\
		while (number)													\
		{																\
			++result;													\
			number &= number - 1;										\
		}																\
																		\
		return result;													\
	}
BITCOUNT_LOOP_FAST(U32)
BITCOUNT_LOOP_FAST(U64)

// Version using 64-bit operations and lots of magic, from HAKMEM
// adapted from "Bit Twiddling Hacks" http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSet64
// general method in HAKMEM by Rich Schroeppel, published in this form by Sean Anderson, probably first in 2001
unsigned char bitcount_64bitinsnU32(U32 number)
{
	unsigned char c; // c accumulates the total bits set in number

	c =  ((number & 0xfff) * 0x1001001001001ULL & 0x84210842108421ULL) % 0x1f;
	c += (((number & 0xfff000) >> 12) * 0x1001001001001ULL & 0x84210842108421ULL) % 
		0x1f;
	c += ((number >> 24) * 0x1001001001001ULL & 0x84210842108421ULL) % 0x1f;

	return c;
}

// Extend the above to 64-bit by doing it twice
unsigned char bitcount_64bitinsnU64(U64 number)
{
	return bitcount_64bitinsnU32(number) + bitcount_64bitinsnU32(number >> 32);
}

// Parallel bit counter using "binary magic numbers,"
// adapted from "Bit Twiddling Hacks" http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel; Edwin Freed 1983.
// Alex Werner implemented a version of this as countBitsFast() in mathutil.h in 2010.
unsigned char bitcount_parallelU32(U32 number)
{
	U32 c; // store the total here
	static const U32 S[] = {1, 2, 4, 8, 16}; // Magic Binary Numbers
	static const U32 B[] = {0x55555555, 0x33333333, 0x0F0F0F0F, 0x00FF00FF, 0x0000FFFF};

	c = number - ((number >> 1) & B[0]);
	c = ((c >> S[1]) & B[1]) + (c & B[1]);
	c = ((c >> S[2]) + c) & B[2];
	c = ((c >> S[3]) + c) & B[3];
	c = ((c >> S[4]) + c) & B[4];

	return c;
}

// Parallel bit counter, like the above, but expanded to 64 bits
unsigned char bitcount_parallelU64(U64 number)
{
	U64 c; // store the total here
	static const U32 S[] = {1, 2, 4, 8, 16, 32}; // Magic Binary Numbers
	static const U64 B[] = {0x5555555555555555, 0x3333333333333333, 0x0F0F0F0F0F0F0F0F, 0x00FF00FF00FF00FF, 0x0000FFFF0000FFFF,
							0x00000000FFFFFFFF};

	c = number - ((number >> 1) & B[0]);
	c = ((c >> S[1]) & B[1]) + (c & B[1]);
	c = ((c >> S[2]) + c) & B[2];
	c = ((c >> S[3]) + c) & B[3];
	c = ((c >> S[4]) + c) & B[4];
	c = ((c >> S[5]) + c) & B[5];

	return c;
}

// AMD's bitcount algorithm, called the "best" by Sean Anderson,
// adapted from "Bit Twiddling Hacks" http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel; published by AMD in 2005, with some
// optimizations suggested by people in 2005 and 2006.
#define BITCOUNT_AMD(TYPE)															\
unsigned char bitcount_amd ## TYPE(TYPE number)												\
{																							\
	number = number - ((number >> 1) & (TYPE)~(TYPE)0/3);									\
	number = (number & (TYPE)~(TYPE)0/15*3) + ((number >> 2) & (TYPE)~(TYPE)0/15*3);		\
	number = (number + (number >> 4)) & (TYPE)~(TYPE)0/255*15;								\
	return (TYPE)(number * ((TYPE)~(TYPE)0/255)) >> (sizeof(TYPE) - 1) * CHAR_BIT;			\
}
BITCOUNT_AMD(U32)
BITCOUNT_AMD(U64)

// Lookup table, initialized by init_lookup_table().
static unsigned char *lookup_table = NULL;

// Initialize lookup table.
static void init_lookup_table()
{
	size_t i;

	loadstart_printf("\nInitializing lookup table...");

	lookup_table = malloc(LOOKUP_TABLE_SIZE * sizeof(*lookup_table));
	for (i = 0; i != LOOKUP_TABLE_SIZE; ++i)
		lookup_table[i] = bitcount_amdU32((U32)i);

	loadend_printf("done.\n");
}

// Use table large enough to look up entire 32-bit integer.
static unsigned char bitcount_table32_U32(U32 number)
{
	return lookup_table[number];
}

// Look up in 16-bit word chunks.
static unsigned char bitcount_table16_U32(U32 number)
{
	return lookup_table[number >> 16] + lookup_table[number & 0xffff];
}

// Look up in byte chunks.
static unsigned char bitcount_table8_U32(U32 number)
{
	return lookup_table[number & 0xff]
		+ lookup_table[number >> 8 & 0xff]
		+ lookup_table[number >> 16 & 0xff]
		+ lookup_table[number >> 24];
}

// Look up in nibble chunks.
static unsigned char bitcount_table4_U32(U32 number)
{
	return lookup_table[number & 0xf]
	+ lookup_table[number >> 4 & 0xf]
	+ lookup_table[number >> 8 & 0xf]
	+ lookup_table[number >> 12 & 0xf]
	+ lookup_table[number >> 16 & 0xf]
	+ lookup_table[number >> 20 & 0xf]
	+ lookup_table[number >> 24 & 0xf]
	+ lookup_table[number >> 28];
}

// Use table in 32-bit "double word" chunks.
static unsigned char bitcount_table32_U64(U64 number)
{
	return bitcount_table32_U32(number) + bitcount_table32_U32(number >> 32);
}

// Look up in 16-bit word chunks.
static unsigned char bitcount_table16_U64(U64 number)
{
	return bitcount_table16_U32(number) + bitcount_table16_U32(number >> 32);
}

// Look up in byte chunks.
static unsigned char bitcount_table8_U64(U64 number)
{
	return bitcount_table8_U32(number) + bitcount_table8_U32(number >> 32);
}

// Look up in nibble chunks.
static unsigned char bitcount_table4_U64(U64 number)
{
	return bitcount_table4_U32(number) + bitcount_table4_U32(number >> 32);
}

// Force the compiler to actually do the computation.
#define CHECK_SUM(TYPE)										\
static void check_sum ## TYPE(unsigned sum)					\
{															\
	assert(sum && sum != 0xdeadbeef);						\
}
CHECK_SUM(U32)
CHECK_SUM(U64)

// Test a particular algorithm, return time in nanoseconds per cycle.
#define TEST_BITCOUNT(FUNC, TYPE)							\
static double test_bitcount_ ## FUNC ## TYPE()				\
{															\
	unsigned count = 0;										\
	unsigned sum = 0;										\
	U64 start;												\
	float elapsed;											\
															\
	rand_reset();											\
	GET_CPU_TICKS_64(start);								\
	timerStart(timer);										\
	for (;;)												\
	{														\
		U64 now;											\
		TYPE number;										\
															\
		GET_CPU_TICKS_64(now);								\
		if ((count & 0xffff) == 0)							\
		{													\
			GET_CPU_TICKS_64(now);							\
			if (now - start >= DURATION)					\
				break;										\
		}													\
															\
		number = rand_step ## TYPE();						\
		sum += bitcount_ ## FUNC ## TYPE(number);			\
		++count;											\
		GET_CPU_TICKS_64(now);								\
	}														\
															\
	elapsed = timerElapsed(timer);							\
	check_sum ## TYPE(sum);									\
	return (double)elapsed/count*1000000000;				\
}

TEST_BITCOUNT(noop, U32)
TEST_BITCOUNT(noop, U64)
TEST_BITCOUNT(loop, U32)
TEST_BITCOUNT(loop, U64)
TEST_BITCOUNT(loop_fast, U32)
TEST_BITCOUNT(loop_fast, U64)
TEST_BITCOUNT(64bitinsn, U32)
TEST_BITCOUNT(64bitinsn, U64)
TEST_BITCOUNT(parallel, U32)
TEST_BITCOUNT(parallel, U64)
TEST_BITCOUNT(amd, U32)
TEST_BITCOUNT(amd, U64)
TEST_BITCOUNT(table32_, U32)
TEST_BITCOUNT(table16_, U32)
TEST_BITCOUNT(table8_, U32)
TEST_BITCOUNT(table4_, U32)
TEST_BITCOUNT(table32_, U64)
TEST_BITCOUNT(table16_, U64)
TEST_BITCOUNT(table8_, U64)
TEST_BITCOUNT(table4_, U64)

// Test algorithm correctness.
static void test_algorithms()
{
	int i;

	loadstart_printf("\nTesting algorithms...");

	rand_reset();
	for (i = 0; i != 10000; ++i)
	{
		U32 value = rand_stepU32();
		U64 value64;
		unsigned char reference;

		// Check 32-bit algorithms.
		reference = bitcount_loopU32(value);
		assert(reference == bitcount_loop_fastU32(value));
		assert(reference == bitcount_64bitinsnU32(value));
		assert(reference == bitcount_parallelU32(value));
		assert(reference == bitcount_amdU32(value));
#ifdef _M_X64
		assert(reference == bitcount_table32_U32(value));
#endif
		assert(reference == bitcount_table16_U32(value));
		assert(reference == bitcount_table8_U32(value));
		assert(reference == bitcount_table4_U32(value));

		// Check 64-bit algorithms.
		value64 = rand_stepU64();
		reference = bitcount_loopU64(value64);
		assert(reference == bitcount_loop_fastU64(value64));
		assert(reference == bitcount_64bitinsnU64(value64));
		assert(reference == bitcount_parallelU64(value64));
		assert(reference == bitcount_amdU64(value64));
#ifdef _M_X64
		assert(reference == bitcount_table32_U64(value64));
#endif
		assert(reference == bitcount_table16_U64(value64));
		assert(reference == bitcount_table8_U64(value64));
		assert(reference == bitcount_table4_U64(value64));
	}

	loadend_printf("done.\n");
}

AUTO_TEST_CHILD(bitcount);
void TestBitCount(void)
{
	int i;
	timer = timerAlloc();

	// Initialize lookup table.
	init_lookup_table();

	// Test all algorithms.
	rand_init();
	test_algorithms();

	// Set high priority and prepare to run.
	Sleep(1);
	SetPriorityClass(GetCurrentProcess(), HIGH_PRIORITY_CLASS);

	// Run trials.
	for (i = 0; i != bitcount_trials; ++i)
	{
		printf("\nTrial %d\n", i + 1);
		printf("test_bitcount_noopU32 %f\n", test_bitcount_noopU32());
		printf("test_bitcount_noopU64 %f\n", test_bitcount_noopU64());
		printf("test_bitcount_loopU32 %f\n", test_bitcount_loopU32());
		printf("test_bitcount_loopU64 %f\n", test_bitcount_loopU64());
		printf("test_bitcount_loop_fastU32 %f\n", test_bitcount_loop_fastU32());
		printf("test_bitcount_loop_fastU64 %f\n", test_bitcount_loop_fastU64());
		printf("test_bitcount_64bitinsnU32 %f\n", test_bitcount_64bitinsnU32());
		printf("test_bitcount_64bitinsnU64 %f\n", test_bitcount_64bitinsnU64());
		printf("test_bitcount_parallelU32 %f\n", test_bitcount_parallelU32());
		printf("test_bitcount_parallelU64 %f\n", test_bitcount_parallelU64());
		printf("test_bitcount_amdU32 %f\n", test_bitcount_amdU32());
		printf("test_bitcount_amdU64 %f\n", test_bitcount_amdU64());
#ifdef _M_X64
		printf("test_bitcount_table32_U32 %f\n", test_bitcount_table32_U32());
		printf("test_bitcount_table32_U64 %f\n", test_bitcount_table32_U64());
#endif
		printf("test_bitcount_table16_U32 %f\n", test_bitcount_table16_U32());
		printf("test_bitcount_table16_U64 %f\n", test_bitcount_table16_U64());
		printf("test_bitcount_table8_U32 %f\n", test_bitcount_table8_U32());
		printf("test_bitcount_table8_U64 %f\n", test_bitcount_table8_U64());
		printf("test_bitcount_table4_U32 %f\n", test_bitcount_table4_U32());
		printf("test_bitcount_table4_U64 %f\n", test_bitcount_table4_U64());
	}

	// Wait for a key.
	printf("\nDone.\n");
	(void)getchar();
}
