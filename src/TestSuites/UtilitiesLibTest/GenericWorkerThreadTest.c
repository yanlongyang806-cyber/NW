// GenericWorkerThread tests

#include "GenericWorkerThread.h"
#include "TestHarness.h"
#include "wininclude.h"
#include "earray.h"
#include "mutex.h"
#include "rand.h"

enum
{
	CMD_ONE = GWT_CMD_USER_START,
	CMD_TWO,
	MSG_ONE,
	MSG_TWO,
};



typedef struct ActionOneData
{
	U32 input;
	U32 bgProcessOrder;
	U32 fgProcessOrder;
	U32 threadIndex;
} ActionOneData;

typedef struct ActionTwoData
{
	U32 input;
	U32 bgProcessOrder;
	U32 fgProcessOrder;
	U32 threadIndex;
} ActionTwoData;

typedef struct TestUserData
{
	U32 bgProcessOrder;
	U32 fgProcessOrder;
	ActionOneData **actionOneArray;
	ActionTwoData **actionTwoArray;
} TestUserData;

void cmdOneStruct(TestUserData *userData, ActionOneData *data, GWTCmdPacket *packet)
{
	ActionOneData newData = {0};
	newData.input = data->input;
	newData.bgProcessOrder = InterlockedIncrement(&userData->bgProcessOrder);
	newData.threadIndex = gwtGetThreadIndex(packet);
	gwtQueueMsgStruct(packet, MSG_ONE, newData, ActionOneData);
}

void cmdOnePointer(TestUserData *userData, ActionOneData **data, GWTCmdPacket *packet)
{
	ActionOneData *realData = *data;
	realData->bgProcessOrder = InterlockedIncrement(&userData->bgProcessOrder);
	realData->threadIndex = gwtGetThreadIndex(packet);
	gwtQueueMsgPointer(packet, MSG_ONE, realData);
}

void msgOneStruct(TestUserData *userData, ActionOneData *data, GWTCmdPacket *packet)
{
	ActionOneData *newData;
	newData = callocStruct(ActionOneData);
	newData->input = data->input;
	newData->bgProcessOrder = data->bgProcessOrder;
	newData->fgProcessOrder = InterlockedIncrement(&userData->fgProcessOrder);
	newData->threadIndex = data->threadIndex;
	eaPush(&userData->actionOneArray, newData); 
}

void msgOnePointer(TestUserData *userData, ActionOneData **data, GWTCmdPacket *packet)
{
	ActionOneData *realData = *data;
	realData->fgProcessOrder = InterlockedIncrement(&userData->fgProcessOrder);
	eaPush(&userData->actionOneArray, realData); 
}

void cmdTwoStruct(TestUserData *userData, ActionTwoData *data, GWTCmdPacket *packet)
{
	ActionTwoData newData = {0};
	newData.input = data->input;
	newData.bgProcessOrder = InterlockedIncrement(&userData->bgProcessOrder);
	newData.threadIndex = gwtGetThreadIndex(packet);
	gwtQueueMsgStruct(packet, MSG_TWO, newData, ActionTwoData);
}

void cmdTwoPointer(TestUserData *userData, ActionTwoData **data, GWTCmdPacket *packet)
{
	ActionTwoData *realData = *data;
	realData->bgProcessOrder = InterlockedIncrement(&userData->bgProcessOrder);
	realData->threadIndex = gwtGetThreadIndex(packet);
	gwtQueueMsgPointer(packet, MSG_TWO, realData);
}

void msgTwoStruct(TestUserData *userData, ActionTwoData *data, GWTCmdPacket *packet)
{
	ActionTwoData *newData;
	newData = callocStruct(ActionTwoData);
	newData->input = data->input;
	newData->bgProcessOrder = data->bgProcessOrder;
	newData->fgProcessOrder = InterlockedIncrement(&userData->fgProcessOrder);
	newData->threadIndex = data->threadIndex;
	eaPush(&userData->actionTwoArray, newData); 
}

void msgTwoPointer(TestUserData *userData, ActionTwoData **data, GWTCmdPacket *packet)
{
	ActionTwoData *realData = *data;
	realData->fgProcessOrder = InterlockedIncrement(&userData->fgProcessOrder);
	eaPush(&userData->actionTwoArray, realData); 
}

AUTO_TEST_GROUP(GenericWorkerThread, UtilitiesLib);

