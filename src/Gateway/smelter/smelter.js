'use strict';
//
// Smelter
//
// A generic file watcher which will do stuff to those files when they are
// modified.
//
// It has several "do stuff" modules built in:
//   jspp   - Javascript preprocessor
//   bundle - Use Browserify to bundle (and uglify) code.
//   copy   - Copy files from one location to another (or several)
//
// See example.smelt for an example configuration.
//
var fs = require('fs');
var path = require('path');
var util = require('util');
var colors = require('colors');
var mkdirsSync = require('./lib/mkdirsSync');

//
// The various smelter modules.
//
var jspp = require('./lib/jspp-task');
var copy = require('./lib/copy-task');
var bundle = require('./lib/bundle-task');
var stencil = require('./lib/stencil-task');
var translate = require('./lib/translate-task');
var less = require('./lib/less-task');
var concat = require('./lib/concat-task');


var errors = 0;

var argv = require('optimist')
	.usage('Usage $0 [file] {options}')
	.wrap(78)
	.option('help', {
		alias: 'h',
		desc: 'Show this help.'
	})
	.option('file', {
		alias: 'f',
		desc: 'Sets the input config file.',
		type: 'string'
	})
	.option('once', {
		alias: 'o',
		desc: "Don't watch all the files, just do the build once.",
		type: 'boolean'
	})
	.argv


var s_watching = false;

////////////////////////////////////////////////////////////////////////
var cfile;
if(!argv.file)
{
	cfile = process.cwd();
	while(cfile.length > 3 && !fs.existsSync(path.join(cfile, 'makefile.smelt')))
	{
		cfile = path.join(cfile, '..');
	}
	if(cfile.length <= 3 )
	{
		throw('Unable to find makefile.smelt!');
	}

	argv.file = path.join(cfile, 'makefile.smelt');
}
else
{
	cfile = '';
}

argv.file = path.normalize(argv.file)

util.log('Using smeltfile: ' + argv.file);
var g_configs = eval(fs.readFileSync(argv.file).toString());

// Move to the smeltfile's directory so relative directory names work.
process.chdir(path.dirname(argv.file));
console.log('Chdir to '+process.cwd());


preinitConfig(g_configs);
for(var i = 0; i < g_configs.configs.length; i ++)
{
	initConfig(g_configs.configs[i]);
}

watchConfigs(true);
watchConfigs(false);

if(argv.once)
{
	process.on('exit', function() {
		for(var i=0; i<g_configs.length; i++)
		{
			if(g_configs[i].error)
			{
				process.exit(1);
			}
		}
	});
}


////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
//
//
// If the code flow hits here and we're not watching, the program ends.
//   (Later you will be quizzed on the sound of one hand clapping.)
//
//
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

function preinitConfig(configs)
{
	var i;
	for(i=0; i<configs.length; i++)
	{
		if(configs[i].task === 'global')
		{
			configs.global = configs[i];
		}

		configs[i].trigger = [];
		configs[i].afterTasks = [];
	}

	configs.configs = [];
	configs.configs.push(configs);
	replaceVary({ prefix : 'All' }, configs);

	if(configs.global.includefiles)
	{
		for(i = 0; i < configs.global.includefiles.length; i++)
		{
			var file = path.resolve(cfile, configs.global.includefiles[i].file);
			var c = eval(fs.readFileSync(file).toString());
			c.global = clone(configs.global);
			c.global.vary = configs.global.includefiles[i].vary;

			if(c.global.prefix === 'All')
				c.global.prefix = '$prefix$';

			if(configs.global.includefiles[i].features)
			{
				for(var j = 0; j < c.length; j++)
				{
					if(c[j].feature)
					{
						var keep = false;
						if(c[j].feature in configs.global.includefiles[i].features)
							keep = configs.global.includefiles[i].features[c[j].feature];

						//console.log('In '+configs.global.includefiles[i].vary.prefix+' '+c[j].name+', feature:' + c[j].feature + ', keep '+keep);

						if(!keep)
						{
							c.splice(j, 1);
						}
					}
				}
			}

			replaceVary(c.global.vary, c.global);
			replaceVary(c.global.vary, c);

			configs.configs.push(c);
		}
	}
}

