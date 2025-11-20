var dg = require('diceStartup');

dg.addQuest({
	id: 'q3',
	name: 'Dungeon on the Edge of Town (easy)',
	description: "A well-worn path leads to the dungeon entrance.",
	minDice: 3,
	tags: '',

	mapTags: 'short',
	tileSet: 'dungeon',
	encounterTags: 'easy',
	encounterEndTags: 'easy-end'
});

dg.addQuest({
	id: 'q4',
	name: 'Find the Woozle (not as easy)',
	description: "Woozles. Why did it have to be woozles?",
	minDice: 4,
	tags: '',

	mapTags: 'short',
	tileSet: 'dungeon',
	encounterTags: 'easy',
	encounterEndTags: 'easy-end'
});

