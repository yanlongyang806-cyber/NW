
#define DO_FILE_TEST 1
#define DO_INPUTLIB_TEST 0
#define DO_SOUNDLIB_TEST 0
#define DO_VRAMALLOC_TEST 0
#define DO_TEXTURES_TEST 0

void TestFileSystem(void);
void TestInputLib(void);
extern void SoundTest(void);
extern void TestVramAlloc(void);
extern void TestTextures(void);

int main(int argc, char **argv)
{
	DO_AUTO_RUNS;

#if DO_FILE_TEST
	TestFileSystem();
#endif

#if DO_INPUTLIB_TEST
	TestInputLib();
#endif

#if DO_SOUNDLIB_TEST
	SoundTest();
#endif

#if DO_VRAMALLOC_TEST
	TestVramAlloc();
#endif

#if DO_TEXTURES_TEST
	TestTextures();
#endif
    return 0;
}
