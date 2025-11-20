// Tests for FilespecMap.c

#include "TestHarness.h"
#include "FilespecMap.h"
#include "utils.h"

AUTO_TEST_GROUP(FilespecMap, UtilitiesLib);

AUTO_TEST_CHILD(FilespecMap);
void TestBasicMap(void)
{
	int i;
	bool rv;
	FilespecMap *fsm = filespecMapCreate();
	filespecMapAddInt(fsm, "foo", 1);
	filespecMapAddInt(fsm, "foo/*", 2);
	filespecMapAddInt(fsm, "foo/bar", 3);
	filespecMapAddInt(fsm, "foo/*/baz/*.txt", 4);
	filespecMapAddInt(fsm, "foo/*/baz", 5);
	filespecMapAddInt(fsm, "a*c", 6);
	filespecMapAddInt(fsm, "*zz", 7);

	rv = filespecMapGetInt(fsm, "foo", &i);
	testAssert(rv);
	testAssertEqual(i, 1);

	rv = filespecMapGetInt(fsm, "foo/bar", &i);
	testAssert(rv);
	testAssertEqual(i, 3);

	rv = filespecMapGetInt(fsm, "foo/baz", &i);
	testAssert(rv);
	testAssertEqual(i, 2);

	rv = filespecMapGetInt(fsm, "bar", &i);
	testAssert(!rv);

	rv = filespecMapGetInt(fsm, "foo/bar/baz/test.txt", &i);
	testAssert(rv);
	testAssertEqual(i, 4);

	rv = filespecMapGetInt(fsm, "foo/bar/baz/test", &i);
	testAssert(rv);
	testAssertEqual(i, 2);

	rv = filespecMapGetInt(fsm, "foo/bar/baz/", &i);
	testAssert(rv);
	testAssertEqual(i, 2);

	rv = filespecMapGetInt(fsm, "ac", &i);
	testAssert(rv);
	testAssertEqual(i, 6);

	rv = filespecMapGetInt(fsm, "aaaazz", &i);
	testAssert(rv);
	testAssertEqual(i, 7);
}

AUTO_TEST_CHILD(FilespecMap);
void TestMatch(void)
{
	bool matched;

	// Positive cases
	matched = matchExact("", "");
	testAssert(matched);
	matched = matchExact("A/b", "a\\B");
	testAssert(matched);
	matched = matchExact("a\\B", "A/b");
	testAssert(matched);
	matched = matchExact("*", "zsefzse");
	testAssert(matched);
	matched = matchExact("*********", "r2");
	testAssert(matched);
	matched = matchExact("*bob", "bob");
	testAssert(matched);
	matched = matchExact("*bob", "xbob");
	testAssert(matched);
	matched = matchExact("yum*bob", "yumbob");
	testAssert(matched);
	matched = matchExact("yum*bob", "YUMzxcvbob");
	testAssert(matched);
	matched = matchExact("YUM*bob", "yumzxcvbob");
	testAssert(matched);
	matched = matchExact("*aa*bb*cc*dd*ee", "bbbaaababbddcceeddddee");
	testAssert(matched);
	matched = matchExact("lovely*anteater*invasion*delicious", "lovely but he is an anteater over invasion but delicious");
	testAssert(matched);
	matched = matchExact("*lovely*anteater*invasion*delicious", "HELLO lovely but he is an anteater over invasion but delicious");
	testAssert(matched);
	matched = matchExact("lovely*anteater*invasion***delicious*", "lovely but he is an antanteater over invasion but delicious!");
	testAssert(matched);
	matched = matchExact("*lovely**anteater*invasion*delicious*", "razzilovely but he is an anteater over invasion but delicious!pwn pwn pwn");
	testAssert(matched);

	// Negative cases
	matched = matchExact("a", "zsefzse");
	testAssert(!matched);
	matched = matchExact("zsef", "zsefzse");
	testAssert(!matched);
	matched = matchExact("", "x");
	testAssert(!matched);
	matched = matchExact("x", "");
	testAssert(!matched);
	matched = matchExact("a*", "baaaaaa");
	testAssert(!matched);
	matched = matchExact("*a", "aaaaaab");
	testAssert(!matched);
	matched = matchExact("1*2*3", "1333222111");
	testAssert(!matched);
	matched = matchExact("*1*2*3*", "1333222111");
	testAssert(!matched);
	matched = matchExact("lovely*anteater*invasion*delicious", "extralovely but he is an anteater over invasion but delicious");
	testAssert(!matched);
	matched = matchExact("lovely*anteater*invasion*delicious", "zxcvlovely but he is an anteater over invasion but delicious?");
	testAssert(!matched);
	matched = matchExact("*lovely*anteater*invasion*delicious", "HELLO lovely but he is an anteater over invasion but delicious BYE");
	testAssert(!matched);
	matched = matchExact("lovely*anteater*invasion***delicious*", "nascent lovely but he is an anteater over invasion but delicious!");
	testAssert(!matched);
	matched = matchExact("*lovely**anteater*invasion*delicious*", "razzilovely but he is an aarvark eater over invasion but delicious!");
	testAssert(!matched);

	// Other stuff
	matched = simpleMatchExactSensitiveFast("a*c", "ac");
	testAssert(matched);
	matched = matchExactSensitive("a*c", "ac");
	testAssert(matched);
	matched = matchExact("a*c", "ac");
	testAssert(matched);
}