AUTO_TEST_CHILD(GenericWorkerThread);
void gwtCreateAndDestroyStruct(void)
{
	int numOperations = 100000;
	int i;
	TestUserData threadData = {0};
	GenericWorkerThreadManager *wt = gwtCreate(16, 16, 4, &threadData, "TestThread");

	gwtRegisterCmdDispatch(wt, CMD_ONE, cmdOneStruct);
	gwtRegisterCmdDispatch(wt, CMD_TWO, cmdTwoStruct);

	gwtRegisterMsgDispatch(wt, MSG_ONE, msgOneStruct);
	gwtRegisterMsgDispatch(wt, MSG_TWO, msgTwoStruct);
	gwtSetThreaded(wt, true, 0, false);

	gwtStart(wt);

	for(i = 0; i < numOperations; ++i)
	{
		ActionOneData oneData = {0};
		ActionTwoData twoData = {0};
		oneData.input = i;
		gwtQueueCmdStruct(wt, CMD_ONE, oneData, ActionOneData);
		twoData.input = i;
		gwtQueueCmdStruct(wt, CMD_TWO, twoData, ActionTwoData);
		gwtMonitor(wt);
	}

	gwtFlush(wt);
	gwtFlushMessages(wt);

	assert(eaSize(&threadData.actionOneArray) == numOperations);
	assert(eaSize(&threadData.actionTwoArray) == numOperations);

	eaDestroyEx(&threadData.actionOneArray, NULL);
	eaDestroyEx(&threadData.actionTwoArray, NULL);

	gwtDestroy(wt);
}

AUTO_TEST_CHILD(GenericWorkerThread);
void gwtCreateAndDestroyPointers(void)
{
	int numOperations = 100000;
	int i;
	TestUserData threadData = {0};
	GenericWorkerThreadManager *wt = gwtCreate(16, 16, 4, &threadData, "TestThread");

	gwtRegisterCmdDispatch(wt, CMD_ONE, cmdOnePointer);
	gwtRegisterCmdDispatch(wt, CMD_TWO, cmdTwoPointer);

	gwtRegisterMsgDispatch(wt, MSG_ONE, msgOnePointer);
	gwtRegisterMsgDispatch(wt, MSG_TWO, msgTwoPointer);
	gwtSetThreaded(wt, true, 0, false);

	gwtStart(wt);

	for(i = 0; i < numOperations; ++i)
	{
		ActionOneData *oneData;
		ActionTwoData *twoData;
		oneData = callocStruct(ActionOneData);
		oneData->input = i;
		gwtQueueCmdPointer(wt, CMD_ONE, oneData);
		twoData = callocStruct(ActionTwoData);
		twoData->input = i;
		gwtQueueCmdPointer(wt, CMD_TWO, twoData);
		gwtMonitor(wt);
	}

	gwtFlush(wt);
	gwtFlushMessages(wt);

	assert(eaSize(&threadData.actionOneArray) == numOperations);
	assert(eaSize(&threadData.actionTwoArray) == numOperations);

	eaDestroyEx(&threadData.actionOneArray, NULL);
	eaDestroyEx(&threadData.actionTwoArray, NULL);

	gwtDestroy(wt);
}

static U32 verifyObjectLocking = 0;

void cmdOneStruct_ObjectLock(TestUserData *userData, ActionOneData *data, GWTCmdPacket *packet)
{
	ActionOneData newData = {0};
	U32 v = InterlockedIncrement(&verifyObjectLocking);
	assert(v == 1);
	newData.input = data->input;
	newData.bgProcessOrder = InterlockedIncrement(&userData->bgProcessOrder);
	newData.threadIndex = gwtGetThreadIndex(packet);
	gwtQueueMsgStruct(packet, MSG_ONE, newData, ActionOneData);
	InterlockedDecrement(&verifyObjectLocking);
}

void cmdOnePointer_ObjectLock(TestUserData *userData, ActionOneData **data, GWTCmdPacket *packet)
{
	ActionOneData *realData = *data;
	U32 v = InterlockedIncrement(&verifyObjectLocking);
	assert(v == 1);
	realData->bgProcessOrder = InterlockedIncrement(&userData->bgProcessOrder);
	realData->threadIndex = gwtGetThreadIndex(packet);
	gwtQueueMsgPointer(packet, MSG_ONE, realData);
	InterlockedDecrement(&verifyObjectLocking);
}

AUTO_TEST_CHILD(GenericWorkerThread);
void gwtCreateAndDestroyStruct_ObjectLock(void)
{
	int numOperations = 100000;
	int i;
	ObjectLock *lockOne = initializeObjectLock(NULL);
	TestUserData threadData = {0};
	GenericWorkerThreadManager *wt = gwtCreateEx(16, 16, 4, &threadData, "TestThread", GWT_LOCKSTYLE_OBJECTLOCK);

	gwtRegisterCmdDispatch(wt, CMD_ONE, cmdOneStruct_ObjectLock);
	gwtRegisterCmdDispatch(wt, CMD_TWO, cmdTwoStruct);

	gwtRegisterMsgDispatch(wt, MSG_ONE, msgOneStruct);
	gwtRegisterMsgDispatch(wt, MSG_TWO, msgTwoStruct);
	gwtSetThreaded(wt, true, 0, false);

	gwtStart(wt);

	for(i = 0; i < numOperations; ++i)
	{
		ActionOneData oneData = {0};
		ActionTwoData twoData = {0};
		oneData.input = i;
		gwtQueueCmdStruct_ObjectLock(wt, CMD_ONE, oneData, ActionOneData, 1, lockOne);
		twoData.input = i;
		gwtQueueCmdStruct_ObjectLock(wt, CMD_TWO, twoData, ActionTwoData, 0);
		gwtMonitor(wt);
	}

	gwtFlush(wt);
	gwtFlushMessages(wt);

	assert(eaSize(&threadData.actionOneArray) == numOperations);
	assert(eaSize(&threadData.actionTwoArray) == numOperations);

	eaDestroyEx(&threadData.actionOneArray, NULL);
	eaDestroyEx(&threadData.actionTwoArray, NULL);

	gwtDestroy(wt);
}

