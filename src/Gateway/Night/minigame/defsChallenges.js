var dg = require('diceStartup');

// easy challenges 3d/end room 3d ordered
dg.addChallenge({
	id: 'ec1',
	name: "Wandering Kobolds",
	description: "They don't pose much of a threat.",
	tags: 'easy dungeon kobold combat',
	def: '7c',
	reward: 'Kobold Ears'
});
dg.addChallenge({
	id: 'ec2',
	name: "Kobold Hurler",
	description: "The kobolds have formed ranks!",
	tags: 'easy dungeon kobold combat thievery perception',
	def: 'p t 2c',
	reward: 'Kobold Banner'
});
dg.addChallenge({
	id: 'ec3',
	name: "Avoid Simple Spike Trap",
	description: "If you can time this just right...",
	tags: 'easy dungeon trap perception thievery',
	def: '2p t',
	reward: 'Skeletal Remains'
});
dg.addChallenge({
	id: 'ec4',
	name: "Disarm Simple Spike Trap",
	description: "A beginner built this trap.",
	tags: 'easy dungeon trap thievery',
	def: '3t',
	reward: 'Pile of Coins'
});
dg.addChallenge({
	id: 'ec5',
	name: "Disenchant Simple Spike Trap",
	description: "A single magical rune was added to this trap.",
	tags: 'easy dungeon trap magic thievery',
	def: '2m t',
	reward: 'Bag of Gems'
});
dg.addChallenge({
	id: 'ec6',
	name: "Open Wooden Chest",
	description: "You find an unguarded, wooden chest.",
	tags: 'easy dungeon treasure perception thievery',
	def: 'p 2t',
	reward: 'Unidentified Boots'
});
dg.addChallenge({
	id: 'ec7',
	name: "Bash Wooden Chest",
	description: "Who needs a key when you have brute strength?",
	tags: 'easy dungeon treasure combat perception',
	def: 'p 4c',
	reward: 'Small Shield'
});
dg.addChallenge({
	id: 'ec8',
	name: "Lockpick Wooden Chest",
	description: "Any rogue worth his salt should be able to pick this lock.",
	tags: 'easy dungeon treasure thievery',
	def: 't + 2t',
	reward: 'Jagged Dagger'
});
dg.addChallenge({
	id: 'ec9',
	name: "Disenchant Wooden Chest",
	description: "A single magical rune was added to this trap.",
	tags: 'easy dungeon treasure magic thievery',
	def: 'm 2t',
	reward: 'Small Ring'
});
dg.addChallenge({
	id: 'ec10',
	name: "Search Goblin Corpse",
	description: "Someone got to this goblin before you did.",
	tags: 'easy dungeon scenario perception thievery',
	def: 'p t + t',
	reward: 'Rusty Short Sword'
});
dg.addChallenge({
	id: 'ec11',
	name: "Wishing Well",
	description: "The coin falls for a long time before you hear a splash.",
	tags: 'easy dungeon scenario perception magic thievery',
	def: 'm p t',
	reward: '+1 Health'
});
dg.addChallenge({
	id: 'ec12',
	name: "Light a Torch",
	description: "Sometimes it helps to see where you're going, and sometimes it's more fun to be surprised.",
	tags: 'easy dungeon scenario perception combat',
	def: 'p + 6c',
	reward: 'Goblin Nose Ring'
});
dg.addChallenge({
	id: 'ec13',
	name: "Examine Crude Markings",
	description: "You find a series of symbols written in blood.",
	tags: 'easy dungeon scenario magic perception',
	def: 'm p + m',
	reward: 'Magic Scroll'
});
dg.addChallenge({
	id: 'ec14',
	name: "Rescue Trapped Peasant",
	description: "A single magical rune was added to this trap.",
	tags: 'easy dungeon scenario thievery combat',
	def: 't 5c',
	reward: 'Bonus XP'
});
dg.addChallenge({
	id: 'ec15',
	name: "Pray at Clay Shrine",
	description: "You probably don't need to say every single syllable.",
	tags: 'easy dungeon scenario magic combat',
	def: 'm 6c',
	reward: 'Invoke Credit'
});
dg.addChallenge({
	id: 'ec16',
	name: "Steal Crude Idol",
	description: "Maybe you can replace it with something of equal weight.",
	tags: 'easy dungeon scenario magic thievery',
	def: 't + m t',
	reward: 'Crude Idol'
});
dg.addChallenge({
	id: 'ec17',
	name: "Wake Sleeping Wizard",
	description: "The long beard suggests an advanced age.",
	tags: 'easy dungeon scenario magic perception combat',
	def: 'm p 3c',
	reward: 'Magic Cloth'
});
dg.addChallenge({
	id: 'ec18',
	name: "Assist Treasure Hunter",
	description: "She promises you a cut of the loot.",
	tags: 'easy dungeon scenario perception thievery combat',
	def: 'p t + 3c',
	reward: 'Bag of Gold'
});
dg.addChallenge({
	id: 'ec19',
	name: "Preliminary Dwarven Drinking Contest",
	description: "The dwarf with the gold-braided beard never seems to get drunk...",
	tags: 'easy dungeon scenario magic thievery combat',
	def: 'm + t 3c',
	reward: 'Enchanted Mug'
});
dg.addChallenge({
	id: 'ec20',
	name: "Pilfered Treasure Room",
	description: "The most valuable items have been claimed already.",
	tags: 'easy-end dungeon perception combat',
	def: '3c + p 2c',
	reward: 'Golden Crown'
});
dg.addChallenge({
	id: 'ec21',
	name: "Ransacked Treasure Room",
	description: "A few items of value still remain.",
	tags: 'easy-end dungeon thievery combat',
	def: 't 2c + 3c',
	reward: 'Golden Scepter'
});
dg.addChallenge({
	id: 'ec22',
	name: "Meager Treasure Room",
	description: "You see someone else leave with what might be the last of the treasure.",
	tags: 'easy-end dungeon perception combat',
	def: '3c + m 2c',
	reward: 'Royal Cloak'
});

