// One-off test harness

#include "TestHarness.h"
#include "utils.h"
#include "wininclude.h"
#include "UTF8.h"

AUTO_TEST_GROUP(Pipes, UtilitiesLib);

AUTO_TEST_CHILD(Pipes);
void BasicPipeTest(void)
{
	char text[] = "stuff";
	char output[sizeof(text)];
	int pipe = pipe_buffer_create(text, sizeof(text) - 1);
	size_t len = pipe_buffer_read(output, sizeof(output), pipe);
	output[len] = 0;
	testAssertEqual(len, strlen(text));
	testAssertStrEqual(text, output);
}

AUTO_TEST_CHILD(Pipes);
void BasicPipeTestCleanup(void)
{
	char text[] = "stuff";
	int pipe = pipe_buffer_create(text, sizeof(text) - 1);
	pipe_buffer_cleanup(pipe);
}

// Create a child process with a pipe buffer.
void RunPipeBufferTest(char *pExecutablePath, char *pString)
{
	int pipe;
	char command_line[MAX_PATH*2];
	STARTUPINFO si;
	PROCESS_INFORMATION pi;
	bool success;

	// Create pipe buffer.
	pipe = pipe_buffer_create(pString, strlen(pString));

	// Format command line.
	sprintf(command_line, "%s -Bypass pweaccountname %p", pExecutablePath, (void*)pipe);

	// Run child process.
	si.cb = sizeof(si);
	si.lpReserved = NULL;
	si.lpDesktop = NULL;
	si.lpTitle = NULL;
	si.dwFlags = 0;
	si.cbReserved2 = 0;
	si.lpReserved2 = NULL;
	success = CreateProcess_UTF8(NULL, command_line, NULL, NULL, TRUE, 0, NULL, NULL, &si, &pi);  // Allow handle inheritance.
	assert(success);
	success = CloseHandle(pi.hProcess);
	assert(success);
	success = CloseHandle(pi.hThread);
	assert(success);

	// Clean up.
	pipe_buffer_cleanup(pipe);
}
