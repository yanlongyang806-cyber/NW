// Dummy noop for jSrollPane
// Needed because contentHelpers assumes we have the plug-in
// and writing this no-op was easier than making contentHelper
// things work for both STO and NW
// - Kevin
(function($,window,undefined){
	$.fn.jScrollPane = function(settings)
	{
		return false;
	}
})(jQuery,this);