"use strict";

var s_boxHeight, s_boxWidth, s_maxDieSize = 64;

// ----------------------------------------------------------------------------
// Velocity Modifiers - Applied via multiplication of existing velocity
// ----------------------------------------------------------------------------

/* ZACH REVISED V01 */
/* avg 1.3 sec */

var VEL_DRAG    = 0.95; // how the dice slow per tick.
var VEL_BOUNCE  = 0.6; //0.5;
var VEL_COLLIDE = 0.45; //0.65;

var VEL_MIN = 30;
var VEL_MAX = 70;

var VEL_SETTLE = 6; //8;
var VEL_STOP = 0.005;



/* ORIGINAL KEVIN VALUES */
/* avg 2.6 sec */
/*
var VEL_DRAG    = 0.975; // how the dice slow per tick.
var VEL_BOUNCE  = 0.8;
var VEL_COLLIDE = 0.9;

var VEL_MIN = 30;
var VEL_MAX = 60;

var VEL_SETTLE = 3;
var VEL_STOP = 0.1;
*/

var ANIMATION_TICK = 1000 / 60; // ms between animation ticks

var s_dieSize = {
	'd4': 55,
	'd6': 45,
	'd8': 55, // 39 wide 55 tall
	'd10': 49,
	'd12': 55
}

// top offset
var s_dieOffsetY = {
	'd4': 0,
	'd6': -8,
	'd8': -2,
	'd10': -1,
	'd12': -1,
}

// left offset
var s_dieOffsetX = {
	'd4': 0,
	'd6': -8,
	'd8': -7,
	'd10': -3,
	'd12': -1,
}

var s_dieColors = ['base','amethyst','sapphire','topaz','ruby','emerald','onyx'];
var s_dieSymbolMap = {
	'p': 'perception',
	'm': 'magic',
	't': 'thievery',
	'c': 'combat',
	'w': 'wild'
}

// ----------------------------------------------------------------------------

function DiceBox()
{
	this.bag = [];     // bag of dice
	this.box = false;  // box to roll dice in

	this.done = function() {}; // callback function after dice have stopped rolling.

	// Animation status, self managed.
	this.animating = true;

	return this;
}

// After everything is ready, roll it!
DiceBox.prototype.throwDice = function(callback)
{
	// For debug - separator between throws
//	console.log('----------------------------------------------------------');
//	console.log('--  THROWING DICE: ' + this.bag.length);
//	console.log('----------------------------------------------------------');

	this.animating = true;
	this.done = callback || function() {};
	var self = this;
	window.requestAnimationFrame(function() {
		self.animationTick();
	});
}

// Clear out the dice bag and cleanup die elements.
DiceBox.prototype.emptyBag = function()
{
	var n;
	for(n = 0; n < this.bag.length; n++)
	{
		this.bag[n].elem.remove();
		delete(this.bag[n]);
	}
	this.bag = [];
	this.box.empty();
}

// Set the box that you are going to roll the dice in (jquery element)
// Usage: setBox($('#box'));
DiceBox.prototype.setBox = function(jqElem)
{
	this.box = jqElem;

	s_boxHeight = Math.floor(jqElem.height());
	s_boxWidth = Math.floor(jqElem.width());

//	console.log("Box Dimetions: ",s_boxHeight, s_boxWidth);
}

// Clears the bag, and adds <number> of dice to it.
DiceBox.prototype.newBag = function(number)
{
	this.emptyBag();

	if(!this.box)
	{
		console.error('DiceBox.newBag() - ERROR: Called without a dice box set. (Use setBox() first)');
		return;
	}

	for(var n = number; n > 0; n--)
	{
		if(!this.addDieToBag())
		{
//			console.log("newBag(): Failed to add to bag at number: " + n);
			this.emptyBag();
			return false;
		}
	}

	return true;
}

DiceBox.prototype.newBagFromPileDice = function(pile)
{
	this.emptyBag();

	if(!this.box)
	{
		console.error('DiceBox.newBagFromPile() - ERROR: Called without a dice box set. (Use setBox() first)');
		return;
	}

	var n;
	for(n = 0; n < pile.length; n++)
	{
		if(!pile[n].used)
		{
			if(!this.addDieToBag(pile[n].count, pile[n].color, pile[n].id, pile[n].roll.symbol, pile[n].roll.count))
			{
//				console.log("newBag(): Failed to add to bag at number: " + n);
				this.emptyBag();
				return false;
			}
			else
			{
//				console.log("added die to bag: ", this.bag[n]);
			}
		}
	}

	return true;
}


