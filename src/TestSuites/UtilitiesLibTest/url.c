// Tests for url.c

#include "TestHarness.h"
#include "url.h"
#include "EString.h"

AUTO_TEST_GROUP(url, UtilitiesLib);

AUTO_TEST_CHILD(url);
void TestEscape(void)
{
	char *esc = NULL;
	estrPrintf(&esc, "test");
	urlEscape(NULL, &esc, false, false);
	testAssertStrEqual(esc, "test");
	urlEscape("", &esc, false, false);
	testAssertStrEqual(esc, "test");
}