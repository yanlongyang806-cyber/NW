'use strict';

var utils = require('./utils');
var eventPrimitives = require('./eventPrimitives');

/////////////////////////////////////////////////////////////////////////////

function CardDef(cardDef1, cardDef2)
{
	var defaultShip = {
		name: 'Ship',
		icon: 'icon',

		attribs: CardDef.prototype.defaultAttribs,
		attribsMin: CardDef.prototype.defaultAttribsMin,
		attribsMax: CardDef.prototype.defaultAttribsMax,

		actions: []
	};

	utils.deepExtend(this, defaultShip, cardDef1, cardDef2);
}

CardDef.prototype.attribResetInfo = {
	cooldown:				{},
	speed:					{ copy: true },

	hitpoints:				{ copy: false, max: 'base' },
	shield:					{ copy: false, max: 'base' },

	shieldBleed:			{ copy: true },

	attackMin:				{ copy: true },
	attackMax:				{ copy: true },

	attackBonusPercent:		{ copy: true },
	attackBonusAmount:		{ copy: true },

	attackReflection:		{ copy: true },
	attackReduction:		{ copy: true },

	accuracyRating:			{ copy: true },
	evasionRating:			{ copy: true },

	criticalMult:			{ copy: true }
};

CardDef.prototype.defaultAttribs = {};
for(var aname in CardDef.prototype.attribResetInfo)
{
	CardDef.prototype.defaultAttribs[aname] = 0;
}

CardDef.prototype.defaultAttribsMax = {
	speed: 999999,

	shieldBleed: 1.0,

	// hitpoints: 0, // unused
	// shield: 0, // unused

	attackMin: 999999,
	attackMax: 999999,

	attackBonusPercent: 50.0,
	attackBonusAmount: 999999,

	attackReflection: 50.0,
	attackReduction: 1.0,

	accuracyRating: 999999,
	evasionRating: 999999,

	criticalMult: 50.0,
};

CardDef.prototype.defaultAttribsMin = {
	speed: 0,

	shieldBleed: 0.0,

	hitpoints: 0,
	shield: 0,

	attackMin: 0,
	attackMax: 0,

	attackBonusPercent: 0.0,
	attackBonusAmount: 0,

	attackReflection: 0.0,
	attackReduction: 0.0,

	accuracyRating: 1,
	evasionRating: 1,

	criticalMult: 1.0,
};

/* global eventPrimitives */

CardDef.prototype.events = {
	onStartTurn: [ eventPrimitives.attribReset, eventPrimitives.resetStates, eventPrimitives.doCooldowns, eventPrimitives.resetActions, eventPrimitives.resetNoTargets ],
	onEachTargetUpkeep: [ eventPrimitives.upkeepActions ],
	onStartMyTurn: [],
	onEndMyTurn: [ eventPrimitives.actionsQueued ],
	onEndTurn: [ eventPrimitives.onOrders ],
	onResolve:  [ eventPrimitives.eachTargetResolveActions, eventPrimitives.resolveActions ],
};

//////////////////////////////////////////////////////////////////////////

CardDef.createFromData = function(cardData)
{
	var actions = require('./actions');

	if(!cardData.name)
		return undefined;

	var def = new CardDef({ name: cardData.name });

	for(var field in cardData)
	{
		if(field === 'attribs')
		{
			for(var name in cardData.attribs)
			{
				def.attribs[name] = +cardData.attribs[name];
			}
		}
		else if(field === 'actions')
		{
			var a;
			for(var x = 0; x < cardData.actions.length; x++)
			{
				a = cardData.actions[x].split('.');
				a[0] = a[0].toLowerCase();
				if(!actions[a[0]] || !actions[a[0]].actions[a[1]])
				{
					console.error('Action '+cardData.actions[x]+" doesn't exist");
				}

				def.actions.push(actions[a[0]][a[1]]);
			}
		}
		else
		{
			// if it's a numeric, return a number. Otherwise, return the string
			def[field] = isNaN(cardData[field]) ? cardData[field] : +cardData[field];
		}
	}

	return def;
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

module.exports = CardDef;

//////////////////////////////////////////////////////////////////////////

// End of File
