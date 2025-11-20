'use strict';

var utils = require('./utils');
var prims = require('./prims');

//////////////////////////////////////////////////////////////////////////

var exports = module.exports;

//////////////////////////////////////////////////////////////////////////

exports.rollToHit = function()
{
	return function() {	return doRollToHit(this); }
}

exports.isHit = function()
{
	return function() {	return doIsHit(this); }
}

exports.onHit = function(fns)
{
	return prims.ifTrue(exports.isHit(), fns);
}

exports.attack = function(options)
{
	options = options || {};

	if(typeof options === 'number')
		options = { attackScale: options };

	return function() { return doAttack(this, options); }
}

exports.attackForceHit = function(options)
{
	options = options || {};

	if(typeof options === 'number')
		options = { attackScale: options };

	utils.extend(options, { params: { hit: { toHit: 1.0, roll: 0.5, hit: true, hitCritical: false} } });

	return function() { return doAttack(this, options); }
}

exports.clearAttack = function()
{
	return function() { return doClearAttack(this); }
}


//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

function doRollToHit(bundle)
{
	return fillToHit(bundle);
}

function doIsHit(bundle)
{
	if(!bundle.params.hit)
		doRollToHit(bundle);

	return bundle.params.hit.hit;
}

function doAttack(bundle, options)
{
	var source = bundle.source;

	console.log('Attack '+source.cardDef.name);

	// Reset the last attack's damage distribution.
	bundle.params.damage = undefined;

	utils.extend(bundle.params, options);

	fillToHit(bundle);
	calcDamage(bundle, options);
	resolveDamage(bundle, options);

	return true;
}

