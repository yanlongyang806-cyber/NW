
var utils = require('./utils');
var prims = require('./prims');

/////////////////////////////////////////////////////////////////////////////

function ActionDef(actionDef)
{
	'use strict';
	var defaultAction = {
		name: 'DefaultAction',
		cooldown: 0
	};

	utils.extend(this, defaultAction, actionDef);

	compileHandlers(this);
}

function compileHandlers(action)
{
	'NOT strict';
	var names = [
		'onChoose',
		'onQueued',
		'onOrders',
		'onEachTargetEarlyResolve',
		'onResolve',
		'onEachTargetEarlyUpkeep',
		'onEachTargetLateUpkeep'
	];

	if(!action.handlerDefs) action.handlerDefs = {};

	names.forEach(function(name) {
		if(name in action) {
			action.handlerDefs[name] = action[name];
			with(prims)
			{
				action[name] = eval(action[name]);
			}
		}
	})

}


ActionDef.processActionDefs = function(actions, data)
{
	'use strict';
	var reCR = /\r?\n\s*/g;
	var reMultiline = /<&((.|\r?\n)*?)&>/g;
	data = data.replace(reMultiline, function(match, p1, offset, string) {
		return '"' + p1.replace(reCR, '\\n').replace(/"/g, '\\"') + '"';
	});

	try
	{
		data = eval(data);
	}
	catch(e)
	{
		console.error(e);
		console.log(data);
		throw(e);
	}

	if(!data.id)
	{
		console.error('Bad action definition file.');
		return undefined;
	}

	if(data.actions)
	{
		var a = data.actions;
		data.actions = {};

		a.forEach(function(action) {
			action.idParent = data.id;
			data.actions[action.id] = data[action.id] = new ActionDef(action);
		});
	}

	actions[data.id] = data;
}

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

module.exports = ActionDef;

/////////////////////////////////////////////////////////////////////////////

// End of File
