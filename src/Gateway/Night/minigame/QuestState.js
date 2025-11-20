'use strict';

var utils = require('./utils');
var Encounter = require('./Encounter');
var template = require('./template');

function QuestState(quest, maps)
{
	this.quest = quest;

	this.map = null;
	this.encounters = {};
	this.usedChallenges = {};

	this.end = null;
	this.rewards = [];

	if(maps instanceof Map)
	{
		this.map = maps;
	}
	else
	{
		this.map = maps.choose(this.quest.mapTags);
	}

	for(var id in this.map.encounters)
	{
		this.encounters[id] = new Encounter(this.map.encounters[id]);

		if(this.map.encounters[id].end)
			this.end = id;
	}
}

QuestState.prototype.populateEncounters = function(challenges)
{
	for(var id in this.encounters)
	{
		var e = this.encounters[id];
		e.setChallenge(challenges.choose(this.quest.encounterTags + ' ' + e.taglist, this.usedChallenges));
		this.usedChallenges[e.challenge.id] = true;
	}
}

QuestState.prototype.startEncounter = function(id)
{
	var e = this.encounters[id];
	e.challenge.reset();
	return e;
}

QuestState.prototype.isComplete = function()
{
	var e = this.encounters[this.end];
	return (e && e.challenge && e.challenge.isComplete());
}

QuestState.prototype.availableEncounters = function()
{
	var rooms = this.map.roomsVisible(this);

	var avail = {};
	for(var id in this.encounters)
	{
		var e = this.encounters[id];
		if(e)
		{
			if(e.color in rooms)
			{
				avail[id] = e;
			}
		}
	}

	return avail;
}

QuestState.prototype.html = function()
{
	var encounters = this.availableEncounters();
	var str = template('tmpl-quest', this);
	str += '<ul>';
	for(var id in encounters)
		str += encounters[id].html();
	str += '</ul>';

	return str;
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

if(module && module.exports)
	module.exports = QuestState;

///////////////////////////////////////////////////////////////////////////


// End of File
