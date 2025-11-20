'use strict';

var utils = require('./utils');

//////////////////////////////////////////////////////////////////////////

var exports = module.exports;

//////////////////////////////////////////////////////////////////////////

exports.wait = function(options)
{
	options = options || {};
	return function() { return doWait(this, options); }
}

exports.forceTrue = function(fns)
{
	return function() { return doForceReturn(this, fns, true); }
}

exports.forceFalse = function(fns)
{
	return function() { return doForceReturn(this, fns, false); }
}

exports.ifTrue = function(testfns, truefns, falsefns)
{
	return function() { return doIf(this, true, testfns, truefns, falsefns); }
}

exports.ifFalse = function(testfns, truefns, falsefns)
{
	return function() { return doIf(this, false, testfns, truefns, falsefns); }
}

exports.eachTarget = function(fns)
{
	return function() { return doEachTarget(this, fns) };
}

exports.onSource = function(fns)
{
	return function() { return doOnSource(this, fns) };
}

exports.onTarget = function(fns)
{
	return function() { return doOnTarget(this, fns) };
}

exports.calc = function(expr)
{
	return function() { return doCalc(this, expr) };
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

function doCalc(bundle, expr)
{
	return (function() {
		var b = bundle;
		var a = bundle.params;
		var s = b.source;
		var t = b.params.subject || b.params.target;
		var source = s;
		var target = t;

		function counter(arg1, arg2) // (source|target|counter name, counter name)
		{
			var name;
			var o = target;
			if(arg1)
			{
				if(typeof arg1 === 'string')
					name = arg1;
				else
					o = arg1;
			}

			if(arg2 && typeof arg2 === 'string')
				name = arg2;

			if(!name)
				name = bundle.action.actionDef.name + '.' + bundle.action.id;

			return o.counters[name] ? o.counters[name] : 0;
		}

		function state(arg1, arg2) // (source|target|state name, state name)
		{
			var name;
			var o = target;
			if(arg1)
			{
				if(typeof arg1 === 'string')
					name = arg1;
				else
					o = arg1;
			}

			if(arg2 && typeof arg2 === 'string')
				name = arg2;

			return o.states[name] ? o.states[name] : 0;
		}


		try
		{
			return eval(expr);
		}
		catch(e)
		{
			bundle.error('Error when calc-ing. ('+bundle.action.actionDef+')');
		}

		return 0;
	})();
}


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

function doWait(bundle, params)
{
	var card = bundle.source;
	console.log('Wait '+card.cardDef.name);
	card.log('Skipping turn.');

	return true;
}

function doForceReturn(bundle, fns, value)
{
	if(fns)
	{
		if(typeof fns === 'function')
		{
			fns.call(bundle);
		}
		else
		{
			fns.forEach(function(fn) {
				fn.call(bundle);
			});
		}
	}

	return value;
}


function doIf(bundle, test, testfns, truefns, falsefns)
{
	console.log('If '+bundle.source.cardDef.name);

	var ret = true;

	if(typeof testfns === 'function')
	{
		ret = testfns.call(bundle);
	}
	else
	{
		testfns.forEach(function(fn) {
			ret = fn.call(bundle) && ret;
		});
	}

	if(ret == test)
	{
		if(truefns)
		{
			if(typeof truefns === 'function')
			{
				ret = truefns.call(bundle);
			}
			else
			{
				truefns.forEach(function(fn) {
					ret = fn.call(bundle);
				});
			}
		}
		return ret;
	}
	else
	{
		if(falsefns)
		{
			if(typeof falsefns === 'function')
			{
				ret = falsefns.call(bundle);
			}
			else
			{
				falsefns.forEach(function(fn) {
					ret = fn.call(bundle);
				});
			}
		}
		return ret;
	}
}


function doEachTarget(bundle, fns)
{
	var origParams = bundle.params;

	if(!bundle.targets)
	{
		bundle.source.log('No targets for doEachTarget');
		return;
	}

	bundle.targets.forEach(function(target) {
		bundle.params = utils.extend({}, origParams);
		bundle.params.target = target;

		if(typeof fns === 'function')
		{
			fns.call(bundle)
		}
		else
		{
			fns.forEach(function(fn) {
				fn.call(bundle);
			});
		}
	});

	bundle.params = origParams;
	return true;
}


function doOnSource(bundle, fns)
{
	var origSubject = bundle.params.subject;
	bundle.params.subject = bundle.source;

	if(typeof fns === 'function')
	{
		fns.call(bundle)
	}
	else
	{
		fns.forEach(function(fn) {
			fn.call(bundle);
		});
	}

	bundle.params.subject = origSubject;

	return true;
}

function doOnTarget(bundle, fns)
{
	var origSubject = bundle.params.subject;
	bundle.params.subject = bundle.params.target;

	if(!bundle.params.subject)
	{
		bundle.source.log('OnTarget must have a single target. Perhaps use eachTarget? ('+bundle.action.actionDef.name+')');
	}

	if(typeof fns === 'function')
	{
		fns.call(bundle)
	}
	else
	{
		fns.forEach(function(fn) {
			fn.call(bundle);
		});
	}

	bundle.params.subject = origSubject;
	return true;
}

// End of File
