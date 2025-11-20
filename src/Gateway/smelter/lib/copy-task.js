'use strict';
//
// Smelter handlers for copying files.
//
var fs = require('fs');
var path = require('path');
var util = require('util');
var async = require('async');
var colors = require('colors');
var mkdirsSync = require('./mkdirsSync');

var copyTask = {};

var s_countCopying = 0;
var s_queue = [];
var MAX_COPIES = 30;

//
// Copy the updated file to the configured director(y|ies).
//
copyTask.init = function(config)
{
	config._count = 0;
}

//
// Copy the updated file to the configured director(y|ies).
//
copyTask.onFileChanged = function(config, event, basedir, subdir, filename)
{
	config.out.forEach(function(dirname) {
		config._count++;
	});

	if(s_countCopying > MAX_COPIES)
	{
		s_queue.push([ config, event, basedir, subdir, filename ]);
		return;
	}

	copyTask.copyIt(config, event, basedir, subdir, filename);
}

copyTask.copyIt = function(config, event, basedir, subdir, filename)
{
	var src = path.resolve(basedir, subdir, filename);

	if(config.remap)
	{
		config.remap.forEach(function(remap) {
			subdir = subdir.replace(remap.regexp, remap.replacement);
		});
	}

	var inStream = fs.createReadStream(src);

	inStream.on('error', function(e) {
		console.error(e.toString().bold.red);
		console.error('Continuing...'.bold.yellow)
	})

	config.out.forEach(function(dirname) {
		mkdirsSync(path.resolve(dirname, subdir));
		var destfilename = path.join(subdir, filename);
		var dest = path.resolve(dirname, destfilename);

		var outStream = fs.createWriteStream(dest);
		inStream.pipe(outStream);
		s_countCopying++;

		outStream.on('finish', function() {
			var msg;
			if(config.debug)
			{
				msg = util.format('%s %s - Copied %s to %s', config.prefix, config.name, src, dest);
				util.log(msg);
			}

			config._count--;
			s_countCopying--;
			if(s_countCopying <= MAX_COPIES && s_queue.length)
			{
				var args = s_queue.shift();
				copyTask.copyIt.apply(null, args);
			}

			if(s_countCopying === 0)
			{
				util.log('Done copying all the things.');
			}

			if(config._count === 0)
			{
				config.trigger.forEach(function(fn) {
					fn();
				});
			}
		});

		outStream.on('error', function(e) {
			config._count--;
			s_countCopying--;
			if(!/node\.exe/.test(e))
			{
				console.error(e.toString().bold.red);
				console.error('Continuing...'.bold.yellow)
			}

			if(config._count === 0)
			{
				config.trigger.forEach(function(fn) {
					fn();
				});
			}

		});
	});
}


module.exports = copyTask;

// End of File
