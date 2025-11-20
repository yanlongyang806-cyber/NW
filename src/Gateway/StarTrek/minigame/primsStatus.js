'use strict';

var exports = module.exports;

//////////////////////////////////////////////////////////////////////////

exports.setState = function(name, duration)
{
	return function() { return doSetState(this, name, true, duration); }
}

exports.clearState = function(name, duration)
{
	return function() { return doSetState(this, name, false, duration); }
}

exports.isInState = function(name)
{
	return function() { return doIsInState(this, name); }
}


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

function doSetState(bundle, name, state, duration)
{
	var source = bundle.source;
	console.log('SetState '+source.cardDef.name);

	var subject = bundle.params.subject || bundle.params.target;
	if(!subject)
	{
		source.error('Subject or individual target not set!');
		return;
	}

	if(!(name in subject.states))
	{
		source.log('WARNING: state ' + name + 'isn\'t a standard status. (In action ' + bundle.action.actionDef.name + '.)');
	}

	subject.states[name] = state;

	source.log('Set state ' + name + ' to ' + subject.states[name] + ' on ' + subject.cardDef.name);
	subject.log('Set state ' + name + ' to ' + subject.states[name] + ' by ' + source.cardDef.name);

	return true;
}

function doIsInState(bundle, name)
{
	var source = bundle.source;
	console.log('IfInState '+source.cardDef.name);

	var subject = bundle.params.subject || bundle.params.target;
	if(!subject)
	{
		source.error('Subject or individual target not set!');
		return;
	}

	return subject.states[name];
}


// End of File
