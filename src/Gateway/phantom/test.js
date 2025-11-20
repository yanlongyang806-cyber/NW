phantom.injectJs('./require.js');
var format = require('/src/gateway/build/deploy/debug/node_modules/cryptic/format.js');

function createTestLogin(id)
{
	var p = require('webpage').create();

	p.viewportSize = { width: 600, height: 800 }

	p.id = id;
	p.success = false;
	p.done = false;
	p.url = "http://localhost:8000";
	p.actions = [];
	p.timeStart = Date.now();
	p.timeStepStart = Date.now();
	p.step = '';

	p.onLoadStarted = function () {
//	    console.log(id +': Start loading...');
	};

	p.onLoadFinished = function (status) {
//		console.log(id +': Loading finished.');
	};

	p.onConsoleMessage = function(msg) {
	    console.log(id +': console: '+msg);
	};

	p.onUrlChanged = function (data) {
//	    console.log(id +': URL updated to '+data);

		if(!p.actions.length)
		{
			p.done = true;
		}

		if(p.done)
		{
			clearInterval(p.interval);
			return;
		}

		var n = p.actions[0];

		if(!n.timeStart)
		{
			n.timeStart = Date.now();
		}

		if(n.timeout && (Date.now() - n.timeStart > n.timeout))
		{
			// Timeout reached!
			console.log(id + ': Timeout on step "'+n.name+'"');
			p.done = true;
			clearInterval(p.interval);
			return;
		}

		if(n.busy)
			return;

		if(n.url && n.url.test(data))
		{
			n.busy = true;
			var d = n.delay || 1;
			setTimeout(n.exec, d);
		}
	};

	function checkWait()
	{
		if(!p.actions.length)
		{
			p.done = true;
		}

		if(p.done)
		{
			clearInterval(p.interval);
			return;
		}

		var n = p.actions[0];

		if(!n.timeStart)
		{
			n.timeStart = Date.now();
		}

		if(n.timeout && (Date.now() - n.timeStart > n.timeout))
		{
			// Timeout reached!
			console.log(id + ': Timeout on step "'+n.name+'"');
			p.done = true;
			clearInterval(p.interval);
			return;
		}

		if(n.busy)
			return;

		if(n.test && !n.url)
		{
			if(p.evaluate(n.test))
			{
				n.busy = true;
				n.exec();
			}
		}
	};

	p.actions.push({
		name: 'login',
		url: new RegExp('.*/#/login'),
		delay: 500,
		timeout: 30000,
		exec:  function() {
			p.switchToChildFrame(0);
			p.evaluate(function() {
				var el = document.querySelector('#user');
				el.value = 'sposniewski';
				el = document.querySelector('#pass');
				el.value = 'hat';
				el = document.querySelector('#login');
				el.click();
			});
			p.actions.shift();
		}
	});

	p.actions.push({
		name: 'characterselect',
		url: new RegExp('.*/#/characterselect'),
		delay: 1,
		timeout: 30000,
		exec: function() {
			p.actions.shift();
		}
	});

	p.actions.push({
		name: 'waiting for characters',
		test: function() {
				var e = document.querySelectorAll('li');
				return e.length > 0 ? JSON.stringify(getComputedStyle(e[0])) : false;
			},
		timeout: 30000,
		exec: function() {
			p.evaluate(function() {
				function randomInt(min, max) {  return Math.floor(Math.random() * (max - min)) + min; }
				var e = document.querySelectorAll('li');
				var i = randomInt(0, e.length);
				e[i].onclick();
			});
			p.actions.shift();
		}
	});

	p.actions.push({
		name: 'waiting for main screen',
		test: function() {
			var e = document.querySelectorAll('.front-emblem');
			return e;
		},
		timeout: 10000,
		exec: function() {
//			console.log(p.id + ': ** LOGGED IN **');
			p.success = true;
			p.actions.shift();
		}
	});

	p.go = function() {
		p.interval = setInterval(checkWait, 100);
		p.open(p.url);
	}

	return p;
};

var total = 0;
var count = 6;
var a = [];
var i;
for(i=0; i<count; i++)
{
//	console.log('Creating '+total);
	a.push(createTestLogin(''+total));
	total++;
}

for(i=0; i<a.length; i++)
{
	console.log('Starting '+a[i].id);
	a[i].go();
}

var totalTime = 0;
var totalCount = 0;
var yay = 0;
var boo = 0;
var oldest;

setInterval(function() {
	var timeMin = Date.now();

	for(i=0; i<count; i++)
	{
		if(a[i] && a[i].done)
		{
			if(a[i].success)
			{
				yay++;

				totalTime += Date.now() - a[i].timeStart;
				totalCount++;
			}
			else
			{
				boo++;
			}

			var old = a[i].id;
			a[i].release();
			a[i] = undefined;

//			console.log('Creating '+total);
			a[i] = createTestLogin(''+total);
			total++;

			console.log('Starting '+a[i].id);
			a[i].go();
		}

		if(a[i])
		{
			if(a[i].timeStart < timeMin)
			{
				oldest = Date.now()-a[i].timeStart;
			}
		}
	}
}, 100);

setInterval(function() {
	console.log('Successes: '+yay+'   Failures: '+boo);
	if(oldest)
	{
		console.log('Oldest test is '+ format.precision(oldest/1000, 2) + ' seconds old.');
	}
	if(totalCount)
	{
		console.log('Avg time: ' + format.precision((totalTime/totalCount)/1000,2) + '   Count: ' + totalCount);
	}

}, 1000);
