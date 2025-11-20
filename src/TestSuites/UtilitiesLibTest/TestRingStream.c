// Tests for RingStream.h

#include "RingStream.h"
#include "TestHarness.h"

AUTO_TEST_GROUP(RingStream, UtilitiesLib);

AUTO_TEST_CHILD(RingStream);
void TestRingStream(void)
{
	char long_string[] = "thisonetimeiwenttoaverybigplaceanditwasreallycool";
	RingStream ring = ringStreamCreate(6);
	testAssert(ring);

	ringStreamPush(ring, "12345", 5);
	ringStreamPush(ring, "67890ab", 7);
	testAssert(!memcmp(ringStreamBuffer(ring), "90ab5678", 8));
	testAssertEqual(ringStreamPosition(ring), 4);

	ringStreamPush(ring, "nicegirl", 8);
	testAssert(!memcmp(ringStreamBuffer(ring), "girlnice", 8));
	testAssertEqual(ringStreamPosition(ring), 4);

	ringStreamPush(ring, long_string, sizeof(long_string)-1);
	testAssert(!memcmp(ringStreamBuffer(ring), "ycoolall", 8));
	testAssertEqual(ringStreamPosition(ring), 5);

	ringStreamWriteDebugFile(ring, "TestRing");

	ringStreamDestroy(ring);

	ring = ringStreamCreate(8);
	ringStreamPush(ring, "1234567890", 10);
	testAssert(!memcmp(ringStreamBuffer(ring), "90345678", 8));
	ringStreamDestroy(ring);
}
