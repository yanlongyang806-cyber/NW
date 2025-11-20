#include "ExprTest.h"
#include "EString.h"
#include "Expression.h"
#include "ExpressionDebug.h"
#include "GlobalTypes.h"
#include "sysutil.h"
#include "ExprTest_h_ast.c"
#include "FolderCache.h"
#include "error.h"
#include "StringCache.h"

int main(char **argv, int argc)
{
	ExprContext* context;
	ExprTestStruct fork;
	ExprTestStruct2 fork2;
	int success;

	//WAIT_FOR_DEBUGGER
	EXCEPTION_HANDLER_BEGIN

	DO_AUTO_RUNS

	RegisterGenericGlobalTypes(); // We need to call these now, so the parsing works

	setDefaultAssertMode();

	memCheckInit();

	FolderCacheChooseModeNoPigsInDevelopment();

	pushDontReportErrorsToErrorTracker(true);
	pushDisableLastAuthor(true);
	dontLogErrors(true);

	printf("Running Expression regression test... ");
	success = exprDebugRegressionTest(true);
	if(success)
		printf("succeeded\n");
	else
		printf("failed\n");

	fork.test = 5;
	fork2.test = 3.5;
	context = exprContextCreateWithEmptyFunctionTable();
	exprContextSetPointerVar(context, "myFork", &fork, parse_ExprTestStruct, true, true);
	exprContextSetPointerVar(context, "myFork2", &fork2, parse_ExprTestStruct2, true, true);
	while(1)
	{
		char cmdBuf[1024];
		printf("$");
		gets(cmdBuf);

		if(!strnicmp(cmdBuf, "!q", 2))
			break;

		printf("%s", exprDebug(cmdBuf, NULL, context));
	}

	EXCEPTION_HANDLER_END
}

AUTO_EXPR_FUNC(test);
int test(OPT_PTR_GOOD ExprTestStruct* structptr)
{
	if(structptr)
		return structptr->test;
	else
		return 0;
}

AUTO_EXPR_FUNC(test);
int intTest(int foo)
{
	return foo;
}

AUTO_EXPR_FUNC(test);
int bracesTest(int foo, ACMD_EXPR_SUBEXPR_IN subExpr)
{
	return foo;
}

AUTO_EXPR_FUNC(test);
int lotsOfArgsTest(int x, float f, int y, float g)
{
	return 2;
}

AUTO_EXPR_FUNC(test);
OPT_PTR_GOOD ExprTestStruct *testFunc1(int x)
{
	return NULL;
}

static ExprTestStruct myTestStruct = { 7 };

AUTO_EXPR_FUNC(test);
NN_PTR_GOOD ExprTestStruct *testFunc2(int x)
{
	return &myTestStruct;
}


