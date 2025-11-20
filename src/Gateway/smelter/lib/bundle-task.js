'use strict';

var fs = require('fs');
var util = require('util');
var path = require('path');

var ugliparser = require('uglify-js').parser;
var uglificator = require('uglify-js').uglify;
var browserify = require('browserify');

var errorLog = require('./errorLog');
var mkdirsSync = require('./mkdirsSync');

var bundleTask = {};

bundleTask.init = function(config)
{
	config._count = 0;
}

bundleTask.onFileChanged = function(config)
{
	if(!config.dirty)
	{
		config.dirty = true;
		config._count++;
		setTimeout(function() { updateBundle(config); }, 300)
	}
}

bundleTask.onTrigger = function(config)
{
	if(config.waiting || config.dirty)
		return;

	var wait = false;

	config.dirty = true;

	for(var j = 0; j < config.afterTasks.length; j++)
	{
		if(config.afterTasks[j]._count)
		{
			// We're not ready yet. Wait a bit and try again.
			util.log(util.format('%s %s - Waiting for "%s" to finish %d tasks.', config.prefix, config.name, config.afterTasks[j].name, config.afterTasks[j]._count));
			wait = true;
		}
	}

	if(wait)
	{
		config.waiting = true;
		setTimeout(function() { config.waiting = false; config.dirty = false; bundleTask.onTrigger(config); }, 1000);
	}
	else
	{
		config._count++;
		setTimeout(function() { updateBundle(config); }, 300)
	}
}

//
// Generate a bundle based on an entry point script file (provided on the
//   command line). This does a dependency crawl and all that.
//
function updateBundle(config)
{
	if(config.dirty && config.bundle)
	{
		config.dirty = false;

		var cwd = process.cwd();
		var basedir = path.resolve(process.cwd(), path.dirname(config.bundle));
		if(config.debug)
			console.log('Switching to dir ' + basedir);
		try
		{
			process.chdir(basedir);
		}
		catch(e)
		{
			util.log(util.format('%s %s - Bundle directory doesn\'t exist, skipping.', config.prefix, config.name));
			config._count--;
			return;
		}

		if(config.debug)
			console.log('Actual ' + process.cwd());

		try
		{
			var bundleopts = config.bundleopts || { exports : [ 'require' ] }
			var b = browserify(bundleopts);
			b.addEntry(path.basename(config.bundle));

			if(bundleopts.noGlobals)
			{
				b.prepends = [];
			}

			var s = b.bundle();

			if(config.uglify)
			{
				try
				{
					var ast = ugliparser.parse(s);

					ast = uglificator.ast_lift_variables(ast);

					ast = uglificator.ast_mangle(ast, {
						toplevel: false
						/* except: [ names to not mangle ],    */
						/* defines: { symbolToReplace: value } */
					});


					ast = uglificator.ast_squeeze(ast, {
						make_seqs: true,
						dead_code: true
					});

					s = uglificator.gen_code(ast, {
						beautify: false,
						indent_start: 0,
						indent_level: 4,
						quote_keys: false,
						space_colon: false,
						ascii_only:false,
						inline_script:false
					});
				}
				catch(e)
				{
					errorLog.error(config.name, e.toString(), 'Uglify threw up:');
					config.error = true;
				}
			}
		}
		catch(e)
		{
			if(/Cannot find module/.test(e.toString()))
			{
				util.log(util.format('%s %s - %s', config.prefix, config.name, e.toString()));
				util.log(util.format('%s %s - But the module might show up after a copy. Trying again.', config.prefix, config.name));
				bundleTask.onFileChanged(config);
			}
			else
			{
				errorLog.error(config.name, e.toString(), 'Browserify threw up:');
				config.error = true;
			}

			process.chdir(cwd);
			config._count--;
			return;
		}

		process.chdir(cwd);

		try
		{
			config.out.forEach(function(outfile) {
				mkdirsSync(path.dirname(outfile));
				fs.writeFileSync(outfile, s);
				util.log(util.format('%s %s - Updated bundle: %s', config.prefix, config.name, outfile));
				if (config.debug)
					util.log(util.format('%s %s - %d bytes written', config.prefix, config.name, (new Buffer(s)).length));
			});
		}
		catch(e)
		{
			util.log(util.format('%s %s - Write failed: %s', config.prefix, config.name, util.inspect(e)));
		}

		config._count--;

		if(config._count === 0)
		{
			config.trigger.forEach(function(fn) {
				process.nextTick(fn);
			});
		}
	}
}

module.exports = bundleTask;

// End of File
