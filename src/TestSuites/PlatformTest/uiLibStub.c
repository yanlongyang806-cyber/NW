/***************************************************************************
*     Copyright (c) 2008, Cryptic Studios
*     All Rights Reserved
*     Confidential Property of Cryptic Studios
***************************************************************************/

// For ui stuff
#include "UICore.h"
#include "UIComboBox.h"
#include "UIExpander.h"
#include "UIScrollbar.h"
#include "UIWidgetTree.h"
#include "UIWindow.h"
#include "UIProgressBar.h"
#include "UICheckButton.h"
#include "UISlider.h"
#include "UIList.h"
#include "UIBarGraph.h"

#if _WIN32
#pragma warning(disable:6387)
#endif

UIGlobalState g_ui_State;

UIButton *ui_ButtonCreate(OPT_STR_GOOD const char *text, F32 x, F32 y, UIActivationFunc clickedF, UserData clickedData)
{
    return NULL;
}
F32 ui_WidgetGetX(NN_PTR_GOOD UIWidget *widget)
{
    return 0.0f;
}
F32 ui_WidgetGetY(NN_PTR_GOOD UIWidget *widget)
{
    return 0.0f;
}
F32 ui_WidgetGetWidth(NN_PTR_GOOD UIWidget *widget)
{
    return 0.0f;
}
F32 ui_WidgetGetHeight(NN_PTR_GOOD UIWidget *widget)
{
    return 0.0f;
}

F32 ui_WidgetGetNextX(NN_PTR_GOOD UIWidget *widget)
{
    return 0.0f;
}
F32 ui_WidgetGetNextY(NN_PTR_GOOD UIWidget *widget)
{
    return 0.0f;
}
UIWidgetTreeNode *ui_WidgetTreeNodeCreate(	NN_PTR_GOOD UIWidgetTree *tree, 
											const char *name, 
											U32 crc, 
											OPT_PTR_GOOD ParseTable *table, 
											OPT_PTR_GOOD void *contents,
											UIWidgetTreeChildrenFunc fill, 
											UserData fillData,
											OPT_PTR_GOOD UIWidgetTreeDisplayFunc display, 
											UserData displayData,
											F32 height)
{
    return NULL;
}
void ui_WidgetTreeNodeAddChild(NN_PTR_GOOD UIWidgetTreeNode *parent, NN_PTR_GOOD UIWidgetTreeNode *child)
{
}
UIProgressBar *ui_ProgressBarCreate(F32 x, F32 y, F32 w)
{
    return NULL;
}

