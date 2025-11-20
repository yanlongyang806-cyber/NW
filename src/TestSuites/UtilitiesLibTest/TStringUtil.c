/***************************************************************************



***************************************************************************/


#include "TestHarness.h"
#include "mathutil.h"
#include "StringUtil.h"

#include "AutoGen/TStringUtil_c_atest.c"

AUTO_TEST_GROUP(StringUtil, UtilitiesLib);

//////////////////////////////////////////////////////////////////////////

AUTO_TEST_GROUP(UTF8GetCodepointLength, StringUtil);
AUTO_TEST_BLOCK(
	ASSERT(Empty, UTF8GetCodepointLength("") == 1);
	ASSERT(Bit0, UTF8GetCodepointLength("a") == 1);
	ASSERT(Bit110, UTF8GetCodepointLength("\xc0") == 2);
	ASSERT(Bit11100, UTF8GetCodepointLength("\xd1") == 2);
	ASSERT(Bit11101, UTF8GetCodepointLength("\xe2") == 3);
	ASSERT(Bit11110, UTF8GetCodepointLength("\xf3") == 4);
);

//////////////////////////////////////////////////////////////////////////

AUTO_TEST_GROUP(WideToUTF8CodepointConvert, StringUtil);
AUTO_TEST_BLOCK(
	ASSERT(Zero, strlen(WideToUTF8CodepointConvert(0)) == 0);
	ASSERT(OneLow, strlen(WideToUTF8CodepointConvert(1)) == 1);
	ASSERT(OneHigh, strlen(WideToUTF8CodepointConvert(0x7F)) == 1);
	ASSERT(TwoLow, strlen(WideToUTF8CodepointConvert(0x80)) == 2);
	ASSERT(TwoHigh, strlen(WideToUTF8CodepointConvert(0x7FF)) == 2);
	ASSERT(ThreeLow, strlen(WideToUTF8CodepointConvert(0x800)) == 3);
	ASSERT(ThreeHigh, strlen(WideToUTF8CodepointConvert(0xFFFF)) == 3);
);

AUTO_TEST_GROUP(UTF8StringIsValid, StringUtil);
AUTO_TEST_BLOCK(
	ASSERT(Empty, UTF8StringIsValid("", NULL));
	ASSERT(Ascii, UTF8StringIsValid("Hello World", NULL));
	ASSERT(Latin, UTF8StringIsValid("\xc3\xbf", NULL)); // U+00FF
	ASSERT(Incomplete, !UTF8StringIsValid("\xa9", NULL));
	ASSERT(BadTwoBytes, !UTF8StringIsValid("\xa9!", NULL));
);

//////////////////////////////////////////////////////////////////////////

AUTO_TEST_GROUP(UTF8GetLength, StringUtil);
AUTO_TEST_BLOCK(
	ASSERT(Empty, UTF8GetLength("") == 0);
	ASSERT(Ascii, UTF8GetLength("Hello") == 5);
	ASSERT(Latin, UTF8GetLength("\xc3\xbf")); // U+00FF
	ASSERT(BadTwoByes, UTF8GetLength("\xa9!") == 2);
);

//////////////////////////////////////////////////////////////////////////

AUTO_TEST_GROUP(UTF8GetNextCodepoint, StringUtil);

AUTO_TEST_CHILD(UTF8GetNextCodepoint);
void UTF8GetNextCodepoint_Empty(void) { char *s = ""; testAssert(UTF8GetNextCodepoint(s) == s); }

AUTO_TEST_CHILD(UTF8GetNextCodepoint);
void UTF8GetNextCodepoint_Ascii(void) { char *s = "Hello"; testAssert(UTF8GetNextCodepoint(s) == s + 1); }

AUTO_TEST_CHILD(UTF8GetNextCodepoint);
void UTF8GetNextCodepoint_Latin(void) { char *s = "\xc3\xbfHello"; testAssert(UTF8GetNextCodepoint(s) == s + 2); }

//////////////////////////////////////////////////////////////////////////

AUTO_TEST_GROUP(UTF8GetCodepoint, StringUtil);

AUTO_TEST_CHILD(UTF8GetCodepoint);
void UTF8GetCodepoint_Empty_0(void) { char *s = ""; testAssert(UTF8GetCodepoint(s, 0) == s); }
AUTO_TEST_CHILD(UTF8GetCodepoint);
void UTF8GetCodepoint_Ascii_0(void) { char *s = "Hello"; testAssert(UTF8GetCodepoint(s, 0) == s); }

AUTO_TEST_CHILD(UTF8GetCodepoint);
void UTF8GetCodepoint_Empty_1(void) { char *s = ""; testAssert(UTF8GetCodepoint(s, 1) == NULL); }
AUTO_TEST_CHILD(UTF8GetCodepoint);
void UTF8GetCodepoint_Ascii_1(void) { char *s = "Hello"; testAssert(UTF8GetCodepoint(s, 1) == s + 1); }
AUTO_TEST_CHILD(UTF8GetCodepoint);
void UTF8GetCodepoint_Latin_1(void) { char *s = "\xc3\xbf"; testAssert(UTF8GetCodepoint(s, 1) == s + 2); }

AUTO_TEST_CHILD(UTF8GetCodepoint);
void UTF8GetCodepoint_Empty_2(void) { char *s = ""; testAssert(UTF8GetCodepoint(s, 2) == NULL); }
AUTO_TEST_CHILD(UTF8GetCodepoint);
void UTF8GetCodepoint_Ascii_2(void) { char *s = "Hello"; testAssert(UTF8GetCodepoint(s, 2) == s + 2); }
AUTO_TEST_CHILD(UTF8GetCodepoint);
void UTF8GetCodepoint_Latin_2(void) { char *s = "\xc3\xbf"; testAssert(UTF8GetCodepoint(s, 2) == NULL); }

//////////////////////////////////////////////////////////////////////////

AUTO_TEST_GROUP(UTF8PointerToCodepointIndex, StringUtil);

// PointerToCodepointIndex is the inverse of GetCodepoint, so define the test in terms of it.

AUTO_TEST_CHILD(UTF8PointerToCodepointIndex);
void UTF8PointerToCodepointIndex_Inverse(void)
{
	const char *s = "\xc3\xbf H \xc3\xbf ello, world! Some Latin: \xc3\xbf .";
	U32 i;
	for (i = 0; i < UTF8GetLength(s); i++)
	{
		char *p = UTF8GetCodepoint(s, i);
		if (p)
			testAssertMsgf(UTF8PointerToCodepointIndex(s, p) == i, "Broke at codepoint %d", i);
		else
			testAssertMsg(false, "Codepoint didn't exist, UTF8GetLength or UTF8GetCodepoint is broken");
	}
}