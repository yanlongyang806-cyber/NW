'use strict';

var utils = require('./utils');
var Action = require('./Action');

//////////////////////////////////////////////////////////////////////////

function Card(id, parentPlayer, cardDef)
{
	this.id = id;
	this.parentPlayer = parentPlayer;
	this.cardDef = cardDef;

	this.level = 1;

	this.attribs = utils.deepExtend({}, cardDef.attribs);

	this.isTarget = false;
	this.isDisabled = false;

	this.nextActionBundle = null;

	this.eachTargetLateUpkeepActionBundles = [];
	this.eachTargetEarlyUpkeepActionBundles = [];
	this.eachTargetResolveActionBundles = [];

	this.order = '-';

	this.counters = {};

	this.states = {
		disabled:				false, // can't execute or select actions
		allyUntargetable:		false,
		opponentUntargetable:	false,
		untargetable:			false, // If false, overrides the last two
		confused:				false,
	};

	this.actions = [];
	for(var name in cardDef.actions)
	{
		this.actions.push(new Action('a'+Card.s_id++, this, cardDef.actions[name]));
	}

	this.logLines = [];
}

Card.s_id = 0;

Card.prototype.clampAttribs = function( )
{
	var mins = this.cardDef.attribsMin;
	var maxes = this.cardDef.attribsMax;

	for(var name in this.attribs)
	{
		if(!(name in mins))
			mins[name] = 0;
		if(this.attribs[name] < mins[name])
			this.attribs[name] = mins[name];

		if(name in this.cardDef.attribResetInfo && this.cardDef.attribResetInfo[name].max === 'base')
		{
			if(this.attribs[name] > this.cardDef.attribs[name])
				this.attribs[name] = this.cardDef.attribs[name];
		}
		else
		{
			if(!(name in maxes))
				maxes[name] = 999999;
			if(name in maxes && this.attribs[name] > maxes[name])
				this.attribs[name] = maxes[name];
		}
	}

	// A special case for a dependent attribute.
	if(this.attribs.attackMin > this.attribs.attackMax)
		this.attribs.attackMin = this.attribs.attackMax;

}

Card.prototype.getActionForId = function(id)
{
	for(var i = 0; i < this.actions.length; i++)
	{
		if(this.actions[i].id === id)
			return this.actions[i];
	}
}

Card.prototype.log = function(str)
{
	this.logLines.push(str);
	console.log('    %c'+str, 'color:blue')
}

Card.prototype.error = function(str)
{
	this.logLines.push('<span style="error">'+str+'</span>');
	console.log('    %c'+str, 'color:red')
}

Card.prototype.logClear = function(str)
{
	this.logLines = [];
}

Card.prototype.canExecuteAction = function(bAllowDead)
{
	return !this.states.disabled
		&& (bAllowDead || this.attribs.hitpoints > 0);
}

Card.prototype.isAllyTargetable = function(bAllowDead)
{
	return !this.states.untargetable
		&& !this.states.allyUntargetable
		&& (bAllowDead || this.attribs.hitpoints > 0);
}

Card.prototype.isOpponentTargetable = function(bAllowDead)
{
	return !this.states.untargetable
		&& !this.states.opponentUntargetable
		&& (bAllowDead || this.attribs.hitpoints > 0);
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

module.exports = Card;

//////////////////////////////////////////////////////////////////////////

// End of File
