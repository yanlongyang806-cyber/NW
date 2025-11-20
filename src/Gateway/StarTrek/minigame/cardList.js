var cardList = {
	"Escort": {
		"attribs": {
			"shield": 270,
			"hitpoints": 960,
			"accuracyRating": 20,
			"evasionRating": 30,
			"speed": 20,
			"attackMin": 77,
			"attackMax": 87,
			"criticalMult": 1.5,
			"shieldBleed": 0.1,
			"attackBonusAmount": 10,
			"attackBonusPercent": 0,
			"attackReflection": 0,
			"attackReduction": 0
		},
		"actions": [
			"escort.beamFireAtWill",
			"general.wait",
			"general.test"
		],
		"name": "Escort",
		"id": "Escort"
	},
	"Science": {
		"attribs": {
			"shield": 420,
			"hitpoints": 1200,
			"accuracyRating": 20,
			"evasionRating": 30,
			"speed": 10,
			"attackMin": 53,
			"attackMax": 63,
			"criticalMult": 1.5,
			"shieldBleed": 0.1,
			"attackBonusAmount": 10,
			"attackBonusPercent": 0,
			"attackReflection": 0,
			"attackReduction": 0
		},
		"actions": [
			"general.attack",
			"science.viralMatrix",
			"general.wait"
		],
		"name": "Science",
		"id": "Science"
	},
	"Cruiser": {
		"attribs": {
			"shield": 300,
			"hitpoints": 1560,
			"accuracyRating": 20,
			"evasionRating": 14,
			"speed": 9,
			"attackMin": 65,
			"attackMax": 75,
			"criticalMult": 1.5,
			"shieldBleed": 0.1,
			"attackBonusAmount": 10,
			"attackBonusPercent": 0,
			"attackReflection": 0,
			"attackReduction": 0
		},
		"actions": [
			"general.attack",
			"cruiser.auxiliaryToStructural",
			"general.wait"
		],
		"name": "Cruiser",
		"id": "Cruiser"
	},
	"Borg_Probe_1": {
		"attribs": {
			"shield": 270,
			"hitpoints": 1000,
			"accuracyRating": 20,
			"evasionRating": 20,
			"speed": 10,
			"attackMin": 159,
			"attackMax": 169,
			"criticalMult": 1.5,
			"shieldBleed": 0.1,
			"attackBonusAmount": 10,
			"attackBonusPercent": 0,
			"attackReflection": 0,
			"attackReduction": 0
		},
		"actions": [
			"general.attack",
			"science.tractorBeam",
			"general.wait"
		],
		"name": "Borg Probe 1",
		"id": "Borg_Probe_1"
	},
	"Borg_Sphere": {
		"attribs": {
			"shield": 300,
			"hitpoints": 1150,
			"accuracyRating": 25,
			"evasionRating": 25,
			"speed": 11,
			"attackMin": 65,
			"attackMax": 75,
			"criticalMult": 0,
			"shieldBleed": 0,
			"attackBonusAmount": 0,
			"attackBonusPercent": 0,
			"attackReflection": 0,
			"attackReduction": 0
		},
		"actions": [
			"general.attack",
			"escort.beamOverload"
		],
		"name": "Borg Sphere",
		"id": "Borg_Sphere"
	},
	"Borg_Probe_2": {
		"attribs": {
			"shield": 270,
			"hitpoints": 1000,
			"accuracyRating": 20,
			"evasionRating": 20,
			"speed": 10,
			"attackMin": 159,
			"attackMax": 169,
			"criticalMult": 1.5,
			"shieldBleed": 0.1,
			"attackBonusAmount": 10,
			"attackBonusPercent": 0,
			"attackReflection": 0,
			"attackReduction": 0
		},
		"actions": [
			"general.attack",
			"science.tractorBeam",
			"general.wait"
		],
		"name": "Borg Probe 2",
		"id": "Borg_Probe_2"
	}
};
if(module.exports) module.exports = cardList;