function replaceVary(vary, object)
{
	if(typeof object === 'string')
	{
		// { 'game': 'Core/game', 'login': 'Core/login' }
		var s = object;
		for(var key in vary)
		{
			var re = new RegExp('\\$' + key + '\\$', 'g');
			s = s.replace(re, vary[key]);
		}
		return s;
	}
	else
	{
		var ret;
		if(Array.isArray(object))
		{
			for(var i=0; i<object.length; i++)
			{
				ret = replaceVary(vary, object[i]);
				if(ret)
					object[i] = ret;
			}
		}
		else
		{
			for(var prop in object)
			{
				ret = replaceVary(vary, object[prop]);
				if(ret)
					object[prop] = ret;
			}
		}

		return undefined;
	}
}

function clone(src)
{
	var ret;
	if(typeof src === 'object')
	{
		if(Array.isArray(src))
		{
			ret = [];
			for(var i=0; i < src.length; i++)
			{
				ret[i] = clone(src[i]);
			}
		}
		else
		{
			ret = {};
			for(var prop in src)
			{
				ret[prop] = clone(src[prop]);
			}
		}
	}

	return ret ? ret : src;
}


function initConfig(configs)
{
	for(var i=0; i<configs.length; i++)
	{
		if(configs[i].task === 'global')
		{
			continue;
		}

		if(configs.global)
		{
			for(var prop in configs.global)
			{
				if(prop !== 'name' && prop !== 'task')
				{
					if(util.isArray(configs.global[prop]))
					{
						if(!configs[i][prop])
						{
							configs[i][prop] = [];
						}

						configs[i][prop] = configs.global[prop].concat(configs[i][prop]);
					}
					else
					{
						if(!configs[i][prop])
						{
							configs[i][prop] = configs.global[prop];
						}
					}
				}
			}
		}

		if(!util.isArray(configs[i].out))
		{
			configs[i].out = [ configs[i].out ];
		}

		if(configs[i].watch && !util.isArray(configs[i].watch))
		{
			configs[i].watch = [ configs[i].watch ];
		}

		makeFileMatchers(configs[i]);

		configs[i].files = {};
		configs[i]._watchDirs = {};

		if(configs[i].after)
		{
			if(!util.isArray(configs[i].after))
			{
				configs[i].after = [ configs[i].after ];
			}
		}

		if(configs[i].after)
		{
			configs[i].after.forEach(function(after) {
				var task = findTask(configs, after) || findTask(g_configs.configs[0], after);

				if(task)
				{
					task.trigger.push(configs[i].task.onTrigger.bind(null, configs[i]));
					configs[i].afterTasks.push(task);
				}
				else
				{
					util.log(util.format('DANGER! Task "%s" not found. Specified in "%s".after.', after, configs[i].name))
				}
			});
		}

		if(configs[i].task)
		{
			configs[i].task.init(configs[i]);
		}
	}
}

function findTask(configs, after) {
	for(var j = 0; j < configs.length; j++)
	{
		if(configs[j].name === after)
		{
			return configs[j];
		}
	}
	return undefined;
}

function watchConfigs(doWatch)
{
	util.log('Starting watches...', doWatch)
	for(var i=0; i<g_configs.configs.length; i++)
	{
		var configs = g_configs.configs[i];

		for(var j=0; j<configs.length; j++)
		{
			if(configs[j].task === 'global')
			{
				continue;
			}

			if(configs[j].task && configs[j].watch)
			{
				watchDirs(configs[j], doWatch);
			}
		}
	}
	util.log('Watching.')
}

//
// Watch helpers
//