// medium challenges 4-5d/end room 5d ordered
dg.addChallenge({
	id: 'mc1',
	name: "Orc Guards",
	description: "They keep a few goblins on chains just to torment.",
	tags: 'medium dungeon orc combat perception',
	def: '2p 6c',
	reward: 'Orc Helmet'
});
dg.addChallenge({
	id: 'mc2',
	name: "River Troll",
	description: "Hopefully you remebered your oil flask.",
	tags: 'medium dungeon troll combat perception',
	def: '2p 3c + 3c',
	reward: "Sack of Troll Ash"
});
dg.addChallenge({
	id: 'mc3',
	name: "Avoid Spike Trap",
	description: "This standard spike trap should be easy enough to dodge.",
	tags: 'medium dungeon trap perception thievery',
	def: '2p t + t',
	reward: 'Bonus XP'
});
dg.addChallenge({
	id: 'mc4',
	name: "Disarm Spike Trap",
	description: "The addition of poison makes this trap especially tricky.",
	tags: 'medium dungeon trap thievery combat',
	def: '4t 2c',
	reward: 'Spike Trap'
});
dg.addChallenge({
	id: 'mc5',
	name: "Disenchant Spike Trap",
	description: "A few magical runes adorn the stones around this obvious trap.",
	tags: 'medium dungeon trap magic perception thievery',
	def: 't p + t m',
	reward: 'Mysterious Scroll'
});
dg.addChallenge({
	id: 'mc6',
	name: "Open Reinforced Chest",
	description: "The chest is reinforced but unlocked...",
	tags: 'medium dungeon treasure perception combat thievery',
	def: 'p 3t 3c',
	reward: 'Medium Bag of Gold'
});
dg.addChallenge({
	id: 'mc7',
	name: "Bash Reinforced Chest",
	description: "You flex and crack your neck before lining up your shot.",
	tags: 'medium dungeon treasure combat perception',
	def: 'p 11c',
	reward: 'Large Shield'
});
dg.addChallenge({
	id: 'mc8',
	name: "Lockpick Reinforced Chest",
	description: "A well-locked chest is no match for you.",
	tags: 'medium dungeon treasure perception thievery',
	def: '2p 3t',
	reward: 'Silver Jagged Dagger'
});
dg.addChallenge({
	id: 'mc9',
	name: "Disenchant Reinforced Chest",
	description: "Reinforced and magically trapped? Impressive.",
	tags: 'medium dungeon treasure magic combat thievery',
	def: 'm + t + m t',
	reward: 'Golden Ring'
});
dg.addChallenge({
	id: 'mc10',
	name: "Search Orc Corpse",
	description: "Is it possible they smell worse alive than dead?",
	tags: 'medium dungeon scenario perception thievery magic',
	def: 'm 2p + t',
	reward: '2-handed Axe +1'
});
dg.addChallenge({
	id: 'mc11',
	name: "Sparkling Wishing Well",
	description: "Strange lights dance at the top of the water.",
	tags: 'medium dungeon scenario perception magic thievery combat',
	def: 'm t + p 2c',
	reward: '+2 Health'
});
dg.addChallenge({
	id: 'mc12',
	name: "Leave Torch Trail",
	description: "One by one you mark a path back to the dungeon entrance.",
	tags: 'medium dungeon scenario perception magic combat',
	def: 'm 2p 6c',
	reward: 'Dungeon Map'
});
dg.addChallenge({
	id: 'mc13',
	name: "Examine Orc Markings",
	description: "Orcs never were much for spelling or punctuation.",
	tags: 'medium dungeon scenario magic thievery perception',
	def: '2m 2p t',
	reward: 'Ogre Paintbrush'
});
dg.addChallenge({
	id: 'mc14',
	name: "Rescue Trapped Merchant",
	description: "Perhaps she'll give you a discount next time you're in town.",
	tags: 'medium dungeon scenario thievery perception combat',
	def: 'p t 9c',
	reward: 'Massive Amount of XP and Gold'
});
dg.addChallenge({
	id: 'mc15',
	name: "Pray at Stone Shrine",
	description: "Which diety will you call to?",
	tags: 'medium dungeon scenario magic perception combat',
	def: 'm p + 6c',
	reward: 'Invoke Credit'
});
dg.addChallenge({
	id: 'mc16',
	name: "Steal Silver Idol",
	description: "It's not gold, but it will fetch a fine price.",
	tags: 'medium dungeon scenario perception combat thievery',
	def: '2p 2t 2c',
	reward: 'Silver Idol'
});
dg.addChallenge({
	id: 'mc17',
	name: "Revive Clumsy Wizard",
	description: "Looks like he got caught up in one of his own spells.",
	tags: 'medium dungeon scenario magic perception combat',
	def: '2m p 3c',
	reward: "Wizard's Note"
});
dg.addChallenge({
	id: 'mc18',
	name: "Flip Hourglass",
	description: "Like sands in the hourglass...",
	tags: 'medium dungeon scenario perception thievery',
	def: '2p 2t',
	reward: 'Bonus Gold and XP'
});
dg.addChallenge({
	id: 'mc19',
	name: "Dwarven Drinking Contest",
	description: "The dwarves are ready for a challenge and they're staring in your direction.",
	tags: 'medium dungeon scenario magic perception combat',
	def: 'm p 8c',
	reward: 'Keg of Ale'
});
dg.addChallenge({
	id: 'mc20',
	name: "Treasure Room",
	description: "It looks like no one else has found this stash yet.",
	tags: 'medium-end dungeon magic perception thievery combat',
	def: 'm t + 6c p',
	reward: 'Chest of Diamonds'
});
dg.addChallenge({
	id: 'mc21',
	name: "Necromancer's Tomb",
	description: "The undead stand guard around the sleeping necromancer.",
	tags: 'medium-end dungeon magic perception thievery combat',
	def: 'p + t 6c m',
	reward: "Necromancer's Journal"
});
dg.addChallenge({
	id: 'mc22',
	name: "Dragon's Horde",
	description: "The dragon is long-since gone, but its treasure remains.",
	tags: 'medium-end dungeon magic perception thievery combat',
	def: 't m p + t 3c',
	reward: 'Gold and Gem-filled Cart'
});

