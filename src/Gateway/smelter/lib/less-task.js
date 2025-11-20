'use strict';
//
// Smelt handlers for LESS
//

var fs = require('fs');
var path = require('path');
var util = require('util');

var less = require('less');
var mkdirsSync = require('./mkdirsSync');
var errorLog = require('./errorLog');

var lessTask = {};

lessTask.init = function(config)
{
	config._count = 0;

	config.roots = [ ];
	if(config.watch)
	{
		for(var i=0; i<config.watch.length; i++)
		{
			try
			{
				config.watch[i] = fs.realpathSync(config.watch[i]);
				var files = fs.readdirSync(config.watch[i]);

				files.forEach(function (filename) {
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

						var stat = fs.statSync(path.resolve(config.watch[i], filename));
						if(!stat.isDirectory())
						{
							config.roots.push(filename);
						}
					}
				});
			}
			catch(e)
			{
				console.error(('Failed to find directory '+config.watch[i]).bold.red);
				console.error(e.message.bold.yellow);
			}
		}
	}


	if(!util.isArray(config.roots))
	{
		config.roots = [ config.roots ];
	}

}

lessTask.onFileChanged = function(config)
{
	if(!config.dirty)
	{
		config.dirty = true;
		config._count++;
		setTimeout(function() { updateLess(config); }, 300)
	}
}

// In order to do the fancy error display we need to feed
// it the src file that broke.
function errorDetailLess(config, src, error)
{
//	console.log("--------------------------------------------------------------------------------");
//	console.log(error);
//	console.log("--------------------------------------------------------------------------------");

	try
	{
		src = path.join(config.watch.toString(), error.filename);
		var src_code = fs.readFileSync(src).toString();
		if(!error.line) error.line = 1;
		if(!error.column) error.column = 1;
		errorLog.detail(config.name, error.message, src, error.line, error.column, src_code, 1);
	}
	catch(e)
	{
		util.log(config.name + ' - ' + e.toString().bold.red);
		util.log(('When trying to show the error detail for '+JSON.stringify(error)).bold.red);
	}
}

// the LESS parser supports the use of @import inside its files
// which means we can simply parse the root file and it will
// @import all appropriate files automatically.
function updateLess(config)
{
	if(config.dirty)
	{
		config.dirty = false;

		config.roots.forEach(function(root) {
			var previous_error = config.files[root].error;
			var lp = new(less.Parser) ({
					paths:  [ config.watch.toString() ],
					filename: root
				});

			var destfilename = path.basename(root, path.extname(root));
			if(config.appendout) destfilename += config.appendout;
			if(config.extout) destfilename += config.extout;

			var src = path.join(config.watch.toString(), root);
			var str;
			try
			{
				str = fs.readFileSync(src).toString();
			}
			catch(e)
			{
				util.log(config.name + ' - ' + e.toString().bold.red);
				config.files[root].error = true;
				config._count--;
				return;
			}

			lp.parse(str, function(err, tree) {
				if(err)
				{
					config.files[root].error = true;
					errorDetailLess(config, src, err);
					config._count--;
					return;
				}

				try
				{
					var res;
					if (config.options)
					{
						res = tree.toCSS(config.options);
					}
					else
					{
						res = tree.toCSS();
					}

					if(config.files[root].error)
					{
						errorLog.fixed(config.name, 'FIXED. -> ' + root);
						config.files[root].error = false;
					}

					config.out.forEach(function(dirname) {
						// strip the filename of the extension
						var dest = path.resolve(dirname, destfilename);
						util.log(util.format('%s %s - Updating %s -> %s', config.prefix, config.name, src, dest));
						mkdirsSync(path.dirname(dest));
						fs.writeFile(dest, res);
					});
				}
				catch(e)
				{
					config.files[root].error = true;
					errorDetailLess(config, src, e);
				}
			});
		});

		config._count--;

		if(config._count === 0)
		{
			config.trigger.forEach(function(fn) {
				process.nextTick(fn);
			});
		}
	}
}

module.exports = lessTask;

// End of File
