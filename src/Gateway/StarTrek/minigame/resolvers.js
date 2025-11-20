'use strict';

var resolvers = module.exports;

///////////////////////////////////////////////////////////////////////////

function calcStack(ctx, index)
{
	index = index ? ctx.length - index : ctx.length;

	var s = '';
	for(var i = 0; i < index; i++)
	{
		if(ctx[i].stack)
		{
			var char = ctx[i].stack.charAt(0);

			if(char === '/')
				s = ctx[i].stack.substring(1);
			else if(char !== '.')
				s = ctx[i].stack;
			else
				s += ctx[i].stack;
		}
		else
		{
			s = '';
		}
	}

	return s;
}

resolvers.here = function(ctx, unused, args, fn)
{
	var howfar = args[0] || 0;
	return calcStack(ctx, howfar);
}

resolvers.back = function(ctx, unused, args, fn)
{
	var howfar = args[0] || 1;
	var index = ctx.length - 1 - howfar;
	return ctx[index].obj;
}

resolvers.root = function(ctx, unused, args, fn)
{
	return ctx[0];
}

resolvers.insertInto = function(ctx, val, args, fn)
{
	var s = args[0].replace(/[%]+/g,val);

	return s;
}

//
// $randomInt(from, to)
// $randomInt(to)
//
// Returns a random integer between [from] and [to]. If only one parameter
// is provided, between zero and the parameter.
//
resolvers.randomInt = function(ctx, val, args, fn)
{
	var to = +args[1] || +args[0];
	var from = args[1] ? +args[0] : 0;

	return Math.floor(Math.random() * (to - from + 1)) + from;
}

//
// $ifEmptyUse(value)
//
// Returns the provided value if the current value is undefined or the empty
// string.
//
resolvers.ifEmptyUse = function(ctx, val, args, fn)
{
	return !val && typeof val !== 'number' ? args.join(', ') : val;
}

//
// $derefWithDefault(value, default)
//
// Returns the provided value if the current value is undefined or the empty
// string.
//
resolvers.derefWithDefault = function(ctx, val, args, fn)
{
	var ret;
	if (!val || typeof args[0] === 'undefined' || typeof val[args[0]] === 'undefined')
		ret = args[1];
	else
		ret = val[args[0]];

	return ret;
}

//
// $JSON()
//
// Takes an object and turns it into a JSON string
resolvers.JSON = function(ctx, val, args, fn)
{
	return JSON.stringify(val);
}

//
// $timerShort(7200, 2)
//
// Takes an integer (and assuming it is in seconds) returns how long
// this is in human redable text. '2h 30m'
//
// The second parameter denotes how many units to show.
//   (7200, 3) '2h 30m 0s'
//   (7200, 2) '2h 30m'
//   (7200, 1) '2h'
//
resolvers.timerShort = function(ctx, val, args, fn)
{
	var time = val;
	var msg = "";
	var num = args.length > 0 ? args[0] : 9;

	var values = [
		{ //days
			'time': 86400,
			'prefix': "d"
		},
		{ //hours
			'time': 3600,
			'prefix': "h"
		},
		{ //Minutes
			'time': 60,
			'prefix': "m"
		},
		{ //Seconds
			'time': 1,
			'prefix': "s"
		}
	];

	// Is at least 1 year
	var i;

	for(i in values)
	{
		var value = values[i];

		if(time >= value.time)
		{
			var valTime = Math.floor(time / value.time);

			if(msg)
				msg += " ";

			msg = msg + valTime + value.prefix;

			time = time % value.time;

			num--;
			if(num === 0)
				break;
		}
	}

	return msg;
}

//
// $timerAgoShort('Thu Nov 15 2012 14:16:57 GMT-0800')
//
// takes a time string (RFC 2822) and returns how long until
// it reaches the given time in a short form human readable
// text ex: '24m 43s'
//
// The second parameter denotes how many units to show.
//   (7200, 3) '2h 30m 0s'
//   (7200, 2) '2h 30m'
//   (7200, 1) '2h'
//
// NOTE: If the time given is in the past, an empty string will be displayed
resolvers.timerAgoShort = function (ctx, val, args, fn)
{
	var time = Date.parse(val) / 1000;
	var now = new Date().valueOf() / 1000;

	time = time - now;

	if(time < 0)
	{
		return "";
	}

	return resolvers.timerShort(ctx, time, args, fn);
}

//
// $length(array)
//
// Returns the length of any object (such as an array) that has a length field
//
// Objects that do not have a length are considered to have a size of 1
//
resolvers.length = function(ctx, val, args, fn)
{
	if(typeof val === 'undefined')
	{
		return 0;
	}
	else if (typeof val.length ==='number')
	{
		return val.length;
	}
	else
	{
		return 1;
	}
}

//
// $slice(array)
//
resolvers.slice = function(ctx, val, args, fn)
{
	if(val && Array.isArray(val))
	{
		return val.slice(args[0], args[1]);
	}
	else
	{
		return [];
	}
}

//
// $dateParse('Fri Nov 16 2012 12:00:57 GMT-0800')
//
resolvers.dateParse = function(ctx, val, args, fn)
{
	var timestamp = Math.round(Date.parse(val) / 1000);
	return timestamp;
}

//
// $replace
//
// A wrapper for the standard String function replace
//
resolvers.replace = function(ctx, val, args, fn)
{
	return val.replace(args[0], args[1]);
}

//
// $toLowerCase
//
// A wrapper for the standard String function toLowerCase
//
resolvers.toLowerCase = function(ctx, val, args, fn)
{
	return val.toLowerCase();
}

//
// $choose
//
// Returns the first element if true the value is true
// Otherwise returns the second argument
//
// Designed to emulate the terary operator.
//
resolvers.choose = function(ctx, val, args, fn)
{
	return val ? args[0] : args[1];
}

resolvers.cooldownPercent = function(ctx, val, args, fn)
{
	if(val.cooldown === 0)
		return '0';

	var c = (((val.actionDef.cooldown - val.cooldown) / val.actionDef.cooldown) * 100 ) | 0;
	return ''+c;
}

resolvers.subtract = function(ctx, val, args, fn)
{
	return val - args[0];
}

// End of File
