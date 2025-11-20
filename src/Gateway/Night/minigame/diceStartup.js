'use strict';


var Challenges = require('./Challenges');
var Maps = require('./Maps');
var Quests = require('./Quests');

var Pile = require('./Pile');
var Die = require('./Die');
var Companion = require('./Companion');
var QuestState = require('./QuestState');


var pile = null;
var dragTarget = null;
var encounter = null;
var quest = null;

var s_challenges = new Challenges();
var s_maps = new Maps();
var s_quests = new Quests();

var usedOne = false;

var gameStateDie = null;
var gameStateElem = null;

var k_ChooseQuest = 'state-choose-quest';
var k_ChooseParty = 'state-choose-party';
var k_ChooseEncounter = 'state-choose-encounter';
var k_ChoosePile = 'state-choose-pile';

var k_Roll = 'state-play-dice state-roll';
var k_ChooseDie = 'state-play-dice state-choose-die';
var k_TrashDie = 'state-play-dice state-trash-die';
var k_Success = 'state-play-dice state-success';
var k_End = 'state-play-dice state-end';

var allStates = [
		k_ChooseQuest, k_ChooseParty, k_ChoosePile, k_ChooseEncounter,
		k_Roll, k_ChooseDie, k_TrashDie, k_End, k_Success,
	].join(' ');

var gameState = k_ChooseQuest;

$(document).ready(function() {
	hookEvents();
	start();
});

function hookEvents()
{
	$(document).on('click', '.pile .face', clickPileDie);
	$(document).on('click', '.roll-button', clickRollButton);
	$(document).on('click', '[data-encounter-id]', clickEncounter);

	// -----------------------------------------------------------
	// For Tooltips
	//
	$(document).on('mouseenter', '[data-id]', function(event) {
		var d;
		if(pile)
		{
			d = pile.getDie(this.getAttribute('data-id'));
		}
		else
		{
			d = Die.getDie(this.getAttribute('data-id').slice(4));
		}

		if(d)
		{
			$('#tooltip').html(d.htmlInfo());
			$('#tooltip').css(tooltipPosition($(this)));
			$('#tooltip').show();
		}
	});

	$(document).on('mouseleave', '[data-id]', function(event) {
		tooltipHide();
	});

	$(document).on('mouseenter', '[data-encounter-id]', function(event) {
		var id = this.getAttribute('data-encounter-id');
		if(quest.encounters[id])
		{
			$('#tooltip').html(quest.encounters[id].htmlInfo());
			$('#tooltip').css(tooltipPosition($(this)));
			$('#tooltip').show();
		}
	});
	$(document).on('mouseleave', '[data-encounter-id]', function(event) {
		tooltipHide();
	});


}


var s_noClicks = false;
function clickPileDie(ev, elem)
{
	if(s_noClicks)
		return;

	console.log('clickPileDie ', gameState);
	var elem = elem || this;

	switch(gameState)
	{
		case k_ChooseDie:
			chooseDie(elem);
			break;

		case k_TrashDie:
			chooseTrashDie(elem);
			break;
	}
}

function clickRollButton(ev)
{
	if(s_noClicks)
		return;

	switch(gameState)
	{
		case k_ChooseDie:
			roll();
			break;

		case k_TrashDie:
			/* do nothing */
			break;
	}
}

function clickEncounter(ev)
{
	if(s_noClicks)
		return;

	switch(gameState)
	{
		case k_ChooseEncounter:
			chooseEncounter(this.getAttribute('data-encounter-id'));
			break;
	}
}

//////////////////////////////////////////////////////////////////////////

function setGameState(state)
{
	console.log('setGameState', state || 'none');
	gameState = state || gameState;

	$('.face').removeClass('selectable selected spin');
	$('.roll-button').addClass('disabled');

	$('body').removeClass(allStates).addClass(gameState);
}

//////////////////////////////////////////////////////////////////////////

function start()
{
	startChooseQuest();
}

//////////////////////////////////////////////////////////////////////////

function startChooseQuest()
{
	setGameState(k_ChooseQuest);

	var str = '<h1>Choose Quest</h1>';
	str += '<ul>';
	for(var id in s_quests.index)
	{
		str += '<li class="selectable" onclick="dg.chooseQuest(\'' + id + '\')">' + s_quests.index[id].name + '</li>';
	}
	$('#choose-list').html(str);
}

function chooseQuest(id)
{
	pile = null;
	setQuest(id);
	startChooseParty();
}

//////////////////////////////////////////////////////////////////////////

