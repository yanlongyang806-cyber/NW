// Tests for file.c

#include "TestHarness.h"
#include "file.h"

AUTO_TEST_GROUP(file, UtilitiesLib);

AUTO_TEST_CHILD(file);
void TestfileGetNameSpacePath(void)
{
	char ns[MAX_PATH], res[MAX_PATH];
	bool rv;

	//rv = fileGetNameSpacePath("", ns, res);
	//testAssert(rv);
	//testAssertStrEqual(ns, "");
	//testAssertStrEqual(res, "");

	rv = fileGetNameSpacePath("defs/foo", ns, res);
	testAssert(!rv);

	rv = fileGetNameSpacePath("C:/defs/foo", ns, res);
	testAssert(!rv);

	rv = fileGetNameSpacePath("C:\\defs/foo", ns, res);
	testAssert(!rv);

	rv = fileGetNameSpacePath("net:/defs/foo", ns, res);
	testAssert(!rv);

	rv = fileGetNameSpacePath("blah:defs/foo", ns, res);
	testAssert(!rv);

	rv = fileGetNameSpacePath("blah:/defs/foo", ns, res);
	testAssert(rv);
	testAssertStrEqual(ns, "blah");
	testAssertStrEqual(res, "/defs/foo");

	rv = fileGetNameSpacePath("blah:\\defs/foo", ns, res);
	testAssert(rv);
	testAssertStrEqual(ns, "blah");
	testAssertStrEqual(res, "\\defs/foo");

	rv = fileGetNameSpacePath("ns/blah/defs/foo", ns, res);
	testAssert(rv);
	testAssertStrEqual(ns, "blah");
	testAssertStrEqual(res, "/defs/foo");

	rv = fileGetNameSpacePath("ns/blah", ns, res);
	testAssert(!rv);

	rv = fileGetNameSpacePath("ns/blah\\defs/foo", ns, res);
	testAssert(rv);
	testAssertStrEqual(ns, "blah");
	testAssertStrEqual(res, "\\defs/foo");

	rv = fileGetNameSpacePath("ns/blah/defs\\foo", ns, res);
	testAssert(rv);
	testAssertStrEqual(ns, "blah");
	testAssertStrEqual(res, "/defs\\foo");

	rv = fileGetNameSpacePath("ns/blah\\defs\\foo", ns, res);
	testAssert(rv);
	testAssertStrEqual(ns, "blah");
	testAssertStrEqual(res, "\\defs\\foo");
}