// Adds a new die to the bag
// - size: d6, d10, d12, etc.
// - color: ruby, topaz, sapphire, etc.
// - type: combat, magic, perception, etc.
DiceBox.prototype.addDieToBag = function(sides, color, slot, symbol, count)
{
//	console.log("addDieToBag(): ", sides, color, slot, symbol, count);

	var start = this.findValidDieStart();

	if(!start)
	{
		console.error("addDieToBag(): Error could not add die to bag");
		return false;
	}

	if(!sides) sides = 6;

	if(!color)
	{
		color = s_dieColors[this.bag.length % 7];
	}

	if(typeof slot == 'undefined')
	{
		slot = this.bag.length;
	}

	if(!symbol)
	{
		symbol = 'c';
	}

	if(typeof count == 'undefined')
	{
		count = 1;
	}

	var die = {
		'id': this.bag.length,
		'sides': sides,
		'color': color,
		'slot': slot,
		'symbol': s_dieSymbolMap[symbol],
		'count': count,
		'elem': $('<div id="die' + this.bag.length + '" class="dice spin slot-' + slot + ' large d' + sides + ' ' + color + '" style="top: ' + start.pos.top + '; left: ' + start.pos.left + '"><span class="rune"></span><span class="num"></span></div>'),
		'pos': { // Starting position
			'top': start.pos.top,
			'left': start.pos.left
		},
		'dir': { // Normalized Vector for direction
			'top': start.dir.top,
			'left': start.dir.left
		},
		'velocity': Math.floor((Math.random() * (VEL_MAX - VEL_MIN)) + VEL_MIN), // initial velocity
		'size': 'd'+sides,
		'landed': false
	};

	this.bag.push(die);

	this.box.append(die.elem);

	return true;
}

// Find die starting position and direction
DiceBox.prototype.findValidDieStart = function()
{
	var clear, d, top, left, n, testDieLoc, l;

	l = 0; // JANE!!  STOP THIS CRAZY THING!!!
	do {
		clear = true;
		// Give me a location inside a box that is 3/4ths the width of the dice
		// box and centered below it, adjacent to the bottom of the die box,
		// and as deep as 5 max sized die.
		top = (Math.random() * (s_maxDieSize * this.bag.length)) + s_boxHeight;
		left = (Math.random() * (s_boxWidth * 0.33)) + (s_boxWidth * 0.33);
//		top = (Math.random() * (s_maxDieSize * this.bag.length)) + s_boxHeight;
//		left = (Math.random() * (s_boxWidth - s_maxDieSize));

		if(this.bag.length)
		{
			for(n = 0; n < this.bag.length; n++)
			{
				d = distance([ left, top ], [ this.bag[n].pos.left, this.bag[n].pos.top ]);
				if(d < (s_maxDieSize + 10))
				{
					clear = false;
				}
			}
		}

		l++;

		if(l > 500)
		{
			console.error("findValidStart(): Could NOT find starting position for die " + this.bag.length);
			return false;
		}

	} while(!clear)


	// middle of the top of the dice box
	var throwDiceAt = [
		((Math.random() * s_boxWidth)), //(s_boundWidth * 0.5)) + (s_boundWidth + s_dieWidth)* 0.25),
		0
	];

	var dir = vectorUnit([ throwDiceAt[0] - left, throwDiceAt[1] - top]);

	return {
		'pos': {
			'top': top,
			'left': left
		},
		'dir': {
			'top': dir[1],
			'left': dir[0]
		}
	}

}

// Animate the dice in the bag for one tick
// Recursivly calls until ALL dice have stopped. (Vel = 0)
DiceBox.prototype.animationTick = function()
{
	// Done?
	if(!this.animating)
	{
//		console.log('Animation Stopped.');
		this.done();
		return;
	}

	doCalculations(this);

	doAnimations(this);

	var self = this;
	window.requestAnimationFrame(function() {
		self.animationTick();
	});
}

