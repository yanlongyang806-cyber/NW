// Tests for "jira.h"

#include "jira.h"
#include "TestHarness.h"

AUTO_TEST_GROUP(jira, HttpLib);

AUTO_TEST_CHILD(jira);
void TestjiraFindIssueString(void)
{
	char somestring[] = "blahblahblah[COR-1234]zazazazaz";
	const char *result;
	const char *end;
	const char *project_key;
	const char *project_key_end;
	U64 issue_number;

	// Basic test
	result = jiraFindIssueString(somestring, 0, &end, &project_key, &project_key_end, &issue_number);
	testAssert(result == somestring+12);
	testAssert(end == somestring+22);
	testAssert(project_key == somestring+13);
	testAssert(project_key_end == somestring+16);
	testAssert(issue_number == 1234);

	// Test with nulls.
	result = jiraFindIssueString(somestring, 0, NULL, NULL, NULL, NULL);
	testAssert(result == somestring+12);

	// Test limit successes
	result = jiraFindIssueString(somestring, 1000, NULL, NULL, NULL, NULL);
	testAssert(result == somestring+12);
	result = jiraFindIssueString(somestring, 22, NULL, NULL, NULL, NULL);
	testAssert(result == somestring+12);

	// Test limit failures
	result = jiraFindIssueString(somestring, 5, NULL, NULL, NULL, NULL);
	testAssert(!result);
	result = jiraFindIssueString(somestring, 15, NULL, NULL, NULL, NULL);
	testAssert(!result);

	// Test weird successes.
	result = jiraFindIssueString("[X-0]", 0, NULL, NULL, NULL, NULL);
	testAssert(result);
	result = jiraFindIssueString("[[X-2]", 0, NULL, NULL, NULL, NULL);
	testAssert(result);
	result = jiraFindIssueString("[[[X-024]]", 0, NULL, NULL, NULL, NULL);
	testAssert(result);

	// Test broken stuff
	result = jiraFindIssueString("[-]", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);
	result = jiraFindIssueString("[X-]", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);
	result = jiraFindIssueString("[X-X]", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);
	result = jiraFindIssueString("[X--1]", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);
	result = jiraFindIssueString("[]", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);
	result = jiraFindIssueString("[[-X]", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);
	result = jiraFindIssueString("[X-2X]", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);

	// Test truncations.
	result = jiraFindIssueString("[", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);
	result = jiraFindIssueString("[A", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);
	result = jiraFindIssueString("[AA", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);
	result = jiraFindIssueString("[AA-", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);
	result = jiraFindIssueString("[AA-1", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);
	result = jiraFindIssueString("[AA-12", 0, NULL, NULL, NULL, NULL);
	testAssert(!result);
}