AUTO_TEST_CHILD(GenericWorkerThread);
void gwtCreateAndDestroyPointers_ObjectLock(void)
{
	int numOperations = 100000;
	int i;
	ObjectLock *lockOne = initializeObjectLock(NULL);
	TestUserData threadData = {0};
	GenericWorkerThreadManager *wt = gwtCreateEx(16, 16, 4, &threadData, "TestThread", GWT_LOCKSTYLE_OBJECTLOCK);

	gwtRegisterCmdDispatch(wt, CMD_ONE, cmdOnePointer_ObjectLock);
	gwtRegisterCmdDispatch(wt, CMD_TWO, cmdTwoPointer);

	gwtRegisterMsgDispatch(wt, MSG_ONE, msgOnePointer);
	gwtRegisterMsgDispatch(wt, MSG_TWO, msgTwoPointer);
	gwtSetThreaded(wt, true, 0, false);

	gwtStart(wt);

	for(i = 0; i < numOperations; ++i)
	{
		ActionOneData *oneData;
		ActionTwoData *twoData;
		oneData = callocStruct(ActionOneData);
		oneData->input = i;
		gwtQueueCmdPointer_ObjectLock(wt, CMD_ONE, oneData, 1, lockOne);
		twoData = callocStruct(ActionTwoData);
		twoData->input = i;
		gwtQueueCmdPointer_ObjectLock(wt, CMD_TWO, twoData, 0);
		gwtMonitor(wt);
	}

	gwtFlush(wt);
	gwtFlushMessages(wt);

	assert(eaSize(&threadData.actionOneArray) == numOperations);
	assert(eaSize(&threadData.actionTwoArray) == numOperations);

	eaDestroyEx(&threadData.actionOneArray, NULL);
	eaDestroyEx(&threadData.actionTwoArray, NULL);

	gwtDestroy(wt);
}

typedef struct ReadWriteData
{
	U32 bgProcessOrder;
	U32 fgProcessOrder;
	ReadWriteLock *lock;
	U32 readers;
	U32 writers;
} ReadWriteData;

typedef struct ReadData
{
	U32 input;
	U32 bgProcessOrder;
	U32 fgProcessOrder;
	U32 threadIndex;
} ReadData;

typedef struct WriteData
{
	U32 input;
	U32 bgProcessOrder;
	U32 fgProcessOrder;
	U32 threadIndex;
} WriteData;

void ReadStruct(ReadWriteData *userData, ReadData *data, GWTCmdPacket *packet)
{
	rwlReadLock(userData->lock);
	InterlockedIncrement(&userData->readers);
	assert(userData->writers == 0);
//	printf("Reader %u:\t%u readers, %u writers\n", data->input, userData->readers, userData->writers);
	Sleep(10);
	InterlockedDecrement(&userData->readers);
	rwlReadUnlock(userData->lock);
}

void WriteStruct(ReadWriteData *userData, WriteData *data, GWTCmdPacket *packet)
{
	rwlWriteLock(userData->lock, false);
	InterlockedIncrement(&userData->writers);
	assert(userData->writers == 1);
	assert(userData->readers == 0);
//	printf("Writer %u:\t%u readers, %u writers\n", data->input, userData->readers, userData->writers);
	Sleep(10);
	InterlockedDecrement(&userData->writers);
	rwlWriteUnlock(userData->lock);
}


AUTO_TEST_CHILD(GenericWorkerThread);
void gwtCreateAndDestroyStruct_ReadWriteLocks(void)
{
	int numOperations = 100;
	int i;
	int seed = 487564;
	ReadWriteData threadData = {0};
	GenericWorkerThreadManager *wt = gwtCreate(16, 16, 4, &threadData, "TestThread");

	threadData.lock = CreateReadWriteLock();
	gwtRegisterCmdDispatch(wt, CMD_ONE, ReadStruct);
	gwtRegisterCmdDispatch(wt, CMD_TWO, WriteStruct);

	gwtSetThreaded(wt, true, 0, false);

	gwtStart(wt);

	for(i = 0; i < numOperations; ++i)
	{
		int r = randomIntRangeSeeded(&seed, RandType_LCG, 0, 100);
		if(r < 90)
		{
			ReadData readData = {0};
			readData.input = i;
			gwtQueueCmdStruct(wt, CMD_ONE, readData, ReadData);
		}
		else
		{
			WriteData writeData = {0};
			writeData.input = i;
			gwtQueueCmdStruct(wt, CMD_TWO, writeData, WriteData);
		}
		gwtMonitor(wt);
	}

	gwtFlush(wt);
	gwtFlushMessages(wt);
	DestroyReadWriteLock(threadData.lock);
	gwtDestroy(wt);
}