var s_partyHealth = 0;
var s_party = {};
function startChooseParty()
{
	setGameState(k_ChooseParty);

	s_party = {};
	s_piles = {};

	var str = '<h1>Choose Four Party Members</h1>';

	str += '<ul>';
	for(var id in s_companions)
	{
		str += '<li class="selectable" data-id="comp-'+id+'" onclick="dg.chooseCompanion(\'' + id + '\')">' + s_companions[id].htmlList() + '</li>';
	}
	str += '</ul>';

	$('#choose-list').html(str);
}

function chooseCompanion(id)
{
	var c = s_companions[id];
	if(s_party[c.id])
	{
		delete s_party[c.id];
		s_partyHealth -= c.partyHealth;
		$('[data-id=comp-'+id+']').removeClass('selected');
	}
	else
	{
		s_party[c.id] = c;
		s_partyHealth += c.partyHealth;
		$('[data-id=comp-'+id+']').addClass('selected');
	}

	if(Object.keys(s_party).length === 4)
	{
		s_piles = {};
		for(id in s_party)
		{
			s_piles[id] = s_party[id].pile;
		}
		startChooseEncounter();
	}
}

//////////////////////////////////////////////////////////////////////////

function startChooseEncounter()
{
	pile = null;
	setGameState(k_ChooseEncounter);

	$('#choose-list').html(quest.map.generateHTML(quest));
}

function chooseEncounter(id)
{
	var avail = quest.availableEncounters();
	if(id in avail)
	{
		encounter = quest.startEncounter(id);
		startChoosePile();
	}
}

//////////////////////////////////////////////////////////////////////////

function startChoosePile()
{
	setGameState(k_ChoosePile);

	var id;
	var allUsed = true;
	for(id in s_piles)
	{
		if(!s_piles[id].used)
		{
			allUsed = false;
			break;
		}
	}

	if(allUsed)
	{
		for(id in s_piles)
			s_piles[id].reset();
	}


	var str = '<h1>Choose Party Member</h1>';
	str += '<div class="health"><img src="./img/health.png"><span class="health-value">'+s_partyHealth+'</span></div>';
	str += '<h4>for ' + encounter.challenge.htmlInfo() + '</h4>';
	str += '<button onclick="dg.startChooseEncounter()">Choose a different encounter</button>';

	str += '<ul>';
	for(id in s_party)
	{
		var c = s_party[id];
		if(!s_piles[c.id].used)
			str += '<li class="selectable" data-id="comp-'+id+'" onclick="dg.choosePile(\'' + id + '\')">' + c.htmlList() + '</li>';
		else
			str += '<li class="disabled">' + c.htmlList() + '</li>';
	}
	str += '</ul>';

	$('#choose-list').html(str);
}

function choosePile(id)
{
	var c = s_companions[id];

	setPile(c.id);
	pile.reset();
	pile.used = true;

	roll();
}

//////////////////////////////////////////////////////////////////////////

function roll()
{
	setGameState(k_Roll);
	pile.roll();

	usedOne = false;
	redraw();
	$('.pile .face:not(.used)').addClass('spin');
	setTimeout(startChooseDie, 1000);
}

//////////////////////////////////////////////////////////////////////////

function startChooseDie()
{
	console.log('startChooseDie');

	gameStateDie = null;
	gameStateElem = null;

	setGameState(k_ChooseDie);

	var haveOne = false;
	for(var i = 0; i < pile.dice.length; i++)
	{
		if(encounter.challenge.isUsable(pile.dice[i]))
		{
			haveOne = true;
			var id = 'die-'+pile.dice[i].id;
			$('[data-id='+id+']').addClass('selectable');
		}
	}

	if(usedOne)
		$('.roll-button').removeClass('disabled');

	if(!haveOne)
	{
		if(usedOne)
		{
			roll();
		}
		else
		{
			// Handle discard
			setGameState(k_TrashDie);
			$('.pile .face:not(.used)').addClass('selectable destroy');
		}
	}
}

function chooseDie(elem)
{
	console.log('chooseDie');

	gameStateDie = pile.getDie($(elem).attr('data-id'));
	gameStateElem = elem

	if(encounter.challenge.isUsable(gameStateDie) && (gameStateDie.roll.side.wild || gameStateDie.roll.side.parent))
	{
		$('#choose-wild-dice').html(gameStateDie.roll.side.wildHtml(encounter.challenge));
		$('#choose-wild').show();
	}
	else
	{
		useDie();
	}
}

function chooseTrashDie(elem)
{
	console.log('chooseTrashDie');

	gameStateDie = pile.getDie($(elem).attr('data-id'));
	gameStateElem = elem;
	useDie(true);
}