// hard challenges 6-7d/end room 7d ordered
dg.addChallenge({
	id: 'hc1',
	name: "Rust Monster",
	description: "If only you still had your wooden sword.",
	tags: 'hard dungeon rust combat perception magic',
	def: 'm 2p 12c',
	reward: 'Intricate Wooden Sword'
});
dg.addChallenge({
	id: 'hc2',
	name: "Enormous Redcap",
	description: "You didn't think they could get this big.",
	tags: 'hard dungeon redcap combat perception',
	def: '2p 3c + 3c + p 2c',
	reward: "Poisoned Spear"
});
dg.addChallenge({
	id: 'hc3',
	name: "Avoid Poisoned Spike Trap",
	description: "Even the slightest scratch could mean death.",
	tags: 'hard dungeon trap perception magic thievery',
	def: '2m 2p + 2t',
	reward: 'Bonus XP'
});
dg.addChallenge({
	id: 'hc4',
	name: "Disarm Poisoned Spike Trap",
	description: "The addition of poison makes this trap especially tricky.",
	tags: 'hard dungeon trap thievery perception combat',
	def: '2p 3t 2c',
	reward: 'Poisoned Spike Trap'
});
dg.addChallenge({
	id: 'hc5',
	name: "Disenchant Poisoned Spike Trap",
	description: "A series of magical runes have been carved into the floor in a distinctive pattern.",
	tags: 'hard dungeon trap magic perception thievery',
	def: '2t p + p m + m',
	reward: 'Runed Floor Tile'
});
dg.addChallenge({
	id: 'hc6',
	name: "Open Runed Chest",
	description: "Some sleeping guards stand between you and a runed chest.",
	tags: 'hard dungeon treasure perception combat thievery',
	def: 'p 3t 6c',
	reward: 'Large Bag of Gold'
});
dg.addChallenge({
	id: 'hc7',
	name: "Bash Runed Chest",
	description: "There aren't many people with the courage to even attempt this.",
	tags: 'hard dungeon treasure combat perception',
	def: '2p + 15c',
	reward: 'Spiked Shield'
});
dg.addChallenge({
	id: 'hc8',
	name: "Lockpick Runed Chest",
	description: "You're not even sure this chest has a lock to pick...",
	tags: 'hard dungeon treasure perception thievery',
	def: '3p 4t',
	reward: 'Golden Jagged Dagger'
});
dg.addChallenge({
	id: 'hc9',
	name: "Disenchant Runed Chest",
	description: "A good wizard protected this chest... but are you a better rogue?",
	tags: 'hard dungeon treasure magic combat thievery',
	def: 'm t + m t + t 3c',
	reward: 'Runed Ring'
});
dg.addChallenge({
	id: 'hc10',
	name: "Search Troll Corpse",
	description: "It's mostly a pile of ashes, but you'd know the smell of burnt troll anywhere.",
	tags: 'hard dungeon scenario perception thievery magic',
	def: 'm p t + m p t',
	reward: 'Singing Longsword'
});
dg.addChallenge({
	id: 'hc11',
	name: "Overflowing Wishing Well",
	description: "Water continues to bubble from the top of the well.",
	tags: 'hard dungeon scenario perception magic thievery combat',
	def: 'm p + t 3c + 2p',
	reward: '+3 Health'
});
dg.addChallenge({
	id: 'hc12',
	name: "Adjust Tilted Torch",
	description: "You feel an overwhelming need to realign the torch.",
	tags: 'hard dungeon scenario perception magic combat',
	def: '2m 2p 9c',
	reward: 'Map of Secret Passages'
});
dg.addChallenge({
	id: 'hc13',
	name: "Examine Ogre Markings",
	description: "It's unclear which bodily fluid was used to paint these markings.",
	tags: 'hard dungeon scenario magic thievery perception',
	def: '3m 2p 2t',
	reward: 'Ogre Paintbrush'
});
dg.addChallenge({
	id: 'hc14',
	name: "Rescue Trapped Knight",
	description: "Honor demands you rescue this knight.",
	tags: 'hard dungeon scenario thievery perception combat',
	def: '2p 2t 9c',
	reward: "Knight's Favor"
});
dg.addChallenge({
	id: 'hc15',
	name: "Pray at Holy Shrine",
	description: "Warm light fills the room.",
	tags: 'hard dungeon scenario magic perception combat',
	def: 'm p + 2m 6c',
	reward: 'Invoke Credit'
});
dg.addChallenge({
	id: 'hc16',
	name: "Steal Golden Idol",
	description: "You can't believe you're the first one to find this bauble.",
	tags: 'hard dungeon scenario perception combat thievery',
	def: 'p 4t 6c',
	reward: 'Golden Idol'
});
dg.addChallenge({
	id: 'hc17',
	name: "Aid Wizard's Spell",
	description: "The wizard promises riches in exchange for a small bit of your blood.",
	tags: 'hard dungeon scenario magic perception combat',
	def: '2m 3p 6c',
	reward: 'Magical Robes'
});
dg.addChallenge({
	id: 'hc18',
	name: "Examine Broken Hourglass",
	description: "Sand continues to pour from the empty shell.",
	tags: 'hard dungeon scenario perception thievery magic',
	def: '2m 2p 2t',
	reward: 'Single Grain of Sand'
});
dg.addChallenge({
	id: 'hc19',
	name: "Championship Dwarven Drinking Contest",
	description: "The dwarves are impressed and allow you to challenge for the title.",
	tags: 'hard dungeon scenario magic perception combat',
	def: 'm p 14c',
	reward: 'Championship Stein'
});
dg.addChallenge({
	id: 'hc20',
	name: "Elegant Throne Room",
	description: "This opulent room has been painstakingly decorated.",
	tags: 'hard-end dungeon magic perception thievery combat',
	def: '2m t + 6c + t 3c',
	reward: 'Amulet of Power'
});
dg.addChallenge({
	id: 'hc21',
	name: "Wizards's Conjuring Chamber",
	description: "Evil magics swirl around the room. Someone is watching you.",
	tags: 'hard-end dungeon magic perception thievery combat',
	def: 'p t + m p 3c + m 3c',
	reward: 'Flawless Crystal Ball'
});
dg.addChallenge({
	id: 'hc22',
	name: "Emperor's War Room",
	description: "Many sieges and ruthless battles have been planned here.",
	tags: 'hard-end dungeon magic perception thievery combat',
	def: 'p 3c + m t + p 6c',
	reward: 'Map of Enemy Troop Movements'
});