//
// onFileChanged
//
// Event callback for changed files. Will process the file if it matches
//   one of the approved extensions. Will make subdirectories as needed to
//   match.
//
function onFileChanged(config, event, basedir, subdir, filename)
{
	var src;
	try
	{
		src = path.resolve(basedir, subdir, filename ? filename : '');
	}
	catch(e)
	{
		console.log('basedir: ', basedir);
		console.log('subdir: ', subdir);
		console.log('filename: ', filename);
		throw e;
	}

	if(filename)
	{
		var stat;
		try
		{
			stat = fs.statSync(src);
			if(stat.isDirectory())
			{
				if(!(src in config._watchDirs))
				{
					var	subsubdir = './'+path.join(subdir, filename)
					watchRecursive(config, basedir, subsubdir, true);
					addNewFiles(config, basedir, subsubdir);
				}
				return;
			}
		}
		catch(e)
		{
			util.log(util.format('%s %s - ERROR: %s', config.prefix, config.name, e).bold.red);
			util.log(util.format('%s %s - STACK: %s', config.prefix, config.name, e.stack.toString()).bold.yellow);
			errors++;
			return;
		}

		// If there are no matching filters, accept all files,
		//   otherwise, you must match either the ext or file spec
		if((!config.extmatch && !config.match && !config.matchdir)
			|| (config.extmatch && config.extmatch_re.test(path.extname(filename)))
			|| (config.match && config.match_re.test(filename)))
		{
			// If this extension or file spec is ignored, skip it.
			if((config.extignore && config.extignore_re.test(path.extname(filename)))
				|| (config.ignore && config.ignore_re.test(filename)))
			{
				return;
			}

			try
			{
				var destfilename = path.join(subdir, filename);
				if(destfilename in config.files)
				{
					if(config.files[destfilename].time.getTime() == stat.mtime.getTime())
					{
						return;
					}
				}
				else
				{
					config.files[destfilename] = {};
				}
				config.files[destfilename].time = stat.mtime;

				if(config.task)
				{
					// console.log(config.name, event, basedir, subdir, filename)
					config.task.onFileChanged(config, event, basedir, subdir, filename);
				}
			}
			catch(e)
			{
				util.log(util.format('%s %s - ERROR: %s', config.prefix, config.name, e).bold.red);
				util.log(util.format('%s %s - STACK: %s', config.prefix, config.name, e.stack.toString()).bold.yellow);
				errors++;
			}
		}
	}
}

function addNewFiles(config, basedir, subdir)
{
	var fullpath = path.join(basedir, subdir);
	var files = fs.readdirSync(fullpath);

	files.forEach(function(file) {
		var filename = path.join(subdir, file);
		fullpath = path.join(basedir, filename);

		var stat = fs.statSync(fullpath);
		if(!stat.isDirectory())
		{
			if(!(filename in config.files))
			{
				onFileChanged(config, 'new', basedir, subdir, file);
			}
		}
		else
		{
			var	subsubdir = './'+filename;
			addNewFiles(config, basedir, subsubdir);
		}
	});
}

//
// watchRecursive
//
// Sets up watches for the given basedir and all its subdirectories.
// Non-directories trigger an onFileChanged event.
//
var s_last = '';
var c;
function watchRecursive(config, basedir, subdir, doWatch)
{
	// util.log(util.format('%s - watchRecursive: %s %s %s', config.name, basedir, subdir, doWatch ? 'true' : 'false'));
	if(config.dirignore_re && config.dirignore_re.test(subdir))
	{
		// util.log(util.format('%s - Ignoring: %s for %s', config.name, subdir, config.dirignore_re.toString()).bold.yellow);
		return;
	}

	var traverseOnly = false;
	if(config.dirkeep_re && !config.dirkeep_re.test(subdir))
	{
		//util.log(util.format('%s - Not keeping: %s for %s', config.name, subdir, config.dirkeep_re.toString()).bold.yellow);
		traverseOnly = true;
	}

	var fullpath = path.join(basedir, subdir);
	if(doWatch && !traverseOnly)
	{
		if(!(fullpath in config._watchDirs))
		{
			config._watchDirs[fullpath] = true;

			// util.log(util.format('%s - Watching: %s', config.name, fullpath));
			fs.watch(fullpath, { persistent: true }, function(event, filename) {
				onFileChanged(config, event, basedir, subdir, filename);
			});
		}
	}

	var files = fs.readdirSync(fullpath);
	files.forEach(function (file) {
		var	subsubdir = './' + path.join(subdir, file)
		var stat = fs.statSync(path.join(basedir, subsubdir));
		if (stat.isDirectory())
		{
			watchRecursive(config, basedir, subsubdir, doWatch);
		}
		else if(!doWatch && !traverseOnly)
		{
			onFileChanged(config, 'update', basedir, subdir, file);
		}
	});
}

//
// Set up the file watches for a given config
//
function watchDirs(config, doWatch)
{
	if(config.watch)
	{
		var i;
		for (i=0; i<config.watch.length; i++)
		{
			try
			{
				fs.realpathSync(config.watch[i]);
			}
			catch(e)
			{
				if(e.code === 'ENOENT')
				{
					util.log(util.format('%s %s - Making watch directory: %s', config.prefix, config.name, config.watch[i]));
					mkdirsSync(config.watch[i]);
				}
			}
		}

		for (i=0; i<config.watch.length; i++)
		{
			try
			{
				config.watch[i] = fs.realpathSync(config.watch[i]);
				watchRecursive(config, config.watch[i], './', doWatch);
			}
			catch(e)
			{
				console.error(('Failed to watch '+config.watch).bold.red);
				console.error(e.message.bold.yellow);
			}
		}
	}
}

