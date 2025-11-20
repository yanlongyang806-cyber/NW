// Tests for clearsilver

#include "TestHarness.h"
#include "EString.h"
#include "clearsilver.h"
#include "textparser.h"
#include "file.h"
#include "AutoGen/clearsilver_c_ast.h"
#include "MemTrack.h"

AUTO_STRUCT;
typedef struct HDFTest2
{
	char *inner; AST(ESTRING DEFAULT("e"))
	F32 n;
	char **innerarr;
} HDFTest2;

AUTO_STRUCT;
typedef struct HDFTest1
{
	char *str;
	int blah;
	HDFTest2 *hmm;
	HDFTest2 another;
	HDFTest2 **arrofstructs;
	char **strings;
	int *somenumbers;
} HDFTest1;

AUTO_TEST_GROUP(clearsilver, UtilitiesLib);

AUTO_TEST_CHILD(clearsilver);
void TestMakeHDF(void)
{
	HDFTest1 *test1 = StructCreate(parse_HDFTest1);
	HDF *hdf;
	char *out, *out_filtered, /* *out_tmp, *out_filtered_tmp,*/ *ref;
	int i;
	
	ref = fileAlloc("c:/src/TestSuites/UtilitiesLibTest/data/test1.hdf", NULL);

	hdf_init(&hdf);

	test1->str = strdup("Foo");
	test1->blah = 10;
	test1->hmm = StructCreate(parse_HDFTest2);
	test1->hmm->n = 1.5;
	for(i=0; i<5; i++)
	{
		HDFTest2 *tmp = StructCreate(parse_HDFTest2);
		estrPrintf(&tmp->inner, "%d", i);
		tmp->n = i*i;
		eaPush(&test1->arrofstructs, tmp);
		ea32Push(&test1->somenumbers, i*-1);
	}
	eaPush(&test1->strings, strdup("A string"));
	eaPush(&test1->strings, strdup("another string"));
	eaPush(&test1->arrofstructs[2]->innerarr, strdup("Testing nested array"));
	ParserWriteHDF(hdf, parse_HDFTest1, test1);

	hdf_write_string(hdf, &out);
	out_filtered = estrCreateFromStr(out);
	estrFixupNewLinesForWindows(&out_filtered);
	testAssertEqual(strlen(out_filtered), strlen(ref));
	testAssertStrEqual(out_filtered, ref);

	crt_free(out);
	estrDestroy(&out_filtered);
	free(ref);
	hdf_destroy(&hdf);
	StructDestroy(parse_HDFTest1, test1);
}

AUTO_TEST_CHILD(clearsilver);
void TestRenderTemplate(void)
{
	HDFTest1 *test1 = StructCreate(parse_HDFTest1);
	HDF *hdf;
	char *out, *ref;
	int i;

	ref = fileAlloc("c:/src/TestSuites/UtilitiesLibTest/data/test1.txt", NULL);

	hdf_init(&hdf);

	test1->str = strdup("Foo");
	test1->blah = 10;
	test1->hmm = StructCreate(parse_HDFTest2);
	test1->hmm->n = 1.5;
	for(i=0; i<5; i++)
	{
		HDFTest2 *tmp = StructCreate(parse_HDFTest2);
		estrPrintf(&tmp->inner, "%d", i);
		tmp->n = i*i;
		eaPush(&test1->arrofstructs, tmp);
		ea32Push(&test1->somenumbers, i*-1);
	}
	eaPush(&test1->strings, strdup("A string"));
	eaPush(&test1->strings, strdup("another string"));
	eaPush(&test1->arrofstructs[2]->innerarr, strdup("Testing nested array"));
	
	out = renderTemplate("test1.cs", parse_HDFTest1, test1, false);
	estrFixupNewLinesForWindows(&out);
	testAssertEqual(strlen(out), strlen(ref));
	testAssertStrEqual(out, ref);
	estrDestroy(&out);

	StructDestroy(parse_HDFTest1, test1);
}

#include "AutoGen/clearsilver_c_ast.c"