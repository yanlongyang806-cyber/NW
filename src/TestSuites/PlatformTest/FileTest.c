
#include "file.h"
#include "textparser.h"
#include "FolderCache.h"
#include "rand.h"
#include "error.h"
#include "StringCache.h"


AUTO_STRUCT AST_ENDTOK(EndTestStruct);
typedef struct TestStruct
{
	char *stringfield;
	int intfield;
} TestStruct;

AUTO_STRUCT;
typedef struct TestStructList
{
	TestStruct **structs; AST(NAME(TestStruct))
} TestStructList;

#include "AutoGen/FileTest_c_ast.c"

void testMemoryPool(void);
void testBitStream(void);
void hashFunctionTest(int dummy);
void TestTextParser_NoShared(void);
void dynamicCacheTest(void);

void OVERRIDE_LATELINK_ControllerScript_Succeeded(void)
{
	printf("Success\n");
}
void OVERRIDE_LATELINK_ControllerScript_Failed(char *pFailureString)
{
	printf("Failed : %s\n", pFailureString);
	assertmsg(0, pFailureString);
}

void generateStringPoolEntries()
{
	int i;
	char fn[1024];
	U32 seed=0x12345678;
	for (i=0; i<10000; i++)
	{
		sprintf(fn, "%d/%d.%d", randomU32Seeded(&seed, RandType_LCG), randomU32Seeded(&seed, RandType_LCG), randomU32Seeded(&seed, RandType_LCG));
		allocAddFilename(fn);
	}
}


void TestFileSystem(void)
{
	const char * const *datadirs;
	TestStructList struct_list = {0};

    //errorSetVerboseLevel(1);

	initRand();

	FolderCacheChooseMode();

	// Note, we're running xbox_deploy.bat as a post-build event to copy the 3 required data files

	printf("Data Dirs should be ./data\n");
	fileLoadGameDataDirAndPiggs();
	datadirs = fileGetGameDataDirs();
	assert(eaSize(&datadirs)==1);
	assert(strstri(datadirs[0], "data"));

	{
		char path_write[MAX_PATH];
		char path_read[MAX_PATH];

		fileLocateRead("testDir/TestFile.txt", path_read);
#if _PS3
        fileLocateWrite("testDir/TestFilePS3.txt", path_write);
#else
		fileLocateWrite("testDir/TestFileWin32.txt", path_write);
#endif
		printf("path_write: %s\npath_read: %s\n", path_write, path_read);
		assert(is_pigged_path(path_read));
		assert(!is_pigged_path(path_write));
		assert(stricmp(path_write, path_read)!=0);
	}

	// Test directory scanning and file loading
	ParserLoadFiles("testDir", ".txt", 
#if _PS3
        "TestDataPS3.bin"
#else
        "TestDataWin32.bin"
#endif
        , 0, parse_TestStructList, &struct_list);
	assert(eaSize(&struct_list.structs) == 2);
	assert(struct_list.structs[0]->intfield == 1);
	assert(struct_list.structs[1]->intfield == 2);

    loadstart_printf("Testing hash functions...");
	generateStringPoolEntries();
	hashFunctionTest(0);
	loadend_printf("done.");

    loadstart_printf("Testing dynamicCache...");
	dynamicCacheTest();
	loadend_printf("done.");
	loadstart_printf("Testing memory pools...");
	testMemoryPool();
	loadend_printf("done.");
	loadstart_printf("Testing bit stream...");
	testBitStream();
	loadend_printf("done.");

	loadstart_printf("Testing TextParser...");
	TestTextParser_NoShared();
	loadend_printf("done.");

	printf("File system OK!\n");
}
