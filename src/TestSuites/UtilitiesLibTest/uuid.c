// Tests for uuid.c

#include "TestHarness.h"
#include "uuid.h"

AUTO_TEST_GROUP(uuid, UtilitiesLib);

AUTO_TEST_CHILD(uuid);
void TestV4String(void)
{
	char buf[1024];
	UUID_t *uuid = uuidGenerateV4();
	uuidString(uuid, SAFESTR(buf));
	testAssertEqual(buf[8], '-');
	testAssertEqual(buf[13], '-');
	testAssertEqual(buf[14], '4');
	testAssertEqual(buf[18], '-');
	testAssert(buf[19]=='8'||buf[19]=='9'||buf[19]=='a'||buf[19]=='b');
	testAssertEqual(buf[23], '-');
}

AUTO_TEST_CHILD(uuid);
void TestV4StringMultiple(void)
{
	int i;
	for(i=0; i<20; i++)
		TestV4String();
}
