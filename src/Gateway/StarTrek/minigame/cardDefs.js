"use strict";

var CardDef = require('./CardDef');

// The raw data from CardMaker.
var cardList = require('./cardList.js');

var cardDefs = {};

// parse a card list into actual card defs
function parseCardList(cardlist)
{
	for(var card in cardlist)
	{
		cardDefs[card] = new CardDef.createFromData(cardlist[card]);
	}

	return cardDefs;
}

parseCardList(cardList);

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

module.exports = cardDefs;

///////////////////////////////////////////////////////////////////////////

// End of File