function useDie(trashDie)
{
	var trialComplete = false;
	if(trashDie)
	{
		gameStateDie.use();
	}
	else
	{
		if(!encounter.challenge.isUsable(gameStateDie))
		{
			startChooseDie();
			return;
		}

		usedOne = true;
		trialComplete = encounter.challenge.assign(gameStateDie);
	}

	$(gameStateElem).addClass('removed');

	s_noClicks = true;
	setTimeout(function() {
		var curState = gameState;
		redraw();

		if(gameState === curState)
		{
			if(trashDie || (trialComplete && !encounter.isComplete()))
			{
				roll();
			}
			else
			{
				gameStateDie = null;
				gameStateElem = null;
				startChooseDie();
			}
		}
		s_noClicks = false;
	}, 500);
}

function clickWild(idx)
{
	$('#choose-wild').hide();

	gameStateDie.roll.side = gameStateDie.roll.side.getWildSide(idx);

	redraw();

	gameStateElem = $('[data-id=die-'+gameStateDie.id+']');
	$(gameStateElem).addClass('selected');

	useDie();
}

//////////////////////////////////////////////////////////////////////////

function redraw()
{
	tooltipHide();

	if(encounter.isComplete())
	{
		$('#end').html('<span class="success">SUCCESS!<br>You earn: '+encounter.challenge.reward+'!</span>');
		quest.rewards.push(encounter.challenge.reward);
		setGameState(k_Success);
	}
	else if(pile.allUsed())
	{
		s_partyHealth--;
		encounter.challenge.reset();
		$('#end').html('<span class="success">Failure. Party loses 1 health! Current health now '+s_partyHealth+'</span>');
		if(s_partyHealth > 0)
			setGameState(k_Success);
		else
			setGameState(k_End);
	}

	var str = '<div class="health"><img src="./img/health.png"><span class="health-value">'+s_partyHealth+'</span></div>';
	$('#challenge').html(str + encounter.challenge.html());
	$('#pile').html(pile.html());

	if(quest.isComplete())
	{
		$('#end').html('<span>QUEST COMPLETE!</span><br>You haul back: ' + quest.rewards.join(', '));
		setGameState(k_End);
	}

	$('#pile-info').html(pile.htmlInfo());
	$('#challenge-info').html(encounter.challenge.htmlInfo());
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

// ----------------------------------------------------------------------------
// Tooltip stuff
// ----------------------------------------------------------------------------


// Make sure the tooltip is on the side of the item nearest the middle of the browser window.
// This prvents tooltips being drawn that could extend off screen
function tooltipPosition(jqElem)
{

	var pos = jqElem.offset();
	var height = $(window).height();
	var width = $(window).width();

	var ret = {top:'',left:'',bottom:'',right:''};

	// Horizontal padding to space the tooltip away from the element
	var h_pad = 5;
	var v_pad = 5;

	ret['top'] = pos.top + jqElem.outerHeight() + v_pad;
	ret['left'] = pos.left + h_pad;

	return ret;
}

function tooltipHide() {
	$('#tooltip').hide();
	$('#tooltip').css({top:'',left:'',bottom:'',right:''});
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////


var s_piles = {};
function addPile(id, def)
{
	s_piles[id] = new Pile(id, def);
}

function setPile(p)
{
	pile = s_piles[p];
	pile.reset();
}

function addQuest(def)
{
	s_quests.add(def);
}

function setQuest(id)
{
	quest = new QuestState(s_quests.get(id), s_maps);
	quest.populateEncounters(s_challenges);
}

function addMap(def)
{
	s_maps.add(def);
}

function addChallenge(def)
{
	s_challenges.add(def);
}

function addSimpleChallenge(tags, defstr)
{
	s_challenges.add({ tags: tags, def: defstr });
}


function restartQuest()
{
	$('#end').html('');

	quest = null;
	for(var id in s_piles)
		s_piles[id].reset();

	start();
}

var s_companions = {};
function addCompanion(def)
{
	var c = new Companion(def);
	if(c && c.id)
		s_companions[c.id] = c;
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

module.exports.roll = roll;
module.exports.setPile = setPile;
module.exports.addPile = addPile;
module.exports.addChallenge = addChallenge;
module.exports.addSimpleChallenge = addSimpleChallenge;
module.exports.addCompanion = addCompanion;
module.exports.addMap = addMap;
module.exports.clickWild = clickWild;
module.exports.chooseEncounter = chooseEncounter;
module.exports.choosePile = choosePile;
module.exports.chooseCompanion = chooseCompanion;
module.exports.chooseQuest = chooseQuest;
module.exports.setQuest = setQuest;
module.exports.addQuest = addQuest;
module.exports.restartQuest = restartQuest;
module.exports.startChooseEncounter = startChooseEncounter;

// End of File
