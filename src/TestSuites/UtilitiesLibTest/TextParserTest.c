// TextParser tests

#include "error.h"
#include "objPath.h"
#include "TestHarness.h"
#include "textparser.h"
#include "ThreadSafeMemoryPool.h"

TSMP_DEFINE(ObjectPathOperation);

// Some performance test code Alex and I used; needs to be cleaned up.
AUTO_TEST_CHILD(Performance);
void TextParserSpeedComparison(void)
{
#if 0
	ObjectPathOperation *pOp;
	int i;
	ObjectPathOperation **ppOps = NULL;

	TSMP_CREATE(ObjectPathOperation, 1639);
	for (i = 0; i < 500000; i++)
	{

		pOp = TSMP_ALLOC(ObjectPathOperation);
		eaPush(&ppOps, pOp);
	}
	
	eaRandomize(&ppOps);

	for (i = 0; i < 499900; i++)
	{
		pOp = eaPop(&ppOps);
		TSMP_FREE(ObjectPathOperation, pOp);
	}

	loadstart_printf("compact...");
	threadSafeMemoryPoolCompact(&TSMP_NAME(ObjectPathOperation));
	loadend_printf("done");

	/*
	PatchDB *db = StructCreate(parse_PatchDB);
	PatchDB *db2 = StructCreate(parse_PatchDB);
	char *estr = NULL;
	FILE *fp;
	Packet *pak;

	loadstart_printf("read...");
	ParserReadTextFile("Holodeck_Startrekugc.manifest", parse_PatchDB, db, 0);
	loadend_printf("done");

	loadstart_printf("write...");
	ParserWriteTextFile("Holodeck_Startrekugc2.manifest", parse_PatchDB, db, 0, 0);
	loadend_printf("done");

	loadstart_printf("estr write...");
	ParserWriteText(&estr, parse_PatchDB, db, 0, 0, 0);
	fp = fopen("Holodeck_Startrekugc4.manifest", "w");
	fwrite(estr, estrLength(&estr), 1, fp);
	fclose(fp);
	loadend_printf("done");

	pak = pktCreateTemp(NULL);
	loadstart_printf("ParserSendStruct...");
	ParserSendStruct(parse_PatchDB, pak, db);
	loadend_printf("done");

	loadstart_printf("ParserRecv...");
	ParserRecv(parse_PatchDB, pak, db2, 0);
	loadend_printf("done");
	 */
#endif
}
