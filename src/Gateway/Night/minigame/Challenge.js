'use strict';

var template = require('./template');
var Trial = require('./Trial');
var utils = require('./utils');

var reSplit = /\s*\+\s*/g;
var reTrim = /^\s+|\s+$/g;
function Challenge(options)
{
	utils.extend(this, options);

	// Expected fields (* are required):
	//		id*
	//		name*
	//		description*
	//		tags*
	//		def*
	//		reward
	//		onStart
	//		onSuccess
	//		onFailure

	if(!Array.isArray(this.tags))
		this.tags = this.tags.split(/\s+/);

	if(!this.trials)
	{
		this.def = options.def.replace(reTrim, '').split(reSplit);

		this.trials = [];

		for(var i = 0; i < this.def.length; i++)
		{
			this.trials.push(new Trial(this.def[i]));
		}
	}

	this.currentTrial = 0;
	this.used = false;
}

Challenge.prototype.reset = function()
{
	this.currentTrial = 0;
	this.used = false;
	for(var i = 0; i < this.trials.length; i++)
	{
		this.trials[i].reset();
	}
}

Challenge.prototype.htmlInfo = function()
{
	var str = this.name || 'Challenge';

	str += ': ';

	for(var i = 0; i < this.trials.length; i++)
	{
		if(i > 0) str += ' + ';
		str += this.trials[i].htmlInfo();
	}

	return str;
}

Challenge.prototype.list = function()
{
	console.log(this.htmlInfo());
}

Challenge.prototype.html = function()
{
	var str = '<span class="challenge">' + template('tmpl-challenge', this);

	for(var i = 0; i < this.trials.length; i++)
	{
		str += '<span class="trial ';
		str += i < this.currentTrial ? 'complete' : (i === this.currentTrial ? 'current' : 'future');
		str += '">';
		str += this.trials[i].html();
		str += '</span>';
	}
	str += '</span>';

	return str;
}

Challenge.prototype.assign = function(die)
{
	var trial = this.trials[this.currentTrial];
	trial.assign(die);
	if(trial.isComplete())
	{
		this.currentTrial++;
		return true;
	}

	return false;
}

Challenge.prototype.isUsable = function(die)
{
	var trial = this.trials[this.currentTrial];
	return !die.used && trial.isSideUsable(die.roll.side);
}

Challenge.prototype.isSideUsable = function(side)
{
	var trial = this.trials[this.currentTrial];
	return trial.isSideUsable(side);
}

Challenge.prototype.isComplete = function()
{
	return this.currentTrial >= this.trials.length;
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

if(module && module.exports)
	module.exports = Challenge;

///////////////////////////////////////////////////////////////////////////


// End of File
