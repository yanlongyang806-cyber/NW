"use strict";

var client = {};

client.scaEffectShake = function(jqElem, mag, cycles, callback)
{
	if(!cycles)
	{
		cycles = 7;
	}

	if(!callback)
		callback = function() {};

	var p, sPos = jqElem.position()

//console.log("sPos: ", sPos);

	var nTop, nLeft, posArr = [];
	var c, i;
	// cycles
	for(c = 1;c < cycles; c++)
	{
		// movements within a cycle
		for(i = 0; i < 4; i++)
		{
			nTop = (Math.random() > 0.5?1:-1) * (mag / c);
			nLeft = (Math.random() > 0.5?1:-1) * (mag / c);
			//nRight = (Math.random() > 0.5?1:-1) * (mag / c);
//console.log('Top/Left: ', nTop, nLeft);
			posArr.push({top:(nTop + sPos['top']), left:(nLeft + sPos['left'])});

//console.log('Push: ', {top:(nTop + sPos['top']), left:(nLeft + sPos['left'])});
		}
	}

	moveIt(jqElem, posArr, function() {
		callback();
	});
}

var s_moveItIndex = 0;
function moveIt(jqElem, posArr, callback)
{
	var mod = posArr[s_moveItIndex++];

	jqElem.css({ top: mod['top'] + 'px', left: mod['left'] + 'px' });

	if(s_moveItIndex >= posArr.length)
	{
		s_moveItIndex = 0;
		jqElem.removeAttr("style");
		if(callback)
			callback();
		return;
	}

	window.requestAnimationFrame(function() {
		moveIt(jqElem, posArr, callback);
	});
}

function ghostOut(jqElem, duration, scale, callback)
{
	if(!duration)
		duration = 500;

	if(!scale)
		scale = 4;

	var step = 0;
	// 'step' is called every time a property changes.
	// We only want the 'step' to be called when animating
	// 'border-spacing', which is our counter for scale.
	jqElem.animate({'border-spacing': scale, 'opacity': 0 }, {
		step: function(now,fx) {
			if(step++ % 2)
			{
				$(this).css('-webkit-transform','scale('+now+')');
				$(this).css('-ms-transform','scale('+now+')');
				$(this).css('transform','scale('+now+')');
			}
		},
		duration: duration
	}).promise().done(function() {
		$(this).remove(); // clean up
		if(callback)
			callback();
	});
}

function ghostOutWithSpin(jqElem, duration, scale, callback)
{
	if(!duration)
		duration = 500;

	if(!scale)
		scale = 4;

	// we want a full rotation when we are done
	var angle = 360 / scale;

	var step = 0;
	// 'step' is called every time a property changes.
	// We only want the 'step' to be called when animating
	// 'border-spacing', which is our counter for scale.
	jqElem.animate({'border-spacing': scale, 'opacity': 0 }, {
		step: function(now,fx) {
			if(step++ % 2)
			{
				$(this).css('-webkit-transform','scale('+now+') rotate('+(angle * now)+'deg)');
				$(this).css('-ms-transform','scale('+now+') rotate('+(angle * now)+'deg)');
				$(this).css('transform','scale('+now+') rotate('+(angle * now)+'deg)');
			}
		},
		duration: duration
	}).promise().done(function() {
		$(this).remove(); // clean up
		if(callback)
			callback();
	});
}

function completeIt()
{
	var dungeon = $('.hex-c.hex-7');

	var ghost = dungeon.find('.location-icon').clone();
	dungeon.append(ghost);

	ghostOut(ghost, 750, 4, function() {
		dungeon.addClass('completed disabled');
	});

	client.scaEffectShake(dungeon, 6, 8);
}

function addItIn()
{
	var dungeon = $('.hex-f.hex-11');

	var icon = dungeon.find('.location-icon');
	icon.css({'height':'0px','top':'30px'});
	dungeon.fadeIn().promise().done(function () {
		shakeIt(dungeon, 2, 1750);
		icon.animate({'height':'35px', 'top':'4px'}, 2000);
		addSmokePuffs(dungeon, 8);
	});
}

function addSmokePuffs(jqElem, number)
{
	if(number > 0)
	{
		addSmoke(jqElem, 600);
		number--;
		setTimeout(function() {
			addSmokePuffs(jqElem, number);
		}, 250);
	}
}


function addSmoke(jqElem, duration)
{
	var pos = {
		'position':'absolute',
		'top':'20px',
		'left': Math.floor(Math.random() * 30) + 1
	}
	var puff = $('<span class="dice d12 small onyx"></span>');
	puff.css(pos);
	jqElem.append(puff);
	ghostOutWithSpin(puff, duration, 1.75);
}




function shakeIt(jqElem, mag, duration, callback)
{
	// duration in miliseconds, how many 'frames' do i want to make?
	var frames = Math.ceil(duration / 16);

	var mod = {};
	var x, posArr = [], sPos = jqElem.position();
	for(x = 0; x < frames; x++)
	{
		mod['top'] = Math.random() * (Math.random() > 0.5?1:-1);
		mod['left'] = Math.random() * (Math.random() > 0.5?1:-1);

		posArr.push({
			top:((mod['top'] * mag) + sPos['top']),
			left:((mod['left'] * mag) + sPos['left'])
		});
	}

	moveIt(jqElem, posArr, function() {
		if(callback)
			callback();
	});
}



