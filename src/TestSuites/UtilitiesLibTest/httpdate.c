// Tests for timeGetSecondsSince2000FromHttpDateString in timing.h.

#include "TestHarness.h"
#include "timing.h"

AUTO_TEST_GROUP(httpdate, UtilitiesLib);

AUTO_TEST_CHILD(httpdate);
void TestHttpdate(void)
{
	const U32 expected = 153046177;
	U32 actual;
	actual = timeGetSecondsSince2000FromHttpDateString("Sat, 06 Nov 2004 08:49:37 GMT");
	testAssertEqual(actual, expected);
	actual = timeGetSecondsSince2000FromHttpDateString("Saturday, 06-Nov-04 08:49:37 GMT");
	testAssertEqual(actual, expected);
	actual = timeGetSecondsSince2000FromHttpDateString("Sat Nov  6 08:49:37 2004");
	testAssertEqual(actual, expected);
}