function doCalculations(db)
{
	var n, xStart, yStart, xUpper, xLower, yUpper, yLower, collided;
	db.animating = false;
	for(n = 0; n < db.bag.length; n++)
	{
		if(db.bag[n].velocity > 0)
		{
			db.animating = true;

			xStart = db.bag[n].pos.left;
			yStart = db.bag[n].pos.top;

			// Bounding box for this die:
			xUpper = s_boxWidth - s_dieSize[db.bag[n].size];
			xLower = 0 + s_dieOffsetX[db.bag[n].size];

			yUpper = s_boxHeight - s_dieSize[db.bag[n].size];
			yLower =  0 + s_dieOffsetY[db.bag[n].size];

			db.bag[n].pos.top += db.bag[n].dir.top * db.bag[n].velocity;
			db.bag[n].pos.left += db.bag[n].dir.left * db.bag[n].velocity;

			// Right side of the box
			if(db.bag[n].pos.left >= xUpper)
			{
				db.bag[n].pos.left = xUpper;
				db.bag[n].dir.left *= -1;
				db.bag[n].velocity *= VEL_BOUNCE;
			}

			// Left side of the box
			if(db.bag[n].pos.left < xLower)
			{
				db.bag[n].pos.left = xLower;
				db.bag[n].dir.left *= -1;
				db.bag[n].velocity *= VEL_BOUNCE;
			}

			if(!db.bag[n].landed)
			{
				if((db.bag[n].pos.top > 0 && db.bag[n].pos.top < yUpper)
					&& (db.bag[n].pos.left > 0 && db.bag[n].pos.left < xUpper))
				{
					db.bag[n].landed = true;
					continue;
				}
				else
				{
					// Should be going in the negative Y direction
					if(db.bag[n].dir.top > 0)
					{
						db.bag[n].dir.top *= -1
					}
				}
			}
			else
			{
				// Upper bounds
				if(db.bag[n].pos.top >= yUpper)
				{
					db.bag[n].pos.top = yUpper;
					db.bag[n].dir.top *= -1;
					db.bag[n].velocity *= VEL_BOUNCE;
				}

				// lower Bounds
				if(db.bag[n].pos.top < yLower)
				{
					db.bag[n].pos.top = yLower;
					db.bag[n].dir.top *= -1;
					db.bag[n].velocity *= VEL_BOUNCE;
				}

				if(db.bag[n].velocity < 1)
				{
					// hit the brakes!
					db.bag[n].velocity *= 0.8; // slower each tick
				}
				else
				{
					// normal drag
					db.bag[n].velocity *= VEL_DRAG;
				}
			}

			// Slow enough to slide/settle.
			if(db.bag[n].velocity < VEL_SETTLE)
			{
				db.bag[n].elem
					.removeClass('spin')
					.addClass('settle ' + db.bag[n].symbol);

				if(db.bag[n].count > 1)
				{
					db.bag[n].elem.find('.num').text(db.bag[n].count);
				}
			}

			// Slow enough to stop.
			if(db.bag[n].velocity < VEL_STOP)
			{
				db.bag[n].velocity = 0;
			}

			// Check for collision, and adjust
			collided = db.checkCollisionById(n);
			if(collided)
			{
				db.bag[n].pos.left = xStart;
				db.bag[n].pos.top = yStart;
				dieBounce(db.bag[n], collided)
			}
		}
	}
}

function doAnimations(db)
{
	var n;
	for(n = 0; n < db.bag.length; n++)
	{
		db.bag[n].elem.css(db.bag[n].pos);
	}
}

DiceBox.prototype.checkCollisionById = function(id)
{
	// Cant collide till it lands
//	if(!s_box[id].landed) return false;

	var n;
	var dieLoc = dieCenter(this.bag[id]);
	var testDieLoc;

	for(n = 0; n < this.bag.length; n++)
	{
		if(n === id) continue;

		testDieLoc = dieCenter(this.bag[n]);

		// Collision distance
		var d = distance(dieLoc, testDieLoc);
		if(d < ((s_dieSize[this.bag[n].size] / 2) + (s_dieSize[this.bag[id].size] / 2)))
		{
			return this.bag[n];
		}
	}

	return false;
}



// Assuming all vectors are unit vectors for this
function vectorProject(a, b)
{
	var c = (a[0] * b[0]) + (a[1] * b[1]);

	return [ c * b[0] , c * b[1] ]
}

function vectorAdd(a, b)
{
	return [ a[0] + b[0] , a[1] + b[1] ];
}

function vectorUnit(a)
{
	var mag = Math.sqrt((a[0] * a[0]) + (a[1] * a[1]));

	return [ a[0] / mag, a[1] / mag ];
}

