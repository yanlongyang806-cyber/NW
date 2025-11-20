// Tests for netsmtp.c
#include "Organization.h"
#include "TestHarness.h"
#include "netsmtp.h"
#include "AutoGen/netsmtp_h_ast.h"
#include "EString.h"

AUTO_TEST_GROUP(netsmtp, UtilitiesLib);

//AUTO_TEST_CHILD(netsmtp);
void TestMakeMessage(void)
{
	SMTPMessage *msg = StructCreate(parse_SMTPMessage);
	SMTPClient *client;
	smtpMsgAddTo(msg, "No One", "noone@" ORGANIZATION_DOMAIN);
	smtpMsgSetSubject(msg, "This is a test");
	smtpMsgAddTextPart(msg, "This is a\nmessage!");
	smtpMsgAddHTMLPart(msg, "<html>\n  <body>\n    Meep!\n  </body>\n</html>");
	client = smtpClientCreate(NULL, NULL, NULL);
	smtpClientSendWait(client, msg, 0);
	testAssert(client->success);
}

//AUTO_TEST_CHILD(netsmtp);
void TestMakeMessageRequest(void)
{
	bool ret;
	SMTPMessageRequest *req = StructCreate(parse_SMTPMessageRequest);
	eaPush(&req->to, "noone");
	estrPrintf(&req->subject, "This is a %s", "test");
	estrPrintf(&req->body, "Tra la \n la la\n I like mail");
	req->priority = 1;
	ret = smtpMsgRequestSend_Blocking(req, NULL);
	testAssert(ret);
}