'use strict';

var utils = require('./utils');
var template = require('./template');

var Challenge = require('./Challenge');

function Encounter(options)
{
	utils.extend(this, options);

	// Expected fields (* are required):
	//		id*
	//		tags*
	//		icon
	//		complete
	//		onStart
	//		onSuccess
	//		onFailure

	if(!Array.isArray(this.tags))
		this.tags = this.tags.split(/\s+/);

	this.taglist = this.tags.join(' ');

	this.complete = false;
	this.challenge = null;
}

Encounter.prototype.setChallenge = function(challenge)
{
	this.challenge = new Challenge(challenge);
	this.reset();
}

Encounter.prototype.reset = function()
{
	if(this.challenge)
		this.challenge.reset();

	this.complete = false;
}

Encounter.prototype.isComplete = function()
{
	this.complete = this.complete || (this.challenge ? this.challenge.isComplete() : false);
	return this.complete;
}

Encounter.prototype.html = function()
{
	return template(this.isComplete() ? 'tmpl-encounter-complete' : 'tmpl-encounter', this);
}

Encounter.prototype.htmlInfo = function()
{
	return this.challenge ? this.challenge.htmlInfo() : '???';
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

if(module && module.exports)
	module.exports = Encounter;

///////////////////////////////////////////////////////////////////////////


// End of File