// epic challenges 8d single/end room 8d ordered
dg.addChallenge({
	id: 'ec1',
	name: "A Pair of Beholders",
	description: "You have to assume they've seen you by now.",
	tags: 'epic dungeon beholder combat magic',
	def: '2m 17c',
	reward: 'Beholder Eye Stalks'
});
dg.addChallenge({
	id: 'ec2',
	name: "Enraged Ogre",
	description: "This ogre was already in a frenzy before you showed up.",
	tags: 'epic dungeon ogre combat perception',
	def: '4p 12c',
	reward: "Ogre's Head"
});
dg.addChallenge({
	id: 'ec3',
	name: "Avoid Deadly Spike Trap",
	description: "It doesn't look like anyone has done this successfully before.",
	tags: 'epic dungeon trap perception magic thievery',
	def: '2m 2p 4t',
	reward: 'Bonus XP'
});
dg.addChallenge({
	id: 'ec4',
	name: "Disarm Deadly Spike Trap",
	description: "One of the most advanced spike traps you've ever seen.",
	tags: 'epic dungeon trap thievery perception combat',
	def: '3p 3t 5c',
	reward: 'Deadly Spike Trap'
});
dg.addChallenge({
	id: 'ec5',
	name: "Disenchant Deadly Spike Trap",
	description: "A series of complex magical runes have been added to this trap.",
	tags: 'epic dungeon trap magic perception thievery combat',
	def: '2m 2p 2p 5c',
	reward: 'Glowing Magic Scroll'
});
dg.addChallenge({
	id: 'ec6',
	name: "Open Massive Runed Chest",
	description: "You find a massive, unguarded, runed chest.",
	tags: 'epic dungeon treasure perception combat thievery',
	def: '4p 3t 2c',
	reward: 'Fabulous Riches'
});
dg.addChallenge({
	id: 'ec7',
	name: "Bash Massive Runed Chest",
	description: "There aren't many people with the courage to even attempt this.",
	tags: 'epic dungeon treasure combat perception',
	def: '2p 17c',
	reward: 'Epic Shield'
});
dg.addChallenge({
	id: 'ec8',
	name: "Lockpick Massive Runed Chest",
	description: "It looks like many have tried and failed to open this chest.",
	tags: 'epic dungeon treasure perception thievery',
	def: '3p 5t',
	reward: 'Jeweled Jagged Dagger'
});
dg.addChallenge({
	id: 'ec9',
	name: "Disenchant Massive Runed Chest",
	description: "It will take hours to find every spell trapping this chest, let alone remove them.",
	tags: 'epic dungeon treasure magic combat thievery',
	def: '3m 2t 8c',
	reward: 'Glorious Ring'
});
dg.addChallenge({
	id: 'ec10',
	name: "Search Dragon Corpse",
	description: "The dragon may be dead, but the corpses around the room tell you it went down fighting.",
	tags: 'epic dungeon scenario perception thievery magic',
	def: '2m 3p 3t',
	reward: 'Singing Longsword'
});
dg.addChallenge({
	id: 'ec11',
	name: "Cursed Wishing Well",
	description: "A water weird rises from the depths to speak with you.",
	tags: 'epic dungeon scenario perception magic thievery combat',
	def: '2m 3p 2t 3c',
	reward: '+4 Health'
});
dg.addChallenge({
	id: 'ec12',
	name: "Wall of Torches",
	description: "Your skin bristles with magic energy coming from the wall of torches.",
	tags: 'epic dungeon scenario perception magic combat',
	def: '3m p 12c',
	reward: 'Everburning Torch'
});
dg.addChallenge({
	id: 'ec13',
	name: "Examine Demonic Markings",
	description: "A single symbol is missing from a summoning spell.",
	tags: 'epic dungeon scenario magic thievery perception',
	def: '3m 2p 3t',
	reward: 'Glowing Chalk'
});
dg.addChallenge({
	id: 'ec14',
	name: "Rescue Trapped Prince",
	description: "There should be a large reward for his rescue.",
	tags: 'epic dungeon scenario thievery perception combat',
	def: '2p 2t 11c',
	reward: 'Massive Amount of XP and Gold'
});
dg.addChallenge({
	id: 'ec15',
	name: "Pray at Radiant Shrine",
	description: "Prismatic light gleams from the center of the shrine.",
	tags: 'epic dungeon scenario magic perception combat',
	def: 'm p 18c',
	reward: 'Invoke Credit'
});
dg.addChallenge({
	id: 'ec16',
	name: "Steal Gemmed Idol",
	description: "Who would leave something this valuable just sitting around?",
	tags: 'epic dungeon scenario perception combat thievery',
	def: '5p 2t 3c',
	reward: 'Gemmed Idol'
});
dg.addChallenge({
	id: 'ec17',
	name: "Subdue Cackling Wizard",
	description: "The room fills with the laughter of a madman.",
	tags: 'epic dungeon scenario magic perception combat',
	def: 'm 3p 11c',
	reward: 'Shimmering Robes'
});
dg.addChallenge({
	id: 'ec18',
	name: "Navigate Shifting Room",
	description: "The ground seems to moan as it shifts beneath your feet.",
	tags: 'epic dungeon scenario perception thievery magic',
	def: 'm 4p 3t',
	reward: 'Shifting Sands'
});
dg.addChallenge({
	id: 'ec19',
	name: "Final Dwarven Drinking Contest",
	description: "As returning champion, it's your duty to defend the title.",
	tags: 'epic dungeon scenario magic perception combat',
	def: '4m 2p 6c',
	reward: 'Pub Deed'
});
dg.addChallenge({
	id: 'epc20',
	name: "Blue Dragon's Lair",
	description: "Well-ordered magical decorations, sandy floor and light streaming in from above... a blue dragon lives here...",
	tags: 'epic-end dungeon dragon magic perception thievery combat',
	def: 'p t m + m p 3c + m 3c',
	reward: 'Blue Dragon Scales'
});
dg.addChallenge({
	id: 'epc21',
	name: "Black Dragon's Lair",
	description: "It's hard to see much through the murk, but the melted walls tell you a black dragon is near.",
	tags: 'epic-end dungeon dragon magic perception thievery combat',
	def: '2m t 3c + 6c + t 3c',
	reward: 'Black Dragon Scales'
});
dg.addChallenge({
	id: 'epc22',
	name: "Red Dragon's Lair",
	description: "The size of the beast almost distracts from the nearly overwhelming smell of smoke and sulfer.",
	tags: 'epic-end dungeon dragon magic perception thievery combat',
	def: 'p 3c + m t 3c + p 6c',
	reward: 'Red Dragon Scales'
});

