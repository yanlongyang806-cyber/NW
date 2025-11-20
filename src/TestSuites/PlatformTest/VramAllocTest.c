#include "Ps3VramAlloc.h"

extern void DumpVramAllocList(void);

int TestMem(char *mem, char value, int size);

void TestVramAlloc(void)
{
#if _PS3
	void *p1, *p2, *p3, *p4, *p5, *p6;

	p1 = physicalmalloc(0x9c,16, "Physical malloc test");
	p2 = physicalmalloc(0x101,16, "Physical malloc test");
	p3 = physicalmalloc(0x120,16, "Physical malloc test");

	printf("p1=0x%x  p2 = 0x%x  p3 = 0x%x\n", physicalptr(p1), physicalptr(p2), physicalptr(p3));
	DumpVramAllocList();

	memset(physicalptr(p1), 0x11, 0x9c);
	memset(physicalptr(p2), 0x22, 0x101);
	memset(physicalptr(p3), 0x33, 0x120);

	physicalfree(p2, "Physical malloc test");
	p4 = physicalmalloc(0x200,0x10, "Physical malloc test");
	p2 = physicalmalloc(0x16,0x100, "Physical malloc test");
	memset(physicalptr(p4), 0x44, 0x200);
	memset(physicalptr(p2), 0x23, 0x16);
	DumpVramAllocList();


	p5 = physicalmalloc(0x17,4, "Physical malloc test");
	p6 = physicalmalloc(0x17,4, "Physical malloc test");
	memset(physicalptr(p5), 0x55, 0x17);
	memset(physicalptr(p6), 0x66, 0x17);
	DumpVramAllocList();

	physicalfree(p1, "Physical malloc test");
	physicalfree(p2, "Physical malloc test");
	physicalfree(p3, "Physical malloc test");
	physicalfree(p4, "Physical malloc test");
	physicalfree(p5, "Physical malloc test");
	physicalfree(p6, "Physical malloc test");
	DumpVramAllocList();

	// should grab a big chunk, zero it, then release
	p1 = physicalmalloc(0x1000,0x1000, "Physical malloc test");
	memset(physicalptr(p1), 0x00, 0x1000);
	physicalfree(p1, "Physical malloc test");
	
	p1 = physicalmalloc(0x102,0x40, "Physical malloc test");
	p2 = physicalmalloc(0x102,0x200, "Physical malloc test");
	p3 = physicalmalloc(0x102,0x40, "Physical malloc test");
	p4 = physicalmalloc(0x200,0x40, "Physical malloc test");
	p5 = physicalmalloc(0x17,0x40, "Physical malloc test");
	p6 = physicalmalloc(0x34,0x40, "Physical malloc test");

	DumpVramAllocList();

	memset(physicalptr(p1), 0x11, 0x102);
	memset(physicalptr(p2), 0x22, 0x102);
	memset(physicalptr(p3), 0x33, 0x102);
	memset(physicalptr(p4), 0x44, 0x200);
	memset(physicalptr(p5), 0x55, 0x17);
	memset(physicalptr(p6), 0x66, 0x34);

	// check alignment
	assert((((size_t)physicalptr(p1))&(0x40-1)) == 0 );
	assert((((size_t)physicalptr(p2))&(0x200-1)) == 0);
	assert((((size_t)physicalptr(p3))&(0x40-1)) == 0);
	assert((((size_t)physicalptr(p4))&(0x40-1)) == 0);
	assert((((size_t)physicalptr(p5))&(0x40-1)) == 0);
	assert((((size_t)physicalptr(p6))&(0x40-1)) == 0);

	assert( Ps3VramGetBlockSize(p1) == 0x102 );
	assert( Ps3VramGetBlockSize(p2) == 0x102 );
	assert( Ps3VramGetBlockSize(p3) == 0x102 );
	assert( Ps3VramGetBlockSize(p4) == 0x200 );
	assert( Ps3VramGetBlockSize(p5) == 0x17 );
	assert( Ps3VramGetBlockSize(p6) == 0x34 );

	assert(TestMem(physicalptr(p1), 0x11, 0x102));
	assert(TestMem(physicalptr(p2), 0x22, 0x102));
	assert(TestMem(physicalptr(p3), 0x33, 0x102));
	assert(TestMem(physicalptr(p4), 0x44, 0x200));
	assert(TestMem(physicalptr(p5), 0x55, 0x17));
	assert(TestMem(physicalptr(p6), 0x66, 0x34));

	printf("Physical alloc test ok\n");
#else
	printf("Only PS3 is hooked up to vram allocator. \n");
#endif
}

int TestMem(char *mem, char value, int size)
{
	int i;
	for(i=0;i<size;i++)
		if (*mem++ != value)
			return 0;
	return 1;
}