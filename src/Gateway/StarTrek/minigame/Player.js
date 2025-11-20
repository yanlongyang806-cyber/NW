'use strict';

var Card = require('./Card');

/////////////////////////////////////////////////////////////////////////////

function Player(id, parentTable, p)
{
	this.id = id;
	this.parentTable = parentTable;
	this.name = p.name;
	this.isCurrentPlayer = false;
	this.curTarget = null;

	this.canUseActions = false;
	this.hasActionsToUse = false;

	this.cards = [];
	var self = this;
	p.cards.forEach(function(cardDef) {
		self.cards.push(new Card('c'+Player.s_id++, self, cardDef));
	});
}

Player.s_id = 0;

Player.prototype.getCardForId = function(id)
{
	for(var i = 0; i < this.cards.length; i++)
	{
		if(this.cards[i].id === id)
			return this.cards[i];
	}
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

module.exports = Player;

//////////////////////////////////////////////////////////////////////////

// End of File
