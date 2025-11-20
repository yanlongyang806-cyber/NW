// Gimme tests

// TODO: Figure out how this actually should work, for things that need to _do_ something.

#include "gimmeDLLWrapper.h"
#include "TestHarness.h"

AUTO_TEST_GROUP(Gimme, UtilitiesLib);

// gimmeDLLSetDefaultCheckinComment()
AUTO_TEST_CHILD(Gimme);
void TestSetDefaultCheckinComment(void)
{
	GimmeErrorValue result = gimmeDLLSetDefaultCheckinComment("bob");
	bool loaded = gimmeDLLQueryExists();
	testAssert(result == GIMME_NO_ERROR || result == GIMME_ERROR_NO_DLL && !loaded);

	// TODO: Make sure it actually works.
}
