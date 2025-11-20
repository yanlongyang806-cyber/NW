'use strict';

var Player = require('./Player');
var Timeline = require('./Timeline');

/////////////////////////////////////////////////////////////////////////////

function Table(p1, p2)
{
	this.round = 1;

	this.players = [];
	this.players.push(new Player('p'+Table.s_id++, this, p1));
	this.players.push(new Player('p'+Table.s_id++, this, p2));

	this.curPlayer = this.players[0];
	this.curOpponent = this.players[1];

	this.timeline = null;
}

Table.s_id = 0;

Table.prototype.getOpponentForPlayer = function(player)
{
	return player === this.players[0] ? this.players[1] : this.players[0];
}

Table.prototype.getPlayerForId = function(idPlayer)
{
	for(var i = 0; i < this.players.length; i++)
	{
		if(this.players[i].id === idPlayer)
			return this.players[i];
	}
}

Table.prototype.getObjectsForId = function(id)
{
	var o = [];
	id = id.split('.');
	id.shift(); // pop off the first (empty) element
	id.pop(); // pop off the last (empty) element

	o[0] = this.getPlayerForId(id[0]);
	if(o[0] && id[1])
	{
		o[1] = o[0].getCardForId(id[1]);
		if(o[1] && id[2])
		{
			o[2] = o[1].getActionForId(id[2]);
		}
	}

	return o;
}

Table.prototype.s_uniqueId = 0;
Table.prototype.makeElemId = function(str)
{
	str = str || 'id';
	var id = this.s_uniqueId++;
	return str+this.s_uniqueId;
}

Table.prototype.clearAnim = function()
{
	this.timeline = new Timeline();
}

Table.prototype.addAnimDelay = function (duration)
{
	var t = this.timeline;
	t.add(t.after(), function() {}, duration)
}

Table.prototype.addMarkCards = function (source, target)
{
	var t = this.timeline;

	var now = t.after();


	if(source)
	{
		t.add(now, function() { $('.'+source.id).addClass('source') }, 0);
		t.scale(now, '.'+source.id, 1.0, 1.08, 250);
	}

	if(target)
	{
		t.add(now+150, function() { $('.'+target.id).addClass('target') }, 0);
		t.scale(now+150, '.'+target.id, 1.0, 1.08, 250);
	}
}

Table.prototype.addAnimDamage = function (source, target, strShield, strHull)
{
	var posSource = $('.'+source.id).offset();
	var posTarget = $('.'+target.id).offset();
	var w = $('.'+target.id).innerWidth();
	var h = $('.'+target.id).innerHeight();


	var t = this.timeline;
	var now = t.after();

	var id;
	if(strShield)
	{
		id = this.makeElemId('#shldflt');
		t.appendElement(now, id, 'class="shield floater"', strShield,
			{ top: posTarget.top + h/3, left: posTarget.left, width: w });
		t.animate(now+1, id, { top: posTarget.top + h/3 + 60, opacity: 0.4 }, 1000);
		t.rumble(now+1, '.'+target.id, { x: 2, y: 2, rotation: 0 }, 200);
		t.removeElement(t.after(), id);
	}

	if(strHull)
	{
		id = this.makeElemId('#hullflt');
		t.appendElement(now, id, 'class="hull floater"', strHull,
			{ top: posTarget.top + h/3, left: posTarget.left, width: w });
		t.animate(now+1, id, { top: posTarget.top + h/3 - 40 }, 500);
		t.rumble(now+1, '.'+target.id, { x: 8, y: 8, rotation: 4 }, 300);
		t.removeElement(t.after() + 500, id);
	}
}

Table.prototype.addAnimMessage = function (target, str)
{
	var t = this.timeline;
	var now = t.after();
	this._addAnimMessage(now, target, str, 750);
}

Table.prototype.addAnimAnotherMessage = function (target, str)
{
	var t = this.timeline;
	var now = t.after();

	this._addAnimMessage(now-750, target, str, 750);
}

Table.prototype._addAnimMessage = function (time, target, str, duration)
{
	var posTarget = $('.'+target.id).offset();
	var w = $('.'+target.id).outerWidth();
	var h = $('.'+target.id).outerHeight();

	var t = this.timeline;

	if(str)
	{
		var id = this.makeElemId('#msgflt');
		t.appendElement(time, id, 'class="message floater"', str,
			{ top: posTarget.top + h/3, left: posTarget.left, width: w });
		t.animate(time+1, id, { top: posTarget.top + h/3 - 40 }, duration);
		t.removeElement(time+ duration, id);
	}
}

Table.prototype.addUnmarkCards = function (source, target)
{
	var t = this.timeline;

	var now = t.after();

	if(source)
	{
		t.add(now, function() { $('.'+source.id).removeClass('source') }, 0);
		t.unScale(now, '.'+source.id);
	}

	if(target)
	{
		t.add(now, function() { $('.'+target.id).removeClass('target') }, 0);
		t.unScale(now, '.'+target.id);
	}
}

Table.prototype.playAnim = function (fn)
{
	if(fn)
		this.timeline.add(this.timeline.after(), fn);

	if(this.timeline)
		this.timeline.start();
}


Table.prototype.selectForId = function(ids, cb)
{
	this.selecting = ids;
	this.onSelected = cb;

	$('body').addClass('select-mode');

	ids.forEach(function(id) {
		$('.card.'+id).addClass('selectable');
	});
}

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

module.exports = Table;

/////////////////////////////////////////////////////////////////////////////

// End of File
