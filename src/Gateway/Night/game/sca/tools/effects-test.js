"use strict";

// Effects-test.js
function scaChooseDie(slot)
{
	var die = $('.slot-' + slot);
	var tablet = $('.trial-0');

	var runeTarget = tablet.find('.rune[data-rune="' + die.attr('data-rune') + '"]');

	var throwDie = die.clone();
	var runeGhost = runeTarget.clone();

	runeGhost.addClass('effect');

	var setCSS = die.offset();
	setCSS['background'] = 'transparent';

	$('body').prepend(throwDie);
	throwDie.css(setCSS);

	// Reusing setCSS to be the target location
	setCSS = runeTarget.offset();

	// And make sure its seen
	setCSS['z-index'] = '99999';

	// Need a rune Ghost at the target location
	runeGhost.css(setCSS);

	// Fire away!
	(function(rGhost) {
		throwDie.animate(setCSS, 250).promise().done(function() {

			$(this).remove(); // done with this guy.

			// Fire up the ghost
			$('body').append(rGhost);
			ghostOut(rGhost);

			// Shake the tablet.
			client.scaEffectShake(tablet, 7, false, function() {
				// Done.
			});
		});
	}(runeGhost));
}


var client = {};
client.scaEffectShake = function(jqElem, mag, cycles, callback)
{
	if(!cycles)
	{
		cycles = 7;
	}

	var p, sPos = jqElem.position()

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

			posArr.push({top:(nTop + sPos['top']), left:(nLeft + sPos['left'])});
		}
	}

	moveIt(jqElem, posArr, function() {
		if(callback)
			callback();
	});
}

function moveIt(jqElem, posArr, callback)
{
	var mod = posArr.shift();

	// If it gets removed from the DOM, it will no longer be 'visible'
	if(jqElem.is(':visible'))
	{
		jqElem.css({ top: mod['top'] + 'px', left: mod['left'] + 'px' });

		if(!posArr.length)
		{
			jqElem.removeAttr("style");
			if(callback)
				callback();
			return;
		}

		window.requestAnimationFrame(function() {
			moveIt(jqElem, posArr, callback);
		});
	}
}

// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
