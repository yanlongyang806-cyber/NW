// Tests for crypt.c

#include "TestHarness.h"
#include "crypt.h"
#include "endian.h"

AUTO_TEST_GROUP(crypt, UtilitiesLib);

AUTO_TEST_CHILD(crypt);
void TestHMACSHA1(void)
{
	char *key = "kd94hf93k423kf44&pfkkdhi9sl3r4s00";
	char *message = "GET&http%3A%2F%2Fphotos.example.net%2Fphotos&file%3Dvacation.jpg%26oauth_consumer_key%3Ddpf43f3p2l4k3l03%26oauth_nonce%3Dkllo9940pd9333jh%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1191242096%26oauth_token%3Dnnch734d00sl2jdk%26oauth_version%3D1.0%26size%3Doriginal";
	char out[128];
	cryptHMACSHA1Create(key, message, SAFESTR(out));
	testAssertStrEqual(out, "tR3+Ty81lMeYAr/Fid0kMTYa/WM=");
}

AUTO_TEST_CHILD(crypt);
void TestFB(void)
{
	char *data = "added=1api_key=650503b8455d7ae1cd4524da50d88129expires=0friends=4,6,...in_canvas=1in_new_facebook=1locale=en_USposition_fix=1profile_update_time=1220998418request_method=GETsession_key=9a7e04226b1a3c85823bfafd-2901279time=1221071115.1896user=290127986cd871c996910064ab9884459c58bab";
	char out[1024];
	U32 md5[4];
	cryptMD5(data, (int)strlen(data), md5);
	sprintf(out, "%08x%08x%08x%08x", endianSwapU32(md5[0]), endianSwapU32(md5[1]), endianSwapU32(md5[2]), endianSwapU32(md5[3]));
	testAssertStrEqual(out, "3221a15c4e2804c04da31670a7b64516");
}

AUTO_TEST_CHILD(crypt);
void TestFB2(void)
{
	char *data = "f5d1d854791c9ed7api_keyddd8fb09b7c2c12f8469c46b246fe30cfrob72157620662504664-4cf01d22520f7566-310296permswrite";
	char out[1024];
	U32 md5[4];
	cryptMD5(data, (int)strlen(data), md5);
	sprintf(out, "%08x%08x%08x%08x", endianSwapU32(md5[0]), endianSwapU32(md5[1]), endianSwapU32(md5[2]), endianSwapU32(md5[3]));
	testAssertStrEqual(out, "7f62408e0d23d4368798a8340bd1e0db");
}

AUTO_TEST_CHILD(crypt);
void TestFB3(void)
{
	char *data = "f5d1d854791c9ed7api_keyddd8fb09b7c2c12f8469c46b246fe30cfrob72157620662504664-4cf01d22520f7566-310296permswrite";
	char out[64];
	cryptMD5Hex(data, (int)strlen(data), SAFESTR(out));
	testAssertStrEqual(out, "7f62408e0d23d4368798a8340bd1e0db");
}