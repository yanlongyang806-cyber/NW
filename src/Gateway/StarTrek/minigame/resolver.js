'use strict';

var resolvers = require('./resolvers');

//////////////////////////////////////////////////////////////////

function renderInternal(dataModel, renderStencil, rootpath)
{
	if(rootpath)
	{
		if(typeof rootpath === 'string')
		{
			dataModel.resolvePath(rootpath, dataModel.model, function(e, obj) {
				renderStencil(e, dataModel.makeStackItem(obj, rootpath));
			});
		}
		else
		{
			renderStencil(undefined, rootpath);
		}
	}
	else
	{
		renderStencil(undefined, dataModel.model);
	}
}

var render = function(stencilFunc, name, rootpath, callback)
{
	var self = this;

	var renderStencil = function _renderStencil(e, obj) {
		stencilFunc(name, resolveArray, obj, callback);
	};

	renderInternal(this, renderStencil, rootpath);
}

///////////////////////////////////////////////////////////////////////////

function StackItem(obj, stack)
{
	this.obj = obj;
	this.stack = stack;
}

function makeStackItem(obj, path)
{
	return new StackItem(obj, path);
}

//
// resolveArray
//
// Takes a context stack, an array to deposit HTML, and an array of stencil
// nodes and resolves them into the HTML array.
//
function resolveArray(name, obj, html, arr, cb)
{
	if(!(obj instanceof StackItem))
	{
		obj = makeStackItem(obj);
	}
	var ctx = [ obj ];
	ctx.name = name;

	cb(undefined, resolveArrayInternal(ctx, html, arr));
}

function recurseChildren(ctx, html, newItem, children)
{
	var top = ctx.length;

	if(newItem)
		ctx.push(newItem);

	resolveArrayInternal(ctx, html, children);
	while(ctx.length > top)
		ctx.pop();
}

function resolveArrayInternal(ctx, html, arr)
{
	var obj;

	arr.forEach(function _forEachStencilArrayItem(item) {
		var res;
		if(typeof item.s !== 'undefined')
		{
			applyResult(ctx, html, item, item.s);
		}
		else if(item.t)
		{
			applyResult(ctx, html, item, '<u class="sample">' + item.t + '</u>');
		}
		else if(item.r)
		{
			obj = ctx.slice(-1)[0].obj;
			var q = resolvePathInternal(ctx, item.r, obj);
			applyResult(ctx, html, item, q);
		}
		else if(item.c)
		{
			if(item.i)
			{
				obj = ctx.slice(-1)[0].obj;

				var r = [];
				for(var i = 0; i < item.i.t.length; i++)
				{
					r[i] = resolvePathInternal(ctx, item.i.t[i], obj);
				}

				var ifResult = false;
				try
				{
					try
					{
						ifResult = eval(item.i.e);
					}
					catch(e)
					{
						ifResult = false;
					}
				}
				catch(e)
				{
					throw e;
				}

				if(ifResult)
				{
					recurseChildren(ctx, html, undefined, item.c);
				}
			}
			else
			{
				recurseChildren(ctx, html, undefined, item.c);
			}

			if(item.u) html.push('</span>');
		}
		else
		{
			console.error('Error: resolveArrayInternal(): Could not resolve item: ',item);
		}
	});
}

///////////////////////////////////////////////////////////////////////////

function evalIf(op, lval, rval)
{
	switch(op)
	{
		case '=':
		case '==':
		case 'eq': return (lval == rval);

		case '!=':
		case 'ne': return (lval != rval);

		case 'lt': return (lval < rval);
		case 'le': return (lval <= rval);
		case 'gt': return (lval > rval);
		case 'ge': return (lval >= rval);
	}

	return !!lval;
}

///////////////////////////////////////////////////////////////////////////

//
// applyResult
//
// This takes the result of a lookup and does the right thing with it.
//   Scalars are pushed into the html array.
//   Objects are pushed onto the stack.
//   Arrays are iterated over if there are children for this item, otherwise
//     they are pushed onto the stack.
//
// If the item has children, they are exec-ed.
//
function applyResult(ctx, html, item, val)
{
	if(typeof val === 'object')
	{
		if(Array.isArray(val) && item.c /*children*/)
		{
			var i = 0;

			val.forEach(function(obj) {
				if(typeof obj !== 'undefined')
				{
					recurseChildren(ctx, html,
						makeStackItem(obj, item.r + '[' + i++ + ']'),
						item.c);
				}
			});
		}
		else
		{
			if(!(val instanceof StackItem))
			{
				val = makeStackItem(val, item.r);
			}

			if(item.c /*children*/)
			{
				recurseChildren(ctx, html,
					val,
					item.c);
			}
			else
			{
				ctx.push(val);
			}
		}
	}
	else
	{
		// This is a scalar and therefore replaces
		//   whatever children are inside.
		if(typeof val !== 'undefined')
		{
			html.push(''+val);
		}
	}
}