function dieBounce(dieOne, dieTwo)
{
	// Doing bounces as described here
	// http://www.tonypa.pri.ee/vectors/tut11.html

	// center of dieOne
	var centerOne = dieCenter(dieOne);

	// center of dieTwo
	var centerTwo = dieCenter(dieTwo);

	// Unit vector from center to center
	var centerVec = vectorUnit([(centerOne[0] - centerTwo[0]) , (centerOne[1] - centerTwo[1])]);

	// Perpindicular unit vector from center to center (normal)
	var centerVecNorm = [ centerVec[1] * -1 , centerVec[0] ];

	var vOneA = vectorProject(
		[ dieOne.dir.left, dieOne.dir.top ],
		centerVec
	);

	var vOneB = vectorProject(
		[ dieOne.dir.left, dieOne.dir.top ],
		centerVecNorm
	);

	var vTwoA = vectorProject(
		[ dieTwo.dir.left, dieTwo.dir.top ],
		centerVec
	);

	var vTwoB = vectorProject(
		[ dieTwo.dir.left, dieTwo.dir.top ],
		centerVecNorm
	);

	var newDirOne = vectorUnit(vectorAdd(vOneB, vTwoA));
	var newDirTwo = vectorUnit(vectorAdd(vOneA, vTwoB));

	dieOne.dir.left = newDirOne[0];
	dieOne.dir.top = newDirOne[1];
	dieOne.pos.left += (newDirOne[0] * dieOne.velocity);
	dieOne.pos.top += (newDirOne[1] * dieOne.velocity);

	dieTwo.dir.left = newDirTwo[0];
	dieTwo.dir.top = newDirTwo[1];
	dieTwo.pos.left += (newDirTwo[0] * dieTwo.velocity);
	dieTwo.pos.top += (newDirTwo[1] * dieTwo.velocity);

	// Only effect velocity if both dice have 'landed'
	// Helping to avoid jams
	if(dieOne.landed && dieTwo.landed)
	{
		var tmp = dieOne.velocity;
		dieOne.velocity = dieTwo.velocity;
		dieTwo.velocity = tmp;

		// var newVel = ((dieOne.velocity + dieTwo.velocity) / 2) * VEL_COLLIDE;
		// dieOne.velocity = newVel;
		// dieTwo.velocity = newVel;
	}
}

// return x,y center coord
// Dice are 64x64 pixels atm
function dieCenter(die)
{
	return [ die.pos.left + (s_dieSize[die.size] / 2), die.pos.top + (s_dieSize[die.size] / 2) ]
}

function distance(pointA, pointB)
{
	return Math.sqrt(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2));
}

// ---------------------------------------------------------------------------------

// Debug funcitons

// DiceBox.prototype.exportStart = function()
// {
// 	var n, d, out = [];
// 	for(n = 0; n < this.bag.length; n++)
// 	{
// 		d = {};
// 		d.pos = this.bag[n].pos;
// 		d.dir = this.bag[n].dir;
// 		d.size = this.bag[n].size;

// 		out.push(d);
// 	}

// 	console.log(JSON.stringify(out));
// }

// DiceBox.prototype.importStart = function(start)
// {
// 	var n;
// 	if(start)
// 	{

// 		console.log("START: ", start);
// 		for(n = 0; n < start.length; n++)
// 		{
// 			this.addDieToBag(start[n].size);

// 			this.bag[this.bag.length - 1]["pos"]["top"] = start[n].pos.top;
// 			this.bag[this.bag.length - 1]["pos"]["left"] = start[n].pos.left;
// 			this.bag[this.bag.length - 1].elem.css(start[n].pos);
// 			this.bag[this.bag.length - 1]["dir"]["top"] = start[n].dir.top;
// 			this.bag[this.bag.length - 1]["dir"]["left"] = start[n].dir.left;

// 		}
// 	}
// 	else
// 	{
// 		var e = new Error("importStart(): Error - start has no value.");
// 		console.log(e, e.stack);
// 	}
// }
// ---------------------------------------------------------------------------------
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// ---------------------------------------------------------------------------------

//module.exports = DiceBox;

/*
// DEBUG STUFF

var d = $('#die0').get()[0];

var t = 0; l = 0;
function moveit()
{
	if(t < 350)
	{
		d.style.top = t + "px";
		d.style.left = l + "px";
		t+=10;
		l+=10;
		setTimeout(moveit, 250);
	}
	else
	{
		t = 0;
		l = 0;
	}
}

DiceBox = require('./DiceBox');
db = new DiceBox();
db.setBox($(".dicebox"));
db.newBag(10);
db.throwDice()

*/
