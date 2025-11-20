'use strict';

var exports = module.exports;

//////////////////////////////////////////////////////////////////////////

exports.attribMultiply = function(options)
{
	options = options || {};
	return function() { return doAttribMultiply(this, options); }
}

exports.attribModifyMultiply = function(options)
{
	options = options || {};
	return function() { return doAttribMultiply(this, options, true); }
}

exports.attribModifyMultiplyBase = function(options)
{
	options = options || {};
	return function() { return doAttribMultiply(this, options, true, true); }
}

exports.attribSet = function(options)
{
	options = options || {};
	return function() { return doAttribSet(this, options); }
}

exports.attribModify = function(options)
{
	options = options || {};
	return function() { return doAttribSet(this, options, true); }
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

function doAttribSet(bundle, options, bModify)
{
	var source = bundle.source;
	console.log('AttribSet '+source.cardDef.name);

	var subject = bundle.params.subject || bundle.params.target;
	if(!subject)
	{
		source.error('Subject or individual target not set!');
		return;
	}

	for(var name in options)
	{

		var str = _doSet(subject, name, options[name]);
		str = '<span class="roll">'+str+'</span>';

		if(subject === source)
		{
			source.log('Set own '+ name + ' to ' + source.attribs[name]);
			source.log(str);
		}
		else
		{
			source.log('Set '+ name + ' on ' + subject.cardDef.name + ' to ' + subject.attribs[name]);
			source.log(str);
			subject.log(name + ' set to ' + subject.attribs[name] + ' by ' + source.cardDef.name);
			subject.log(str);
		}
	}

	return true;

	function _doSet(card, name, value)
	{
		if(typeof value === 'function')
			value = value.call(bundle);

		var str = '';
		if(bModify)
		{
			card.attribs[name] += value;
			str = 'added ' + value;
		}
		else
		{
			card.attribs[name] = value;
			str = 'set to ' + value;
		}

		var was = card.attribs[name];

		card.clampAttribs(name);

		str = '(' + str + ')';

		if(was != card.attribs[name])
			str += ' (clamped)';

		return str;
	}

}

function doAttribMultiply(bundle, options, bModify, bUseBase)
{
	var source = bundle.source;
	console.log('AttribMultiply '+source.cardDef.name);

	var subject = bundle.params.subject || bundle.params.target;
	if(!subject)
	{
		source.error('Subject or individual target not set!');
		return;
	}

	for(var name in options)
	{
		var str = _doMul(subject, name, options[name]);
		str = '<span class="roll">'+str+'</span>';

		if(subject === source)
		{
			source.log('Changed own '+ name + ' to ' + source.attribs[name]);
			source.log(str);
		}
		else
		{
			source.log('Changed '+ name + ' on ' + subject.cardDef.name + ' to ' + subject.attribs[name]);
			source.log(str);
			subject.log(name + ' changed to ' + subject.attribs[name] + ' by ' + source.cardDef.name);
			subject.log(str);
		}
	}

	return true;

	function _doMul(card, name, value)
	{
		if(typeof value === 'function')
			value = value.call(bundle);

		var amt = 0;
		var str = '';
		if(bUseBase)
		{
			amt = (card.cardDef.attribs[name] * value) | 0;
			str = '' + ((value * 100) | 0) + '% of ' + card.cardDef.attribs[name];
		}
		else
		{
			amt = (card.attribs[name] * value) | 0;
			str = '' + ((value * 100) | 0) + '% of ' + value;
		}

		if(bModify)
		{
			card.attribs[name] += amt;
			str = 'added ' + str;
		}
		else
		{
			card.attribs[name] = amt;
			str = 'set to ' + str;
		}

		str = '(' + str + ')';

		var was = card.attribs[name];

		card.clampAttribs(name);

		if(was != card.attribs[name])
			str += ' (clamped)';

		return str;
	}

}


// End of File
