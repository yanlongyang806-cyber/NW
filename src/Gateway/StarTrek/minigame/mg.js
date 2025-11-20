'use strict';

var ActionBundle = require('./ActionBundle');
var ui = require('./mgUI');

/////////////////////////////////////////////////////////////////////////////

function startTurn(table)
{
	table.players.forEach(function(player) {
		player.cards.forEach(function(card) {
			card.cardDef.events.onStartTurn.forEach(function(fn) {
				fn(card);
			});
		});
	});

	table.players.forEach(function(player) {
		player.cards.forEach(function(card) {
			card.cardDef.events.onEachTargetUpkeep.forEach(function(fn) {
				fn(card);
			});
		});
	});

	startMyTurn(table.curPlayer, table);

	ui.updateTableau(table);
}

function startMyTurn(player)
{
	player.isCurrentPlayer = true;

	player.cards.forEach(function(card) {
		card.cardDef.events.onStartMyTurn.forEach(function(fn) {
			fn(card);
		});
	});
}

function endMyTurn(player)
{
	player.cards.forEach(function(card) {
		card.cardDef.events.onEndMyTurn.forEach(function(fn) {
			fn(card);
		});
	});

	player.isCurrentPlayer = false;
}

function endRound(table)
{
	endMyTurn(table.curPlayer);

	// Go to the next player
	if(table.players[0] === table.curPlayer)
	{
		table.curPlayer = table.players[1];
		table.curOpponent = table.players[0];

		startMyTurn(table.curPlayer);

		ui.updateTableau(table);
	}
	else
	{
		table.curPlayer = table.players[0];
		table.curOpponent = table.players[1];

		table.clearAnim();

		endTurn(table);

		table.playAnim(function() {
			table.clearAnim();
			startTurn(table);
		});
	}
}

function endTurn(table)
{
	var cards = [];
	table.players.forEach(function(player) {
		player.cards.forEach(function(card) {
			if(card.canExecuteAction())
				cards.push(card);
			else
				card.order = 'n/a';
		});
	});

	cards.sort(function(a, b) {
		return (b.attribs.speed - a.attribs.speed);
	});

	var order = 1;
	cards.forEach(function(card) {
		card.order = order++;
		card.logClear();
	});

	cards.forEach(function(card) {
		card.cardDef.events.onEndTurn.forEach(function(fn) {
			fn(card);
		});
	});

	cards.forEach(function(card) {
		card.cardDef.events.onResolve.forEach(function(fn) {
			fn(card);
		});
	});

	table.round++;
}

/////////////////////////////////////////////////////////////////////////////

function canExecute(action)
{
	var b = action.parentCard.canExecuteAction()
		&& action.cooldown <= 0
		&& action.parentCard.parentPlayer.isCurrentPlayer;

	if(b && action.actionDef.onChoose)
	{
		var bundle = new ActionBundle(action, { test: true });
		b = bundle.onChoose();
		if(!b)
		{
			action.noTargets = true;
		}
	}

	return b;
}


function queueAction(table, player, card, action)
{
	if(player.isCurrentPlayer)
	{
		if(card)
		{
			if(action && canExecute(action))
			{
				if(card.nextActionBundle)
					card.nextActionBundle.action.chosen = false;

				card.nextActionBundle = new ActionBundle(action);
				action.chosen = true;

				ui.updateTableau(table);

				card.nextActionBundle.onChoose();
			}
		}

		return true;
	}

	return false;
}


/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

module.exports.startTurn		= startTurn;
module.exports.startMyTurn		= startMyTurn;
module.exports.endMyTurn		= endMyTurn;
module.exports.endRound			= endRound;
module.exports.endTurn			= endTurn;
module.exports.canExecute		= canExecute;
module.exports.queueAction		= queueAction;


// End of File
