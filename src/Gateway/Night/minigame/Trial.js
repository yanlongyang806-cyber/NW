'use strict';

var template = require('./template');

var reSplit = /[,\s]/g;
var reTrim = /^\s+|\s+$/g;
var reParse = /(\d*)(\w+)/;
function Trial(def)
{
	this.def = def.replace(reTrim, '').split(reSplit);
	this.needs = {};

	var self = this;
	this.def.forEach(function(need) {
		var res = reParse.exec(need);
		if(!res || !res[2])
		{
			console.error('Unknown Trial def:' + need);
			return;
		}

		var c = +res[1] || 1;

		if(self.needs[res[2]])
		{
			self.needs[res[2]].count += c;
		}
		else
		{
			self.needs[res[2]] = { symbol: res[2], count: c, requires: c, assigned: 0, dice: [] };
		}
	});
}

Trial.prototype.reset = function()
{
	for(var sym in this.needs)
	{
		var c = this.needs[sym].count;
		this.needs[sym] = { symbol: sym, count: c, requires: c, assigned: 0, dice: [] };
	}
}

Trial.prototype.htmlInfo = function()
{
//	var str = 'Trial: ';
	var str = '';
	var syms = Object.keys(this.needs).sort();

	var self = this;
	syms.forEach(function(symbol) {
		str += (self.needs[symbol].count > 1 ? self.needs[symbol].count : '') + self.needs[symbol].symbol;
		str += ' '
	});

	return str;
}

Trial.prototype.list = function()
{
	console.log(this.htmlInfo());
}

Trial.prototype.html = function()
{
	var syms = Object.keys(this.needs).sort();

	var str = '';
	var self = this;
	syms.forEach(function(symbol) {
		str += template('tmpl-trial', self.needs[symbol]);
	});

	return str;
}

Trial.prototype.assign = function(die)
{
	var side = die.roll.side;
	for(var i = 0; i < side.vals.length; i++)
	{
		var need = this.needs[side.vals[i].sym];
		if(need && need.requires > 0)
		{
			need.requires -= side.vals[i].count;
			if(need.requires < 0)
				need.requires = 0;

			need.assigned += side.vals[i].count;
			need.dice.push(die);
			die.use();
		}
	}
}

Trial.prototype.isSideUsable = function(side)
{
	for(var i = 0; i < side.vals.length; i++)
	{
		var need = this.needs[side.vals[i].sym];
		if(need && need.requires > 0)
		{
			return true;
		}
	}

	return false;
}

Trial.prototype.isComplete = function()
{
	for(var sym in this.needs)
	{
		if(this.needs[sym].requires > 0)
			return false;
	}

	return true;
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

if(module && module.exports)
	module.exports = Trial;

///////////////////////////////////////////////////////////////////////////


// End of File
