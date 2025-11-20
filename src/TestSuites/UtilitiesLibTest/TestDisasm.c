// Tests for udis86

#include "disasm.h"
#include "TestHarness.h"

//#define TESTS_THAT_THROW

AUTO_TEST_GROUP(disasm, UtilitiesLib);

// Test return point detection heuristics.
AUTO_TEST_CHILD(disasm);
void TestReturnPoint(void)
{
	char junk[] = {0xde, 0xad, 0xbe, 0xef, 0x1, 0x2, 0x3, 0x4, 0x5, 0xde, 0xad, 0xbe, 0xef, 0x1, 0x2, 0x3, 0x4, 0x5, 0xde, 0xad, 0xbe, 0xef, 0x1, 0x2, 0x3, 0x4, 0x5};
	char some_insns[] = {0x55, 0x8B, 0xEC, 0x81, 0xEC, 0x38, 0x03, 0x00, 0x00};
	char stuff_with_call[] = {0xE8, 0x10, 0x55, 0xFC, 0xFF, 0x83, 0xC4, 0x04};
	bool success;

	// Test null pointer.
	success = disasm_is_return_point(NULL);
	testAssert(!success);

#ifdef TESTS_THAT_THROW

	// Test bad pointer.
	success = disasm_is_return_point((void*)0xdeadbeef);
	testAssert(!success);

#endif  // TESTS_THAT_THROW

	// Test some junk.
	success = disasm_is_return_point(junk + 16);
	testAssert(!success);

	// Test good instructions, with no call.
	success = disasm_is_return_point(some_insns + 3);
	testAssert(!success);

	// Test good instructions, that appears to be a return point.
	success = disasm_is_return_point(stuff_with_call+5);
	testAssert(success);

	// Test the real deal.
	success = disasm_is_return_point(*(void **)_AddressOfReturnAddress());
	testAssert(success);
}