var reParsePath = /^([.]?)([$@%]?)([\w]*)([\[\(]?)(.*)/;
	// ignore a leading period
	// 1 = $, @, or empty
	// 2 = field name
	// 3 = [, (, or empty
	// 4 = remainder of string

function resolvePathInternal(ctx, str, obj)
{
	var e;
	var args;
	var strLast = str;

	if(!str)
	{
		// Nothing left in the string. We're done.
		return obj;
	}

	var res = reParsePath.exec(str);
	if(res)
	{
		var leader = res[1];
		var prefix = res[2];
		var identifier = res[3];
		var isarray = res[4];
		var remainder = isarray + res[5];
		// res shouldn't be used after here.

		if(prefix === '$' && identifier)
		{
			// This is a function to execute.
			args = getArgs(remainder, 0, '(', ')');

			if(typeof resolvers[identifier] === 'function')
			{
				return resolvePathInternal(ctx, args.rest,
					resolvers[identifier](ctx, obj, args));
			}
			else
			{
				throw new Error('Function "'+identifier+'" doesn\'t exist on the resolver.');
			}

			return;
		}

		if(!leader && identifier)
		{
			// There was no leading dot and there is something named to fetch.
			//   (If there is no identifier, it's likely an array index [x], this
			//    can happen for multi-dimensional arrays.)
			// Assume that they want to refer to the root object in the context.

			// Go to the root, and re-evaluate from there as a relative path.
			return resolvePathInternal(ctx, '.'+str, ctx[0].obj);
		}

		var objNext;
		if(obj && identifier)
		{
			if(identifier in obj)
			{
				objNext = obj[identifier];
			}
			else
			{
				identifier = identifier.toLowerCase();
				if(identifier in obj)
				{
					objNext = obj[identifier];
				}
			}
		}
		else
		{
			objNext = obj;
		}

		if(typeof objNext !== 'undefined' && objNext !== null && isarray === '[')
		{
			// handle array lookup
			args = getArgs(remainder, 0, '[', ']');
			remainder = args.rest;
			objNext = lookUpWithFilter(objNext, args[0]);
		}

		if(typeof objNext !== 'undefined' && objNext !== null)
		{
			if(!remainder)
			{
				return objNext;
			}
			else
			{
				if(strLast === remainder) { console.error('Infinitely recursive resolve path! ', ctx, remainder, objNext); throw new Error('Infinite recursion'); }
				return resolvePathInternal(ctx, remainder, objNext);
			}
		}
	}

	// Cant see how the error below gets handled, so outputting error
	// here for sanity's sake.
	console.error('Unable to reduce string "'+str+'" on object', obj);

	throw new Error('Unable to reduce string "'+str+'" on object '+JSON.stringify(obj));
}

///////////////////////////////////////////////////////////////////////////

var opsStr = "= == != eq ne lt le gt ge".split(' ').join('|');
var reFilter = new RegExp('(\\w+)\\s*('+opsStr+')\\s*(\\w*)');
	// 1 = field
	// 2 = operation
	// 3 = the thing to test
function lookUpWithFilter(obj, filterStr)
{
	var objNext = obj[filterStr];
	var res = reFilter.exec(filterStr);
	if(res)
	{
		var field = res[1];
		var val = res[3];

		var objFound = [];
		if(res[2])
		{
			obj.forEach(function(item) { if(evalIf(res[2], item[field], val)) { objFound.push(item); } });
		}
		else
		{
			objFound = objNext;
		}

		objNext = objFound.length === 1 ? objFound[0] : objFound;
	}

	return objNext;
}

//
// GetArgs
//
// Given a string and a starting point, create an array of arguments gathered
//   from the string. Strings and sub-parenthetical expressions are supported.
//
// Returns:
//   An array of the args
//     and
//   start: the index of the given starting point in the source string
//   end: the index of the end of the argument list in the source string
//   rest: the remainder of the string that is not part of the argument list.
//
// Examples:
//   GetArgs("func(x, y) body", 0) => [ 'x', 'y', start: 0, rest: 'body', end: 10 ]
//   GetArgs("func((1+2)*q, 'fun()')", 0) => [ '(1+2)*q', '\'fun()\'', start: 0, rest: '', end: 22 ]
//
//
function getArgs(str, idxStart, startChar, endChar)
{
	var args = []
	var depth = 0
	var start = 0
	var inquote = false
	var indquote = false
	var started = false

	startChar = startChar || '('
	endChar = endChar || ')'

	args.start = idxStart || 0
	var pos = args.start

	while(pos < str.length) {
		if((inquote || indquote) && str[pos] === '\\') {
			// Skip over the escaped character
			pos += 1
		}
		else if(!inquote && !indquote && str[pos] === startChar) {
			if(depth === 0) {
				started = true;
				start = pos+1
			}
			depth += 1
		}
		else if(!inquote && !indquote && str[pos] === endChar) {
			depth -= 1
			if(depth === 0) {
				if(pos > start)
				{
					args.push(str.slice(start, pos).trim())
				}
				break
			}
		}
		else if(!inquote && !indquote && depth === 1 && str[pos] === ',') {
			args.push(str.slice(start, pos).trim())
			start = pos+1
		}
		else if(!inquote && str[pos] === "\"") {
			indquote = !indquote
		}
		else if(!indquote && str[pos] === "'") {
			inquote = !inquote
		}

		pos += 1
	}

	if(started)
	{
		args.rest = str.slice(pos+1).trim()
		args.end = pos+1
	}
	else
	{
		// There were no ()s []s or whatever delimiters we were looking
		//   for.
		args.rest = str.slice(idxStart)
		args.end = idxStart
	}

	return args
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

module.exports.render = render;

//////////////////////////////////////////////////////////////////////////

// End of File
