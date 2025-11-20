'use strict';
//
// Smelt handlers for concatenation
//

var fs = require('fs');
var path = require('path');
var util = require('util');

var mkdirsSync = require('./mkdirsSync');

var ugliparser = require('uglify-js').parser;
var uglificator = require('uglify-js').uglify;

var concatTask = {};

concatTask.init = function(config)
{
	config._count = 0;
}

concatTask.onFileChanged = function(config, event, basedir, subdir, filename)
{
	if(!config.dirty)
	{
		config.dirty = true;
		config._count++;
		setTimeout(function() { updateConcats(config); }, 150)
	}
}

function updateConcats(config)
{
	if(config.dirty && config.files)
	{
		config.dirty = false;

		var files = Object.keys(config.files).sort();

		var contents = [];
		files.forEach(function(filename) {
			// TODO: This only supports a single source directory.
			contents.push(new Buffer('/* ' + filename + '*/\n'));
			filename = path.resolve(config.watch[0], filename);
			contents.push(fs.readFileSync(filename));
			contents.push(new Buffer('\n'));
		});
		contents = Buffer.concat(contents).toString();

		if(config.uglify)
		{
			try
			{
				var ast = ugliparser.parse(contents);

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

				contents = uglificator.gen_code(ast, {
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
				util.error(config.name, e.toString(), 'Uglify threw up:');
				config.error = true;
			}
		}

		config.out.forEach(function(outfile) {
			outfile = path.resolve(outfile);
			mkdirsSync(path.dirname(outfile));

			fs.writeFileSync(outfile, contents);
			util.log(util.format('%s %s - Updated concatted file: %s', config.prefix, config.name, outfile));
			if (config.debug)
				util.log(util.format('%s %s - %d bytes written', config.prefix, config.name, contents.length));
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

module.exports = concatTask;

// End of File
