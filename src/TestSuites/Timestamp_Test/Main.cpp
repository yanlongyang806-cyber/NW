#include <io.h>
#include <stdio.h>
#include <sys/stat.h>

void main() {
	struct _finddata32i64_t pfd;
	struct _stat32i64 tempStatInfo2;
	char filename[] = "Timestamp_Text_File.txt";
	intptr_t retval = _findfirst32i64(filename, &pfd);
	char sometext[255];

	_stat32i64(filename, &tempStatInfo2);
	printf("_findfirst results\n");
	printf("%s create time : %d\n",filename,pfd.time_create);
	printf("%s modify time : %d\n",filename,pfd.time_write);
	printf("%s access time : %d\n",filename,pfd.time_access);
	printf("_stat results\n");
	printf("%s create time : %d\n",filename,tempStatInfo2.st_ctime);
	printf("%s modify time : %d\n",filename,tempStatInfo2.st_mtime);
	printf("%s access time : %d\n",filename,tempStatInfo2.st_atime);
	scanf_s("%s",sometext);
}