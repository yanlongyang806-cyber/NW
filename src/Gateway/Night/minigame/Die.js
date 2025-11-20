'use strict';

var randomInt = require('./randomInt');
var template = require('./template');
var utils = require('./utils');

var Side = require('./Side');

var s_dice = {};


var re = /[,\s]/;
var reTrim = /^\s+|\s+$/g;
function Die(sidesDef, id)
{
	var sides;

	if(typeof sidesDef === 'object')
	{
		// Expected fields
		//		name
		//		def*
		//		color
		utils.extend(this, sidesDef);
		sidesDef = this.def;
	}
	else
	{
		this.def = sidesDef;
	}

	this.id = id;

	if(!this.sides)
	{
		if(typeof sidesDef === 'string')
		{
			if(re.test(sidesDef))
			{
				// 'a b c dx ex'
				// 'a, b, c, dx, ex'
				// 5 sidesDef, each side separated by spaces and/or commas
				sides = sidesDef.replace(reTrim,'').split(re);
			}
			else
			{
				// 'abcdef'
				// 5 sidesDef, each side is the symbol of the given character
				sides = sidesDef.split('');
			}
		}
		else
		{
			sides = [];
			console.error("Can't make a die out of "+sidesDef);
		}

		this.sides = [];
		for(var i = 0; i < sides.length; i++)
			this.sides.push(new Side(sides[i]));
	}

	this.count = this.sides.length;
	this.used = false;
	this.roll = {
		side: null,
		index: 0
	};
	this.color = this.color || 'base';

	if(this.name && !s_dice[this.name])
		s_dice[this.name] = this;
}

Die.getDie = function(name)
{
	return s_dice[name];
}

Die.cloneDie = function(name, id)
{
	var d = s_dice[name];
	if(!d)
	{
		console.error('Unknown die: ' + name);
		return undefined;
	}

	return new Die(d, id);
}

Die.prototype.rollDie = function()
{
	var result = [];
	var r = this.roll;

	if(!this.used)
	{
		r.index = randomInt(0, this.count-1);
		r.side = this.sides[r.index].getSide();
	}

	return r;
}

Die.prototype.use = function()
{
	this.used = true;
}

Die.prototype.unuse = function()
{
	this.used = false;
}

Die.prototype.list = function()
{
	console.log('\t ' + this.htmlInfo());
}

Die.prototype.htmlInfo = function()
{
	var str = '';
	for(var i = 0; i < this.sides.length; i++)
	{
		str += '<span class="side">' + this.sides[i].toString() + '</span>';
	}

	return str;
}

Die.prototype.html = function()
{
	return template('tmpl-die', this);
}

Die.prototype.htmlList = function()
{
	return template('tmpl-dielist', this);
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

if(module && module.exports)
	module.exports = Die;

///////////////////////////////////////////////////////////////////////////

// End of File
