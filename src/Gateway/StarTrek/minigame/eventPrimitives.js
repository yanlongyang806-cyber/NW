'use strict';

var ActionBundle = require('./ActionBundle');

//////////////////////////////////////////////////////////////////////////

(function(exports) {

exports.doCooldowns = function(card)
{
	//console.log('DoCooldowns '+card.cardDef.name);

	if(!card.canExecuteAction()) return;

	card.actions.forEach(function(action) {
		if(action.cooldown)
			action.cooldown--;
	});
}

exports.resetNoTargets = function(card)
{
	//console.log('DoCooldowns '+card.cardDef.name);

	card.actions.forEach(function(action) {
		action.noTargets = false;
	});
}

exports.resetStates = function(card)
{
	//console.log('ResetStates '+card.cardDef.name);

	for(var state in card.states)
		card.states[state] = false;
}

exports.attribReset = function(card)
{
	//console.log('AttribReset '+card.cardDef.name);

	for(var name in card.cardDef.attribResetInfo)
	{
		if(card.cardDef.attribResetInfo[name].copy)
			card.attribs[name] = card.cardDef.attribs[name];
	}
}

exports.resetActions = function(card)
{
	//console.log('UpdateActions '+card.cardDef.name);

	if(card.nextActionBundle)
		card.nextActionBundle.action.chosen = false;

	card.nextActionBundle = null;
}

exports.upkeepActions = function(card)
{
	//console.log('UpdateUpkeepActions '+card.cardDef.name);

	card.eachTargetEarlyUpkeepActionBundles = card.eachTargetEarlyUpkeepActionBundles.filter(function(bundle) {
		return bundle.onEachTargetEarlyUpkeep();
	});

	card.eachTargetLateUpkeepActionBundles = card.eachTargetLateUpkeepActionBundles.filter(function(bundle) {
		return bundle.onEachTargetLateUpkeep();
	});
}

exports.actionsQueued = function(card)
{
	//console.log('ActionsQueued '+card.cardDef.name);

	var bundle = card.nextActionBundle;
	if(!bundle || !card.canExecuteAction()) return;

	bundle.onQueued();

	bundle.targets.forEach(function(target) {
		var newBundle = new ActionBundle(bundle.action, bundle);
		newBundle.params.target = target;

		if(bundle.action.actionDef.onEachTargetEarlyUpkeep)
			target.eachTargetEarlyUpkeepActionBundles.push(newBundle);

		if(bundle.action.actionDef.onEachTargetLateUpkeep)
			target.eachTargetLateUpkeepActionBundles.push(newBundle);

		if(bundle.action.actionDef.onEachTargetEarlyResolve)
			target.eachTargetResolveActionBundles.push(newBundle);
	});
}

exports.onOrders = function(card)
{
	//console.log('OnOrders '+card.cardDef.name);

	var bundle = card.nextActionBundle;
	if(!bundle || !card.canExecuteAction()) return;

	bundle.onOrders();
}

exports.eachTargetResolveActions = function(card)
{
	//console.log('Target Resolve '+card.cardDef.name);

	card.eachTargetResolveActionBundles = card.eachTargetResolveActionBundles.filter(function(bundle) {
		return bundle.onEachTargetEarlyResolve();
	});
}

exports.resolveActions = function(card)
{
	//console.log('Resolve '+card.cardDef.name);

	if(!card.canExecuteAction()) return;

	var bundle = card.nextActionBundle;
	if(!bundle)
		return;

	bundle.checkTargets();

	bundle.onResolve();

	bundle.action.cooldown += bundle.action.actionDef.cooldown;
}

})(module.exports);

// End of File
