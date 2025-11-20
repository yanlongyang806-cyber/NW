'use strict';
//
// Smelt handlers for stencils
//

var fs = require('fs');
var path = require('path');
var util = require('util');

var StencilMaker = require('./StencilMaker')
var mkdirsSync = require('./mkdirsSync');

var stencilTask = {};

var s_translationStrings = {};

stencilTask.init = function(config)
{
	config._count = 0;
}

stencilTask.onFileChanged = function(config, event, basedir, subdir, filename)
{
	if(!config.dirty)
	{
		config.dirty = true;
		config._count++;
		setTimeout(function() { stencilTask.onTrigger(config); }, 100)
	}
}

stencilTask.onTrigger = function(config)
{
	if(config.dirty && config.files)
	{
		config.dirty = false;

		StencilMaker.clearTranslationStrings();

		var files = Object.keys(config.files).sort();
		var s = "'use strict';\n";
		s += "var Stencils = {};\n";
		s += "Stencils.render = function (name, deref, obj, cb) { return Stencils[name] ? Stencils[name](name, deref, obj,cb) : console.error('Unable to find stencil named \"'+name+'\"'); }\n";

		for(var i in files)
		{
			var basename = path.basename(files[i], path.extname(files[i]));
			var didone = false;

			for(var j in config.watch)
			{
				var src = path.join(config.watch[j], files[i]);
				try
				{
					var stat = fs.statSync(src);
					if(!stat.isDirectory())
					{
						if(didone)
						{
							util.log('WARNING: The stencil filename "' + basename + '" was found in two different locations!');
							basename += 1;
						}

						if(config.debug)
							util.log('Making stencil "' + basename + '" from ' + src);

						s += 'Stencils["' + basename + '"]=\n' + makeStencilForFile(config, src, basename) + ';\n';

						didone = true;
					}
				}
				catch(e)
				{
					// It's not unexpected that a file might be missing if
					//   there are multiple watch directories.
				}
			}
		}
		s += "module.exports = Stencils;\n";

		config.out.forEach(function(outfile) {
			mkdirsSync(path.dirname(outfile));
			fs.writeFileSync(outfile, s);
			util.log(util.format('%s %s - Updated stencils: %s', config.prefix, config.name, outfile));
			if (config.debug)
				util.log(util.format('%s %s - %d bytes written', config.prefix, config.name, s.length));
		});

		var msgs = JSON.stringify(StencilMaker.getTranslationStrings());

		if(config.messages && !config.options.noTranslate)
		{
			config.messages.forEach(function(outfile) {
				mkdirsSync(path.dirname(outfile));
				fs.writeFileSync(outfile, msgs);
				util.log(util.format('%s %s - Updated messages: %s', config.prefix, config.name, outfile));
				if (config.debug)
					util.log(util.format('%s %s - %d bytes written', config.prefix, config.name, s.length));
			});
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

function makeStencilForFile(config, filename, name)
{
	var buf = fs.readFileSync(filename);
	var s = StencilMaker.createStencil(filename, buf.toString(), config.prefix, config.options);
	name = name.replace(/[^a-z0-9_]/gi, '_');
	name = name.replace(/^([^a-z])/, 's$1');
	return StencilMaker.emitStencilAs(s, name);
}

module.exports = stencilTask;

// End of File