//
// Make a regexp to match allowed extensions
//
function makeFileMatchers(config)
{
	function extREBuilder(arr)
	{
		var str = '';
		for (var i=0; i<arr.length; i++)
		{
			if(str) str += '|'
			str += '\\.'
			str += arr[i].replace(/^\./, '')+'$';
		}
		return new RegExp(str);
	}
	function matchREBuilder(arr)
	{
		var str = '';
		for (var i=0; i<arr.length; i++)
		{
			if(str) str += '|';
			str += '^'+arr[i]+'$';
		}
		return new RegExp(str);
	}
	function matchdirREBuilder(arr)
	{
		var str = '';
		for (var i=0; i<arr.length; i++)
		{
			if(str) str += '|';
			str += arr[i].replace(/[\\\/]/, '[\\\\/]').replace(/\./, '\\.')+'$';
		}
		return new RegExp(str);
	}

	if(config.extmatch)
	{
		if(!util.isArray(config.extmatch))
		{
			config.extmatch = [ config.extmatch ];
		}
		config.extmatch_re = extREBuilder(config.extmatch);
	}
	if(config.extignore)
	{
		if(!util.isArray(config.extignore))
		{
			config.extignore = [ config.extignore ];
		}
		config.extignore_re = extREBuilder(config.extignore);
	}

	if(config.match)
	{
		if(!util.isArray(config.match))
		{
			config.match = [ config.match ];
		}
		config.match_re = matchREBuilder(config.match);
	}
	if(config.ignore)
	{
		if(!util.isArray(config.ignore))
		{
			config.ignore = [ config.ignore ];
		}
		config.ignore_re = matchREBuilder(config.ignore);
	}

	if(config.dirignore)
	{
		if(!util.isArray(config.dirignore))
		{
			config.dirignore = [ config.dirignore ];
		}
		config.dirignore_re = matchdirREBuilder(config.dirignore);
	}

	if(config.dirkeep)
	{
		if(!util.isArray(config.dirkeep))
		{
			config.dirkeep = [ config.dirkeep ];
		}
		config.dirkeep_re = matchdirREBuilder(config.dirkeep);
	}

	if(config.remap)
	{
		if(util.isArray(config.remap))
		{
			if(!util.isArray(config.remap[0]))
			{
				config.remap = [ config.remap ];
			}
		}
		else
		{
			console.error(config.name+": Remap should be an array of two-element arrays.\n    e.g. remap: [ [ 'from', 'to' ], [ 'from2', 'to2'] ]");
		}

		for(var i = 0; i < config.remap.length; i++)
		{
			var restr = '[\\\\/]'+config.remap[i][0].replace(/\./, '\\.')+'([\\\\/]|$)';
			config.remap[i].regexp = new RegExp(restr);
			config.remap[i].replacement = path.sep+config.remap[i][1]+path.sep;
		}
	}
}

var timesNotBusy = 0;
function checkTasksInternal()
{
	var count = 0;
	for(var i = 0; i < g_configs.configs.length; i++)
	{
		var configs = g_configs.configs[i];
		for(var j = 0; j < configs.length; j++)
		{
			if(typeof configs[j]._count === 'number')
			{
				if(configs[j]._count < 0)
					console.log(configs[j].name.red, configs[j]._count)
				count += configs[j]._count;

				if(configs[j]._count > 0)
					console.log('      '+configs[j].name+' has '+configs[j]._count+' tasks.');
			}
		}
	}

	if(count > 0)
	{
		util.log('' + count + ' Outstanding tasks.');
		timesNotBusy = 0;
		return true;
	}
	else
	{
		timesNotBusy++;
		if(timesNotBusy === 5)
		{
			util.log('***************** Done'.green);
			timesNotBusy = 6;

			if(argv.once)
				process.exit();
		}

		return false;
	}
}

function checkTasks()
{
	if(checkTasksInternal())
	{
		setTimeout(checkTasks, 1000);
	}
	else
	{
		if(!s_watching)
		{
			s_watching = true;
		}

		setTimeout(checkTasks, 200);
	}
}

checkTasks();

// End of File
