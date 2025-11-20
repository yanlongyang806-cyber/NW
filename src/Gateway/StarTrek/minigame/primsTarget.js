'use strict';

var exports = module.exports;

//////////////////////////////////////////////////////////////////////////

exports.chooseAllOpponents =
exports.chooseRandomOpponents = function(options)
{
	options = options || {};
	return function() { return !this.source.states.confused ? doChooseRandomOpponents(this, options) : doChooseRandomAllies(this, true, options); }
}

exports.chooseAllAllies =
exports.chooseRandomAllies = function(options)
{
	options = options || {};
	return function() { return !this.source.states.confused ? doChooseRandomAllies(this, true, options) : doChooseRandomOpponents(this, options); }
}

exports.chooseAllAlliesExceptSource =
exports.chooseRandomAlliesExceptSource = function(options)
{
	options = options || {};
	return function() { return !this.source.states.confused ? doChooseRandomAllies(this, false, options) : doChooseRandomOpponents(this, options); }
}

exports.chooseSingleOpponent = function(options)
{
	options = options || {};
	return function() { return !this.source.states.confused ? doChooseSingleOpponent(this, options) : doChooseSingleAlly(this, false, options); }
}

exports.chooseSingleAlly = function(options)
{
	options = options || {};
	return function() { return !this.source.states.confused ? doChooseSingleAlly(this, true, options) : doChooseSingleOpponent(this, options); }
}

exports.chooseSingleAllyExceptSource = function(options)
{
	options = options || {};
	return function() { return !this.source.states.confused ? doChooseSingleAlly(this, false, options) : doChooseSingleOpponent(this, options); }
}

exports.chooseSelf = function(options)
{
	options = options || {};
	return function() { return !this.source.states.confused ? doChooseSelf(this, options) : false; }
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

/* global randomInt */

var k_allowAllies		= 1 << 0;
var k_allowOpponents	= 1 << 1;
var k_allowSource		= 1 << 2;
var k_allowDead			= 1 << 3;
var k_allowUntargetable	= 1 << 4;
var k_allowAffected		= 1 << 5;

function doChooseRandomOpponents(bundle, options)
{
	var flags = k_allowOpponents;

	if(options && options.allowDead)
		flags |= k_allowDead;

	if(options && options.allowAffected || bundle.allowAffected)
		flags |= k_allowAffected;

	var count = (typeof options === 'number') ? options : (options ? options.count : 0);

	var targets = makeTargetList(bundle, flags, count);
	if(bundle && bundle.test)
	{
		bundle.test = targets;
		return targets.length > 0;
	}

	bundle.targets = targets;

	return true;
}

function doChooseRandomAllies(bundle, allowSource, options)
{
	var flags = k_allowAllies;

	if(allowSource)
		flags |= k_allowSource;

	if(options && options.allowDead)
		flags |= k_allowDead;

	if((options && options.allowAffected) || bundle.allowAffected)
		flags |= k_allowAffected;

	var count = (typeof options === 'number') ? options : (options ? options.count : 0);

	var targets = makeTargetList(bundle, flags, count);
	if(bundle && bundle.test)
	{
		bundle.test = targets;
		return targets.length > 0;
	}

	bundle.targets = targets;

	return true;
}

function isAffectedByActionDef(card, actionDef)
{
	var keep = true;

	card.eachTargetLateUpkeepActionBundles.forEach(function (bundle) {
		keep = keep && bundle.action.actionDef !== actionDef;
	});

	if(keep)
	{
		card.eachTargetEarlyUpkeepActionBundles.forEach(function (bundle) {
			keep = keep && bundle.action.actionDef !== actionDef;
		});
	}

	if(keep)
	{
		card.eachTargetResolveActionBundles.forEach(function (bundle) {
			keep = keep && bundle.action.actionDef !== actionDef;
		});
	}

	return !keep;
}

function makeTargetList(bundle, flags, count)
{
	var source = bundle.source;
	var player = source.parentPlayer;
	var table = player.parentTable;
	var opponent = table.getOpponentForPlayer(player);

	var targets = [];

	if(flags & k_allowAllies)
	{
		targets = targets.concat(player.cards.filter(function(target) {
			return (flags & k_allowUntargetable || target.isAllyTargetable(!!(flags & k_allowDead)))
				&& (flags & k_allowSource || target !== source)
				&& (flags & k_allowAffected || !isAffectedByActionDef(target, bundle.action.actionDef));
		}));
	}

	if(flags & k_allowOpponents)
	{
		targets = targets.concat(opponent.cards.filter(function(target) {
			return (flags & k_allowUntargetable	|| target.isOpponentTargetable(!!(flags & k_allowDead)))
				&& (flags & k_allowAffected || !isAffectedByActionDef(target, bundle.action.actionDef));
		}));
	}

	if(count)
	{
		while(targets.length > count)
		{
			var i = randomInt(0, targets.length-1);
			targets.splice(i, 1);
		}
	}

	return targets;
}


function doChooseSingleOpponent(bundle, options)
{
	var flags = k_allowOpponents;

	if(options && options.allowDead)
		flags |= k_allowDead;

	if((options && options.allowAffected) || bundle.allowAffected)
		flags |= k_allowAffected;

	var targets = makeTargetList(bundle, flags);

	if(bundle && bundle.test)
	{
		bundle.test = targets;
		return targets.length > 0;
	}

	if(targets.length === 0)
	{
		bundle.source.log('No available targets!');
		console.log('No available targets!');
	}
	else
	{
		chooseTarget(bundle, targets);
	}


	return true;
}

function doChooseSingleAlly(bundle, allowSource, options)
{
	var flags = k_allowAllies;

	if(allowSource)
		flags |= k_allowSource;

	if(options && options.allowDead)
		flags |= k_allowDead;

	if((options && options.allowAffected) || bundle.allowAffected)
		flags |= k_allowAffected;

	var targets = makeTargetList(bundle, flags);

	if(bundle && bundle.test)
	{
		bundle.test = targets;
		return targets.length > 0;
	}

	if(targets.length === 0)
	{
		bundle.source.log('No available targets!');
		console.log('No available targets!');
	}
	else
	{
		chooseTarget(bundle, targets);
	}

	return true;
}

function doChooseSelf(bundle, options)
{
	var allowAffected = (options && options.allowAffected) || bundle.allowAffected;

	var targets = (allowAffected || !isAffectedByActionDef(bundle.source, bundle.action.actionDef)) ? [ bundle.source ] : [];

	if(bundle && bundle.test)
	{
		bundle.test = targets;
		return targets.length > 0;
	}

	if(targets.length === 0)
	{
		bundle.source.log('No available targets!');
		console.log('No available targets!');
	}

	bundle.targets = targets;

	return true;
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

function chooseTarget(bundle, targets)
{
	var source = bundle.source;
	var player = source.parentPlayer;
	var table = player.parentTable;

	var ids = [];

	targets.forEach(function(target) {
		ids.push(target.id);
	});

	table.selectForId(ids, function(table, playerTarget, cardTarget, actionTarget) {

		if(!cardTarget)
		{
			source.log('No target given');
			return false;
		}

		bundle.targets = [ cardTarget ];

		source.log('Target is '+cardTarget.cardDef.name);
		return true;
	});

	return true;
}

// End of File
