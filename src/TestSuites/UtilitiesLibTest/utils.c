// Tests for utils.c

#include "TestHarness.h"
#include "utils.h"
#include "EString.h"
#include "mathutil.h"

AUTO_TEST_GROUP(utils, UtilitiesLib);

AUTO_TEST_CHILD(utils);
void TestSystem_w_output(void)
{
	char *out = NULL;
	system_w_output("ipconfig", &out);
	estrSetSize(&out, estrLength(&out)+1);
	estrTrimLeadingAndTrailingWhitespace(&out);
	testAssert(strStartsWith(out, "Windows IP Configuration"));
}

AUTO_TEST_CHILD(utils);
void testAlign(void)
{
	void *address = (void*)(U64) 0x0FFF0000FFFF0001;
	void *expectedAddress = (void*)(U64) 0x0FFF0000FFFF0004;
	void *newAddress;

	newAddress = AlignPointerUpPow2(address, 4);
	testAssertPtrEqual(expectedAddress, newAddress);
}