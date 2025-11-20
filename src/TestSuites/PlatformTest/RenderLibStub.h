#pragma once

#include "..\..\libs\Renderers\pub\RdrDevice.h"

RdrDevice *DummyInitRdr(void);

void rdrSetMsgHandler(RdrDevice *device, RdrUserMsgHandler msg_handler, RdrWinMsgHandler winmsg_handler, void *userdata);