function doClearAttack(bundle)
{
	var source = bundle.source;
	console.log('ClearAttack '+source.cardDef.name);

	bundle.params.hit = undefined;
	bundle.params.damage = undefined;
	bundle.params.baseDamage = undefined;

	return true;
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

function randomInt(from, to)
{
	return Math.floor(Math.random() * (to - from + 1)) + from;
}

function fillToHit(bundle)
{
	var p = bundle.params;
	if(!p.hit)
	{
		var card = bundle.source;

		var subject = bundle.params.subject || bundle.params.target;
		if(!subject)
		{
			card.error('Subject or individual target not set!');
			return;
		}

		p.hit = {
			toHit: 1.8 * (card.attribs.accuracyRating / (card.attribs.accuracyRating + subject.attribs.evasionRating)),
			roll: Math.random(),
			hit: true,
			hitCritical: false
		};

		if(p.hit.roll <= 0.05)
		{
			p.hit.hit = true;
			p.hit.hitCritical = true;
		}
		else if(p.hit.roll >= 0.98 || p.hit.roll > p.hit.toHit)
		{
			p.hit.hit = false;
		}
	}
}


function calcDamage(bundle, options)
{
	var p = bundle.params;

	if(!p.damage)
	{
		p.damage = {
			hitpoints: 0,
			shield: 0,
			undirected: 0
		};
	}

	if(!('baseDamage' in p))
		p.baseDamage = standardDamage(bundle.source);

	var d = p.baseDamage;

	if(typeof options.attackScale === 'number')
		d = d * options.attackScale;

	var remainder = 1.0;
	if('hitpoints' in options)
	{
		remainder -= options.hitpoints;
		p.damage.hitpoints = (d * options.hitpoints) | 0;
	}
	if('shield' in options)
	{
		remainder -= options.shield;
		p.damage.shield = (d * options.shield) | 0;
	}

	if('undirected' in options)
	{
		remainder -= options.undirected;
		p.damage.undirected = (d * options.undirected) | 0;
	}

	p.damage.undirected += (d * remainder) | 0;
}

function standardDamage(card)
{
	var a = card.attribs;
	var r = randomInt(a.attackMin, a.attackMax);
	var m = (1.0 + a.attackBonusPercent);
	var b = a.attackBonusAmount;

	return (r * m + b) | 0;
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////


function resolveDamage(bundle, options)
{
	var source = bundle.source;
	var player = source.parentPlayer;
	var table = player.parentTable;

	console.log('ResolveDamage '+source.cardDef.name);

	var p = bundle.params;

	if(!p.hit)
	{
		source.log('Internal error in p.');
		return;
	}

	// resolveDamage only resolves the one attack directed at the subject.
	// Multiple targets need to be handled outside of resolveDamage, possibly
	// by using eachTarget.
	var subject = bundle.params.subject || bundle.params.target;
	if(!subject)
	{
		source.error('Subject or individual target not set!');
		return;
	}

	var info = '<span class="roll">';
	if(p.hit.roll < 0.0)
		info += '(Guaranteed hit)';
	else if(p.hit.roll > 1.0)
		info += '(Forced miss)';
	else
		info += '(hit ' + ((p.hit.toHit*100)|0) + ', roll ' + ((p.hit.roll*100)|0) + ')';
	info += '</span>';

	if(p.hit.hit)
	{
		var type;
		var str = '';

		if(p.isReflection)
		{
			str = 'Reflected to ';
		}
		else if(p.hit.hitCritical)
		{
			// Critical Hit Bonus
			for(type in p.damage)
			{
				p.damage[type] = (p.damage[type] * source.attribs.criticalMult) | 0;
			}

			str = 'Critically attacked (' + source.attribs.criticalMult + 'x) ';
		}
		else
		{
			str = 'Attacked ';
		}

		// Reflection
		var paramsReflect;

		if(p.isReflection)
		{
			source = p.sourceReflect;
		}
		else if(subject.attribs.attackReflection > 0)
		{
			paramsReflect = utils.deepExtend({}, p);
			paramsReflect.isReflection = true;
			paramsReflect.sourceReflect = subject;
			paramsReflect.target = paramsReflect.subject = source;
			paramsReflect.hit = {
				roll: -1.0,
				hit: true,
				toHit: 1.0,
				hitCritical: false
			};

			var damage = 0;
			for(type in paramsReflect.damage)
			{
				damage += p.damage[type];
				paramsReflect.damage[type] = 0;
			}
			paramsReflect.damage.undirected = (damage * subject.attribs.attackReflection) | 0;
		}

		// Damage Reduction
		if(subject.attribs.attackReduction > 0)
		{
			for(type in p.damage)
			{
				p.damage[type] = (p.damage[type] * (1.0 - subject.attribs.attackReduction)) | 0;
			}
		}

		// Sort out the final attack values

		// Clamp shield-only damage to the amount they actually have in the shield.
		if(p.damage.shield > subject.attribs.shield)
		{
			p.damage.shield = subject.attribs.shield;
		}

		// Now add in all the undirected damage as shield damage (less bleed)
		var bled = (p.damage.undirected * subject.attribs.shieldBleed) | 0;
		p.damage.shield += p.damage.undirected - bled;
		p.damage.hitpoints += bled;
		p.damage.undirected = 0;

		// OK, now actually apply the damage

		subject.attribs.shield -= p.damage.shield;

		// If we overkilled the shields, move the damage to the hull
		if(subject.attribs.shield < 0)
		{
			// Update the amount actually done (subject.attribs.shield is negative here)
			p.damage.shield += subject.attribs.shield;
			p.damage.hitpoints += (-subject.attribs.shield);
			subject.attribs.shield = 0;
		}

		// What's left goes to the hull
		subject.attribs.hitpoints -= p.damage.hitpoints;
		if(subject.attribs.hitpoints < 0)
		{
			p.damage.hitpoints += subject.attribs.hitpoint;
			p.damage.overkill = (-subject.attribs.hitpoints);
			subject.attribs.hitpoints = 0;
		}

		// Don't actually think I need this since I clamp everything above.
		subject.clampAttribs();

		// Notify and animate everything that just happened.

		var dmg = '';
		if(p.damage.shield > 0)
			dmg = p.damage.shield + ' on shields';

		if(p.damage.hitpoints > 0)
			dmg = dmg + (dmg ? ' and ' : '') + p.damage.hitpoints + ' on hull';

		if(dmg === '')
			dmg = 'nothing';

		if(subject.attribs.attackReduction > 0)
			dmg += ' (' + ((subject.attribs.attackReduction * 100) | 0)+ '% reduct)';

		if(source.attribs.attackBonusPercent && !p.isReflection)
			source.log('<span class="attacking">' + 'Attacking at ' + (1.0 + source.attribs.attackBonusPercent) +'x' + '</span>');
		if(typeof options.attackScale === 'number' && !p.isReflection)
			source.log('<span class="attacking">' + 'Scaled to ' + options.attackScale +'x' + '</span>');

		source.log('<span class="attacking">' + str + subject.cardDef.name + ' for ' + dmg + ' ' + info + '</span>');

		if(p.isReflection)
			subject.log('<span class="attacked">Reflected by ' + source.cardDef.name + ' for ' + dmg + ' ' + info + '</span>');
		else
			subject.log('<span class="attacked">' + str + ' by ' + source.cardDef.name + ' for ' + dmg + ' ' + info + '</span>');

		if(subject.attribs.hitpoints <= 0)
		{
			subject.log('Ship destroyed!');
		}

		table.addMarkCards(source, subject);
		if(!p.damage.shield && !p.damage.hitpoints)
			table.addAnimMessage(subject, 'No Effect!');
		else
			table.addAnimDamage(source, subject, p.damage.shield, p.damage.hitpoints);
		table.addUnmarkCards(source, subject);

		// Do reflection
		if(paramsReflect)
		{
			var origParams = bundle.params;
			bundle.params = paramsReflect;
			resolveDamage(bundle, {});
			bundle.params = bundle.params
		}
	}
	else
	{
		if(source.attribs.attackBonusPercent)
			source.log('<span class="attacking">Attacking at ' + (1.0 + source.attribs.attackBonusPercent) +'x</span>');
		if(typeof options.attackScale === 'number')
			source.log('<span class="attacking">' + 'Scaled to ' + options.attackScale +'x' + '</span>');
		source.log('<span class="attacking">Attacked ' + subject.cardDef.name + ' and missed ' + info + '</span>');
		subject.log('<span class="attacked">' + source.cardDef.name + ' missed! ' + info + '</span>');

		table.addMarkCards(source, subject);
		table.addAnimMessage(source, 'Missed!');
		table.addAnimAnotherMessage(subject, 'Evaded!');
		table.addUnmarkCards(source, subject);
	}

}

// End of File
