'use strict';

var exports = module.exports;
var prims = require('./prims');

//////////////////////////////////////////////////////////////////////////

exports.addCounter = function(count, name)
{
	return function() { return doAddCounter(this, count, name); }
}

exports.decrementCounter = function(count, name)
{
	return function() { return doDecrementCounter(this, count, name); }
}

exports.useCounter = function(count, name, fns)
{
	if(typeof name === 'string')
		return prims.ifTrue(prims.decrementCounter(count, name), fns);
	else
		return prims.ifTrue(prims.decrementCounter(count), name);
}

exports.hasCounter = function(count, name)
{
	return function() { return doHasCounter(this, count, name); }
}


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

function doAddCounter(bundle, count, name)
{
	var card = bundle.source;
	console.log('AddCounter '+card.cardDef.name);

	if(!name)
		name = bundle.action.actionDef.name + '.' + bundle.action.id;

	var subject = bundle.params.subject || bundle.params.target;
	if(!subject)
	{
		card.error('Subject or individual target not set!');
		return;
	}

	if(subject.counters[name])
		subject.counters[name] += count;
	else
		subject.counters[name] = count;

	subject.log('Added ' + count + ' to ' + name + ' counter');

	return true;
}

function doDecrementCounter(bundle, count, name)
{
	var card = bundle.source;
	console.log('UseCounter '+card.cardDef.name);

	if(!name)
		name = bundle.action.actionDef.name + '.' + bundle.action.id;

	var subject = bundle.params.subject || bundle.params.target;
	if(!subject)
	{
		card.error('Subject or individual target not set!');
		return false;
	}

	if(subject.counters[name] >= count)
	{
		subject.counters[name] -= count;

		subject.log('Used ' + count + ' from ' + name + ' counter');

		return true;
	}

	return false;
}

function doHasCounter(bundle, count, name)
{
	var card = bundle.source;
	console.log('HasCounter '+card.cardDef.name);

	if(!name)
		name = bundle.action.actionDef.name + '.' + bundle.action.id;

	var subject = bundle.params.subject || bundle.params.target;
	if(!subject)
	{
		card.error('Subject or individual target not set!');
		return false;
	}

	return subject.counters[name] >= count;
}


// End of File
