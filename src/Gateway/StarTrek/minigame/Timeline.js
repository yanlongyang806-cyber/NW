'use strict';

function Timeline()
{
	this.timeScale = 1.0;
	this.idx = 0;
	this.baseTime = 0;
	this.events = [];

	this.endTime = 0;
}

function TimelineEvent(time, fn)
{
	this.time = time;
	this.fn = fn;
}

Timeline.prototype.start = function(timeScale)
{
	this.timeScale = timeScale || 1.0;

	this.events.sort(function(a, b) { return a.time - b.time; });

	this.idx = 0;
	this.baseTime = Date.now();

	this.queueNext(-1);
}

Timeline.prototype.queueNext = function(idx)
{
	// console.log('QueueNext '+idx+ ' @'+elapsed)
	if(this.idx >= this.events.length)
	{
		return;
	}

	var self = this;
	var now = Date.now();
	var elapsed = now - this.baseTime;

	var delay = 0;
	do {
		var event = this.events[this.idx++];

		delay = (event.time * this.timeScale) - elapsed;
		if(delay <= 0) delay = 0;
		// console.log(this.idx-1 + ' in '+delay+ ' @'+elapsed);

		(function(event, idx) {
			// console.log('Handling ' + idx)
			setTimeout(function() { event.fn.call(self) }, delay);
		})(event, this.idx-1);

	} while(this.idx < this.events.length && ((this.events[this.idx].time * this.timeScale) - elapsed) <= elapsed+100)

	if(this.idx < this.events.length)
	{
		delay = (this.events[this.idx].time * this.timeScale) - elapsed - 50;
		if(delay < 0) delay = 0;

		idx = this.idx;
		// console.log('queueNext in '+delay+' for '+idx+ ' @'+elapsed);
		setTimeout(function() { self.queueNext(idx) }, delay);
	}
}


Timeline.prototype.add = function(time, fn, duration)
{
	duration = duration || 0;
	if(this.endTime < time + duration)
		this.endTime = time + duration;

	this.events.push(new TimelineEvent(time, fn));
}


Timeline.prototype.animate = function(time, sel, animParams, duration)
{
	if(typeof duration === 'number')
		duration = { duration: duration };
	duration.queue = false;

	if(this.endTime < time + duration.duration)
		this.endTime = time + duration.duration;

	var fn = function() {
		var dur = duration.duration;
		duration.duration *= this.timeScale;
		$(sel).animate(animParams, duration);
		duration.duration = dur;
	}

	this.events.push(new TimelineEvent(time, fn));
}

Timeline.prototype.rumble = function(time, sel, params, duration)
{
	duration = duration || 0;
	if(this.endTime < time + duration)
		this.endTime = time + duration;

	var fn = function() {
		$(sel).jrumble(params);
		$(sel).trigger('startRumble');
	}
	this.events.push(new TimelineEvent(time, fn));

	this.events.push(new TimelineEvent(time + duration, function() {
		$(sel).trigger('stopRumble');
	}));

}

Timeline.prototype.scale = function (time, sel, from, to, duration)
{
	duration = duration || 0;
	if(this.endTime < time + duration)
		this.endTime = time + duration;

	var fn;
	if(to || duration)
	{
		var stepfunc = function (now, fx) {
			$(sel).css({ '-webkit-transform': 'scale('+this.scale+')' });
		}

		fn = function() {
			var obj = { scale: from };
			$(obj).animate({ scale: to }, { duration: duration, step: stepfunc, queue: false });
		};
	}
	else
	{
		fn = function() {
			$(sel).css({ '-webkit-transform': 'scale('+from+')' });
		};
	}

	this.events.push(new TimelineEvent(time, fn));
}

Timeline.prototype.unScale = function (time, sel, duration)
{
	duration = duration || 0;
	if(this.endTime < time + duration)
		this.endTime = time + duration;

	var fn = function() {
		$(sel).css({ '-webkit-transform': '' });
	};

	this.events.push(new TimelineEvent(time, fn));
}

Timeline.prototype.appendElement = function(time, id, extra, content, css, duration)
{
	duration = duration || 0;
	if(this.endTime < time + duration)
		this.endTime = time + duration;

	var fn = function()
	{
		//$(id).remove();

		if(id[0] === '#')
			id = id.slice(1);

		var html = '<span id="'+id+'" ';
		if(extra) html += extra;
		html += '>';
		if(content) html += content;
		html += '</span>';

		$('body').append(html);
		if(css)
			$('#'+id).css(css);
	}

	this.events.push(new TimelineEvent(time, fn));
}

Timeline.prototype.removeElement = function(time, id, duration)
{
	duration = duration || 0;
	if(this.endTime < time + duration)
		this.endTime = time + duration;

	this.events.push(new TimelineEvent(time, function() { $(id).remove(); }));
}

Timeline.prototype.after = function()
{
	// console.log('after = ', this.endTime)
	return this.endTime;
}

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

module.exports = Timeline;

/////////////////////////////////////////////////////////////////////////////

// End of File
