#include "mathutil.h"
#include "TextParser.h"
#include "TaskServerClientInterface.h"
#include "sysutil.h"
#include "wininclude.h"
#include "file.h"
#include "d3d11.h"
#include "UTF8.h"


void OnCompleteTestRequest(TaskServerRequestStatus status, TaskClientTaskPacket * task, ShaderCompileTaskResponseData *response, void *userData)
{
	printf( "%s\n", status == TASKSERVER_NOT_RUNNING ? "Server not running" : "Got response");
	if (response)
	{
		printf( "%s\n", response->errorMessage && response->errorMessage[0] ? response->errorMessage : "Success");
		printf( "%d\n", response->compiledResultSize);
		if (response->compiledResult.pInts)
			printf( "%x\n", response->compiledResult.pInts[0]);
		else
			printf( "No compile result\n");
	}
	SetEvent((HANDLE)userData);
}

void OnCompleteTestExec(TaskServerRequestStatus status, TaskClientTaskPacket * task, SpawnRequestData *response, void *userData)
{
	printf( "%s\n", status == TASKSERVER_NOT_RUNNING ? "Server not running" : "Got response");
	printf( "%s\n", response ? response->label : "No response packet");
	
	SetEvent((HANDLE)userData);
}

void TaskServerGeneralRequestTest()
{
	HANDLE a_hResponse = INVALID_HANDLE_VALUE;
	ShaderCompileTaskRequestData testRequest = { 0 };

	printf("Creating event.\n");
	a_hResponse = CreateEvent_UTF8(NULL, true, FALSE, "TaskServerResultsComplete");

	if (a_hResponse)
	{
		ANALYSIS_ASSUME(a_hResponse);
		testRequest.target = SHADERTASKTARGET_PC;
		testRequest.programText = ""
			"float4 main(float4 pos : SV_Position) : SV_Target0\n"
			"{\n"
			"	return float4( 1.0, 0.0, 0.0, 1.0);\n"
			"}\n";
		testRequest.entryPointName = "main";
		testRequest.shaderModel = "ps_4_0";
		testRequest.compilerFlags = D3D10_SHADER_DEBUG | D3D10_SHADER_SKIP_OPTIMIZATION | D3D10_SHADER_PREFER_FLOW_CONTROL;
		testRequest.otherFlags = SHADERTASKTARGETVERSION_D3DCompiler_42;

		printf("Issuing request.\n");
		taskServerRequestCompile(&testRequest, SHADERTASKTARGETVERSION_D3DCompiler_42, OnCompleteTestRequest, a_hResponse);

		printf("Request queued. Waiting for server connection.\n");
		taskServerWaitForConnection();

		ResetEvent(a_hResponse);
		printf("Issuing actual shader compile request.\n");
		taskServerRequestCompile(&testRequest, SHADERTASKTARGETVERSION_D3DCompiler_42, OnCompleteTestRequest, a_hResponse);

		{
			U8 testDataArray[] = { 0, 1, 2, 3, 8 };
			SpawnRequestData request = { 0 };
			int i;

			TextParserBinaryBlock_AssignMemory(&request.data_block, testDataArray, 5, 0);

			for (i = 0; i < 10; ++i)
			{
				char label[ 32 ];
				char tempInputFileCopy[MAX_PATH];
				ResetEvent(a_hResponse);

				sprintf(label, "Remesh job %d", i);
				request.label = strdup(label);
			
#define INPUT_CLUSTER "cluster_Default_5X_0Y_2Z__5X_0Y_2Z_L0.hogg"
//#define INPUT_CLUSTER "cluster_Default_-2X_-3Y_6Z__1X_0Y_9Z_L2.hogg"
				sprintf(tempInputFileCopy, "%sJobTest%d_%s", "C:\\temp\\simplygon\\", i, INPUT_CLUSTER);
				fileCopy("C:\\temp\\simplygon\\"INPUT_CLUSTER, tempInputFileCopy);
				sprintf(label, "Remesh job %d", i);
				request.label = strdup(label);

				sprintf(tempInputFileCopy, "%sJobTest%d_%s", "C:\\temp\\simplygon\\", i, "cluster_Default_0X_-2Y_0Z__7X_5Y_7Z_L3.hogg");
				fileCopy("C:\\temp\\simplygon\\cluster_Default_0X_-2Y_0Z__7X_5Y_7Z_L3.hogg", tempInputFileCopy);

				printf("Issuing new remesh spawn request type %d.\n", i);
				taskServerRequestExec(&request, 
					tempInputFileCopy,
					OnCompleteTestExec, a_hResponse);

				printf("Waiting for result.\n");
				WaitForSingleObject(a_hResponse, INFINITE);
			}
		}

		printf("Wait for result completed. Closing handle.\n");
		CloseHandle(a_hResponse);
	}
	else
	{
		printf("Failed to CreateEvent().\n");
	}

	printf("Shader server test complete.\n");
}

