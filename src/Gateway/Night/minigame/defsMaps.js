
dg.addMap({
	"name": "Sample",
	"id": "Sample",
	"width": 19,
	"height": 13,
	"tags": "",
	"tiles": [
		"- - - - - R7 H67 H67 R6 R6 R6 H67 H67 R7 - R4 R4 R4 R4",
		"- - - - - R7 H67 H67 R6 R6 R6 H67 H67 R7 H47 R4 R4 R4 R4",
		"R5 R5 R5 R5 - R7 H67 H67 R6 R6 R6 H67 H67 R7 - R4 R4 R4 R4",
		"R5 R5 R5 R5 - R7 H67 H67 H67 H67 H67 H67 H67 R7 - - H34 - -",
		"R5 R5 R5 R5 H57 R7 R7 R7 R7 R7 R7 R7 R7 R7 - R3 R3 R3 R3",
		"R5 R5 R5 R5 - R7 R7 R7 R7 R7 R7 R7 R7 R7 - R3 R3 R3 R3",
		"R5 R5 R5 R5 - - - - - - - - - - - R3 R3 R3 R3",
		"R5 R5 R5 R5 - H012 H012 H012 H012 H012 H012 H012 H012 H012 - - - H23 -",
		"- H15 - - - H012 - - - H012 - - - H012 - - - H23 -",
		"- R1 R1 R1 R1 R1 - R0 R0 R0 R0 R0 - R2 R2 R2 R2 R2 -",
		"- R1 R1 R1 R1 R1 - R0 R0 R0 R0 R0 - R2 R2 R2 R2 R2 -",
		"- R1 R1 R1 R1 R1 - R0 R0 R0 R0 R0 - R2 R2 R2 R2 R2 -",
		"- - - - - - - R0 R0 R0 R0 R0 - - - - - - -"
	],
	"encounters": {
		"r10c9": {
			"id": "r10c9",
			"row": 10,
			"col": 9,
			"tags": "",
			"color": "0",
			"start": true
		},
		"r10c3": {
			"id": "r10c3",
			"row": 10,
			"col": 3,
			"tags": "",
			"color": "1"
		},
		"r10c16": {
			"id": "r10c16",
			"row": 10,
			"col": 16,
			"tags": "",
			"color": "2"
		},
		"r5c17": {
			"id": "r5c17",
			"row": 5,
			"col": 17,
			"tags": "",
			"color": "3"
		},
		"r1c17": {
			"id": "r1c17",
			"row": 1,
			"col": 17,
			"tags": "",
			"color": "4"
		},
		"r4c1": {
			"id": "r4c1",
			"row": 4,
			"col": 1,
			"tags": "",
			"color": "5"
		},
		"r1c9": {
			"id": "r1c9",
			"row": 1,
			"col": 9,
			"tags": "",
			"color": "6",
			"end": true
		},
		"r4c9": {
			"id": "r4c9",
			"row": 4,
			"col": 9,
			"tags": "",
			"color": "7"
		}
	},
	"rooms": {
		"0": {
			"requires": [
				"r10c9"
			],
			"opens": {
				"1": true,
				"2": true
			},
			"showAlways": true
		},
		"1": {
			"requires": [
				"r10c3"
			],
			"opens": {
				"0": true,
				"2": true,
				"5": true
			}
		},
		"2": {
			"requires": [
				"r10c16"
			],
			"opens": {
				"0": true,
				"1": true,
				"3": true
			}
		},
		"3": {
			"requires": [
				"r5c17"
			],
			"opens": {
				"2": true,
				"4": true
			}
		},
		"4": {
			"requires": [
				"r1c17"
			],
			"opens": {
				"3": true,
				"7": true
			}
		},
		"5": {
			"requires": [
				"r4c1"
			],
			"opens": {
				"1": true,
				"7": true
			}
		},
		"6": {
			"requires": [
				"r1c9"
			],
			"opens": {
				"7": true
			}
		},
		"7": {
			"requires": [
				"r4c9"
			],
			"opens": {
				"4": true,
				"5": true,
				"6": true
			}
		}
	},
	"roomCount": 8
});


