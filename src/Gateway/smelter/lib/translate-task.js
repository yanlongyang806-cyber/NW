'use strict';
//
// Smelt handlers for translation
//

var fs = require('fs');
var path = require('path');
var util = require('util');

var mkdirsSync = require('./mkdirsSync');

var stencil = require('./stencil-task.js');

var translateTask = {};

translateTask.init = function(config)
{
	config._count = 0;
}

translateTask.onFileChanged = function(config, event, basedir, subdir, filename)
{
	if(!config.dirty)
	{
		config.dirty = true;
		config._count++;
		setTimeout(function() { translateTask.onTrigger(config); }, 150)
	}

}

translateTask.onTrigger = function(config)
{
	if(config.dirty && config.files)
	{
		config.dirty = false;

		var allStrs = {};

		var files = Object.keys(config.files).sort();

		for(var i in files)
		{
			var basename = path.basename(files[i], path.extname(files[i]));

			for(var j in config.watch)
			{
				var src = path.join(config.watch[j], files[i]);
				try
				{
					var stat = fs.statSync(src);
					if(!stat.isDirectory())
					{
						if(config.debug)
							util.log('Reading message file "' + basename + '" from ' + src);

						var msgs;
						try
						{
							var buf = fs.readFileSync(src);
							msgs = JSON.parse(buf);
						}
						catch(e)
						{
							config.error = true;
							console.error(e)
							console.error(e.stack);
							config._count--;
							throw e;
						}

						for(var key in msgs)
						{
							if(!allStrs[key])
							{
								allStrs[key] = msgs[key];
							}
						}
					}
				}
				catch(e)
				{
					// It's not unexpected that a file might be missing if
					//   there are multiple watch directories.
				}
			}
		}

		var keys = Object.keys(allStrs).sort();

		var s = '';
		for(i = 0; i < keys.length; i++)
		{
			if(s) s += ',\n';
			s += '\t"' + keys[i] + '": ' + stringForJSON(allStrs[keys[i]].str);
		}
		s = 'module.exports = {\n' + s + '\n}';

		config.out.forEach(function(outfile) {
			if(!outfile) return;

			outfile = path.resolve(outfile);
			mkdirsSync(path.dirname(outfile));

			fs.writeFileSync(outfile, s);
			util.log(util.format('%s %s - Updated default translations: %s', config.prefix, config.name, outfile));
			if (config.debug)
				util.log(util.format('%s %s - %d bytes written', config.prefix, config.name, s.length));
		});

		var msg = '';
		for(i = 0; i < keys.length; i++)
		{
			if(allStrs[keys[i]].doNotPutInMessageFile)
				continue;

			msg += 'Message\n{\n';
			msg += '\tMessageKey ' + keys[i] + '\n';
			msg += '\tScope "Gateway/' + path.basename(allStrs[keys[i]].file, '.html') + '"\n';
			msg += '\tDefaultString ' + stringForTextparser(allStrs[keys[i]].str) + '\n';
			msg += '}\n\n';
		}

		[].concat(config.outmsgfile).forEach(function(outfile) {
			if(!outfile) return;

			outfile = path.resolve(outfile);
			mkdirsSync(path.dirname(outfile));
			fs.writeFileSync(outfile, msg);
			util.log(util.format('%s %s - Updated message file: %s', config.prefix, config.name, outfile));
			if (config.debug)
				util.log(util.format('%s %s - %d bytes written', config.prefix, config.name, s.length));
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

////////////////////////////////////////////////////////////////////////

var reBS = /\\/g;
var reNL = /\n/g;
var reCR = /\r/g;
var reSQ = /'/g;
var reDQ = /"/g;
var reTab = /\t/g;
var reGT = />/g;
var reAmp = /&/g;

//
// stringForJSON
//
// Escapes strings so they can safely live inside of Javascript strings.
//
function stringForJSON(str)
{
	return '"'
		+ str
			.replace(reBS, '\\\\')
			.replace(reSQ, "\\'")
			.replace(reDQ, '\\"')
			.replace(reNL, '\\n')
			.replace(reCR, '\\r')
			.replace(reTab, '\\t')
		+ '"';
}

var reNeedsEscaping = /[\n\r"]/g;

//
// stringForTextparser
//
// Escapes strings so it can safely live inside of Javascript strings.
//
function stringForTextparser(str)
{
	if(reNeedsEscaping.test(str))
	{
		return '<&'
			+ str
				.replace(reBS, '\\\\')
				.replace(reGT, '\\>')
				.replace(reAmp, '\\&')
				.replace(reNL, '\\n')
				.replace(reCR, '\\r')
			+ '&>';
	}
	else
	{
		return '"' + str + '"';
	}
}


////////////////////////////////////////////////////////////////////////

module.exports = translateTask;

// End of File