UICheckButton *ui_CheckButtonCreate(F32 x, F32 y, const char *text, bool state)
{
    return NULL;
}
void ui_CheckButtonSetToggledCallback(UICheckButton *check, UIActivationFunc toggledF, UserData toggledData)
{
}
void ui_SliderSetChangedCallback(UISlider *slider, UISliderChangeFunc changedF, UserData changedData)
{
}
void ui_SliderSetPolicy(UISlider *slider, UISliderPolicy policy)
{
}
void ui_SliderSetValueAndCallbackEx(UISlider *slider, int idx, F64 val, int callChangedCallback, bool allowOutOfRange)
{
}
void ui_SliderSetRange(NN_PTR_GOOD UISlider *slider, F64 min, F64 max, F64 step)
{
}
void ui_ScrollAreaAddChild(UIScrollArea *scrollarea, UIWidget *child)
{
}
void ui_ScrollAreaSetSize(NN_PTR_GOOD UIScrollArea *scrollarea, F32 xSize, F32 ySize)
{
}
UIScrollArea *ui_ScrollAreaCreate(F32 x, F32 y, F32 w, F32 h, F32 xSize, F32 ySize, bool xScroll, bool yScroll)
{
    return NULL;
}
UIList *ui_ListCreate(ParseTable *pTable, UIModel peaModel, F32 fRowHeight)
{
    return NULL;
}
UIListColumn *ui_ListColumnCreate(UIListColumnType eType, const char *pchTitle, intptr_t contents, UserData pDrawData)
{
    return NULL;
}
void ui_ListAppendColumn(UIList *pList, UIListColumn *pColumn)
{
}
void ui_WidgetSetDimensionsEx(NN_PTR_GOOD UIWidget *widget, F32 w, F32 h, UIUnitType wUnit, UIUnitType hUnit)
{
}
void ui_WidgetSetPositionEx(NN_PTR_GOOD UIWidget *widget, F32 x, F32 y, F32 xPOffset, F32 yPOffset, UIDirection offsetFrom)
{
}
void ui_WidgetSetHeightEx(NN_PTR_GOOD UIWidget *widget, F32 h, UIUnitType hUnit)
{
}
F32 ui_WidgetTreeGetHeight(NN_PTR_GOOD UIWidgetTree *tree)
{
    return 0.0f;
}
void ui_WidgetTreeNodeExpand(NN_PTR_GOOD UIWidgetTreeNode *node)
{
}
void ui_WidgetAddChild(NN_PTR_GOOD UIWidget *parent, OPT_PTR_GOOD UIWidget *child)
{
}
void ui_WidgetSetFreeCallback(NN_PTR_GOOD UIWidget *widget, UIFreeFunction onFreeF)
{
}
void ui_WidgetQueueFree(OPT_PTR_GOOD UIWidget *widget)
{
}
UILabel *ui_LabelCreate(const char *text, F32 x, F32 y)
{
    return NULL;
}
void ui_LabelSetText(NN_PTR_GOOD UILabel *label, const char *text)
{
}
void ui_BarGraphSetModel(UIBarGraph *pGraph, void* model, int stride, int length, U32 floats)
{
}
UIBarGraph *ui_BarGraphCreate(const char *pchLabelX, const char *pchLabelY, const Vec2 v2Lower, const Vec2 v2Upper)
{
    return NULL;
}
UISkin *ui_SkinCreate(UISkin *base)
{
    return NULL;
}
void ui_SkinSetButton(UISkin *skin, Color c)
{
}
void ui_ProgressBarSet(UIProgressBar *pbar, F32 progress)
{
}
bool ui_CheckButtonGetState(UICheckButton *check)
{
    return false;
}
void ui_SliderAddSpecialValue(NN_PTR_GOOD UISlider *slider, F64 value, Color c)
{
}
F64 ui_SliderGetValueEx(UISlider *slider, int idx)
{
    return 0.0;
}
UISlider *ui_SliderCreate(F32 x, F32 y, F32 width, F64 min, F64 max, F64 current)
{
    return NULL;
}
UIWindow *ui_WindowCreate(OPT_STR_GOOD const char *title, F32 x, F32 y, F32 w, F32 h)
{
    return NULL;
}
void ui_WindowClose(NN_PTR_GOOD UIWindow *window)
{
}
void ui_WindowSetCloseCallback(NN_PTR_GOOD UIWindow *window, UICloseFunc closeF, UserData closeData)
{
}
void ui_WindowAddChild(NN_PTR_GOOD UIWindow *window, NN_PTR_GOOD_BYTES(sizeof(UIWidget)) UIAnyWidget *child)
{
}
void ui_WindowShow(NN_PTR_GOOD UIWindow *window)
{
}
void ui_WindowHide(NN_PTR_GOOD UIWindow *window)
{
}
UIComboBox *ui_ComboBoxCreate(F32 x, F32 y, F32 w, ParseTable *table, cUIModel model, const char *field)
{
    return NULL;
}
void ui_ComboBoxSetSelectedCallback(UIComboBox *cb, UIActivationFunc selectedF, UserData selectedData)
{
}
void ui_ComboBoxSetMultiSelect(UIComboBox *cb, bool bMultiSelect)
{
}
const S32 * ui_ComboBoxGetSelecteds(UIComboBox *cb)
{
    return NULL;
}
S32 ui_ComboBoxGetSelected(UIComboBox *cb)
{
    return 0;
}
UIWidgetTree *ui_WidgetTreeCreate(F32 x, F32 y, F32 w, F32 h)
{
    return NULL;
}
void ui_WidgetTreeNodeSetFillCallback(NN_PTR_GOOD UIWidgetTreeNode *node, UIWidgetTreeChildrenFunc fillF, UserData fillData)
{
}
void ui_WidgetTreeNodeExpandAndCallback(NN_PTR_GOOD UIWidgetTreeNode *node)
{
}
void ui_WidgetTreeNodeSetIsVisibleCallback(NN_PTR_GOOD UIWidgetTreeNode *node, UIWidgetTreeNodeIsVisibleFunc isvizfunc)
{
}
void ui_WidgetTreeNodeSetFreeCallback(NN_PTR_GOOD UIWidgetTreeNode *node, NN_PTR_GOOD UIFreeFunction freeF)
{
}
void ui_WidgetSetPaddingEx(NN_PTR_GOOD UIWidget *widget, F32 left, F32 right, F32 top, F32 bottom)
{
}
void ui_WidgetTreeSetSelectedCallback(NN_PTR_GOOD UIWidgetTree *tree, UIActivationFunc selectedF, UserData selectedData)
{
}
bool ui_WidgetTreeNodeRemoveChild(NN_PTR_GOOD UIWidgetTreeNode *parent, NN_PTR_GOOD UIWidgetTreeNode *child)
{
    return false;
}

void ui_WindowRemoveChild(NN_PTR_GOOD UIWindow *window, NN_PTR_GOOD_BYTES(sizeof(UIWidget)) UIAnyWidget *child)
{
}
void ui_WidgetSetClickThrough(NN_PTR_GOOD UIWidget *widget, bool c)
{
}
void ui_ButtonSetText(NN_PTR_GOOD UIButton *button, OPT_STR_GOOD const char *text)
{
}
void ui_ComboBoxSetSelectedsAsStringAndCallback(NN_PTR_GOOD UIComboBox *cb, const char *pchValue)
{
}