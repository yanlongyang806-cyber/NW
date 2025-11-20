'use strict';


var ActionDef = require('./ActionDef');

var actions = {};
var isLoaded = false;

function loadActions(reload)
{
	if(!reload && isLoaded)
		return actions;

	isLoaded = true;

	var files = [
		'carrier',
		'cruiser',
		'escort',
		'general',
		'science',
		'warbird',
	];

	var data;
	if(process && process.title === 'browser')
	{
		files.forEach(function(file) {
			$.ajax('./'+file+'.actiondefs', {
				async: false,
				cache: false,
				success: function(result) { data = result; },
				dataType: 'text'
			});
			ActionDef.processActionDefs(actions, data);
		});
	}
	else
	{
		var fs = require(''+'fs');
		files.forEach(function(file) {
			data = fs.readFileSync('./'+file+'.actiondefs');
			ActionDef.processActionDefs(actions, data);
		});
	}

	return actions;
}

//module.exports.actions = actions;
//module.exports.load = loadActions;

actions = loadActions();

module.exports = actions;

// End of File
