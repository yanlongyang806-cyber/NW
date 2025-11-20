'use strict';
//
// Smelt handlers for jspp
//

var fs = require('fs');
var path = require('path');
var util = require('util');
var jshint = require('jshint').JSHINT;

var jspp = require('./jspp')
var mkdirsSync = require('./mkdirsSync');
var errorLog = require('./errorLog');

var jsppTask = {};

jsppTask.init = function(config)
{
	config._count = 0;

	config.defines = {}
	if(config.include)
	{
		if(!util.isArray(config.include))
		{
			config.include = [ config.include ]
		}

		config.include.forEach(function(include) {
			include = fs.realpathSync(include);
			util.log(util.format('%s %s - Including defines from %s', config.prefix, config.name, include));
			jspp.processDefines(fs.readFileSync(include).toString(), config.defines);
		});
	}
}

jsppTask.onFileChanged = function(config, event, basedir, subdir, filename)
{
	config._count++;
	var src = path.resolve(basedir, subdir, filename);

	var buf = fs.readFileSync(src).toString();

	if(config.jshint && !/-min/.test(src)) // Don't jshint files with -min in their names. Minimized files are assumed delinted.
	{
		var buf2 = buf.replace(/\n#/g, '\n//#');
		if(!jshint(buf2,config.jshopt))
		{
			var e = jshint.errors;
			e.forEach(function(err) {
				if(err) // If too many errors, the last error is null
				{
					errorLog.detail(config.name, err.reason, src, err.line, err.character, buf)
				}
			});
		}
	}

	jspp.setFilename(src);
	var s = jspp.processScript(buf, config.defines);

	if(config.remap)
	{
		config.remap.forEach(function(remap) {
			subdir = subdir.replace(remap.regexp, remap.replacement);
		});
	}

	var destfilename = path.join(subdir, path.basename(filename, path.extname(filename)))+config.extout;

	config.out.forEach(function(dirname) {
		// strip the filename of the extension
		var dest = path.resolve(dirname, destfilename);
		util.log(util.format('%s %s - Updating %s -> %s', config.prefix, config.name, src, dest));
		mkdirsSync(path.resolve(dirname, subdir));
		fs.writeFileSync(dest, s);
	});

	config._count--;

	if(config._count === 0)
	{
		config.trigger.forEach(function(fn) {
			process.nextTick(fn);
		});
	}
}

module.exports = jsppTask;

// End of File
