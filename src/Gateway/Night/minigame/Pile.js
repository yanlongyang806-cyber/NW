'use strict';

var Die = require('./Die');

function Pile(name, pile)
{
	this.name = name;
	this.dice = [];
	this.used = false;

	this.addDiceToPile(pile);
}

Pile.prototype.addDiceToPile = function(arg)
{
	if(typeof arg === 'string')
	{
		var a = arg.split(/\s+/);
		for(var i = 0; i < a.length; i++)
		{
			var res = /(\d*)(.*)/.exec(a[i]);
			if(res)
			{
				var count = +res[1] || 1
				while(count > 0)
				{
					this.dice.push(Die.cloneDie(res[2], this.dice.length));
					count--;
				}
			}
		}
	}
	else
	{
		console.error('Unknown die type:' + arg);
	}
}


Pile.prototype.addDieToPile = function(arg)
{
	if(typeof arg === 'string')
	{
		// 2d6
		var res = /(\d*)d(\d+)/.exec(arg);
		if(res)
		{
			var count = 1;
			if(res[1])
				count = +res[1];
			while(count > 0)
			{
				this.dice.push(new Die(+res[2], this.dice.length));
				count--;
			}
		}
		else
		{
			// Assume this is a string of sides
			this.dice.push(new Die(arg, this.dice.length));
		}
	}
	else if(typeof arg === 'number')
	{
		this.dice.push(new Die(arg, this.dice.length));
	}
	else if(arg instanceof Die)
	{
		this.dice.push(arg, this.dice.length);
	}
	else
	{
		console.error('Unknown die type:' + arg);
	}
}

Pile.prototype.list = function()
{
	console.log('Pile:')
	this.dice.forEach(function(die) {
		die.list();
	});
}

Pile.prototype.htmlInfo = function()
{
	var str = '<ul class="pile-info">';
	this.dice.forEach(function(die) {
		str += '<li class="die">'
			+ die.htmlInfo()
			+ '</li>';
	});
	str += '</ul>';

	return str;
}

Pile.prototype.html = function()
{
	var str = '<ul class="pile">';
	this.dice.forEach(function(die) {
		str += '<li class="die'
			+ (die.used ? ' used' : '')
			+ '">'
			+ die.html()
			+ '</li>';
	});
	str += '</ul>';

	return str;
}

Pile.prototype.htmlList = function()
{
	var str = '<ul class="pile">';
	this.dice.forEach(function(die) {
		str += '<li class="die'
			+ (die.used ? ' used' : '')
			+ '">'
			+ die.htmlList()
			+ '</li>';
	});
	str += '</ul>';

	return str;
}

Pile.prototype.roll = function()
{
	var result = [];
	this.dice.forEach(function(die) {
		result.push({ die: die, roll: die.rollDie() });
	});

	return result;
}

Pile.prototype.rollSum = function()
{
	var result = 0;
	var a = this.roll();

	a.forEach(function(die) {
		result += +die.roll.side.sym;
	});

	return result;
}

Pile.prototype.getDie = function(id)
{
	// 'die-xxx'
	return this.dice[+id.slice(4)];
}

Pile.prototype.reset = function()
{
	this.unuseDice();
	this.used = false;
}

Pile.prototype.unuseDice = function()
{
	this.dice.forEach(function(die) {
		die.unuse();
	});
}

Pile.prototype.allUsed = function()
{
	var r = true;
	this.dice.forEach(function(die) {
		if(!die.used)
			r = false;
	});

	return r;
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

if(module && module.exports)
	module.exports = Pile;

///////////////////////////////////////////////////////////////////////////

// End of File
