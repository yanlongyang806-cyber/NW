'use strict';
//
// StencilMaker
//
// Used to create Stencil functions, which generate HTML complete with all
// of its data references resolved and embedded.
//
// This is separate from Stencil, because it's fat and not needed on the
// client. Instead, the templates are all cooked into stencils, which are
// then handled as code on the client.
//
var htmlparser = require('htmlparser')

var Stencil = require('./Stencil');
var crc32 = require('./crc32');

/////////////////////////////////////////////////////////////////////////

var StencilMaker = {};

var s_options;
var s_curFile;
var s_prefix;

StencilMaker.createStencil = function(filename, str, prefix, options)
{
	s_options = options || { optimize: false, debug: false };
	s_prefix = prefix || '';
	s_curFile = filename;

	s_prefix += '.';

	var code = this.generateCode(str);
	try
	{
		return new Stencil(code);
	}
	catch(e)
	{
		console.error('In stencil ' + filename + ': ' + e);
		console.error(code);
	}
}

StencilMaker.emitStencilAs = function(stencil, name)
{
	var s = stencil.toString().replace(/anonymous/, name);

	return s;
}

var s_translationStrings = {};
StencilMaker.getTranslationStrings = function()
{
	return s_translationStrings;
}

StencilMaker.clearTranslationStrings = function()
{
	s_translationStrings = {};
}

// Accumulators for code and html strings.
//  (Using accumulators makes the generation code easier to read.)
var s_aCode;
var s_aHTML;
var s_inDev;
var s_updateID;

//
// generateCode
//
// Given a string of template HTML, generate a string containing Javascript
// code which will render than template.
//
StencilMaker.generateCode = function(str)
{
	var handler = new htmlparser.DefaultHandler(htmlparserHandler)
	var parser = new htmlparser.Parser(handler);
	parser.parseComplete(str);

	// Generate the code (as text) for this HTML template
	s_aCode = [];
	s_aHTML = [];
	s_inDev = 0;
	s_updateID = 0;


	accumCode("var h=[];d(n,c,h,[");
	this.generateCodeInternal(handler, handler.dom, true, false);
	accumCode("],function(e){x(e,h)});");

	return s_aCode.join('');
}

var reIfDev = /^\s*if\s*\(\s*dev\s*\)/i;
var reEndifDev = /^\s*endif\s*\(\s*dev\s*\)/i;
StencilMaker.generateCodeInternal = function(handler, nodes, translatable, isSampleText)
{
	var self = this;

	nodes.forEach(function (node) {
		switch (node.type)
		{
			case 'text':
				if(translatable && !s_options.noTranslate)
				{
					if(!isSampleText)
					{
						accumTranslatableString(node.data)
					}
					else if(!s_options.optimize)
					{
						accumHTML(node.data);
					}
				}
				else
				{
					accumHTML(node.data);
				}
				break;

			case 'directive':
				accumHTML('<' + node.data + '>');
				break;

			case 'comment':
				if(!s_options.dev)
				{
					if(reIfDev.test(node.data))
					{
						s_inDev++;
					}
				}

				if((node.data.charAt(0) === '[') || (!s_options.optimize))
				{
					accumHTML('<!--' + node.data + '-->');
				}

				if(!s_options.dev)
				{
					if(reEndifDev.test(node.data))
					{
						s_inDev--;
						if(s_inDev < 0)
							s_inDev = 0;
					}
				}

				break;

			default:
				// Any attributes beginning with data- are interesting to us.
				//
				// data-if="stuff"
				// data-if="{stuff} op morestuff"
				//   Looks up "stuff" with the resolver and compares it to
				//     "morestuff". If the comparison is true, then the
				//     children of this element are rendered. Otherwise they
				//     are not. Resolves anything in {}s.
				//
				// data-path="stuff" or
				//   Replaces the element's children, by looking up "stuff"
				//     with the resolver.
				//   When optimizing, this attribute will be left out of the
				//     generated HTML.
				//
				// data-update="path" or
				// data-update="path, path, path"
				//   Indicates that the children of this tag should be updated
				//     when any of the paths (or any of their children) is
				//     modified.
				//   When optimizing, this attribute will be left out of the
				//     generated HTML.
				//
				// data-update-exclude="path" or
				// data-update-exclude="path, path, path"
				//   Indicates that the children of this tag should NOT be updated
				//     when any of the paths (or any of their children) is
				//     modified. Only works in conjunction with data-update.
				//   When optimizing, this attribute will be left out of the
				//     generated HTML.
				//
				// data-set-attribname="complicated{stuff}"
				//   Generates an HTML attribute named attribname, by using
				//     the rules above.
				//   This attribute will not appear in the generated HTML.
				//
				// data-generate="complicated{stuff}"
				//   Replaces the data-generate with the complicated{stuff}
				//   This attribute will not appear in the generated HTML.
				//
				// data-no-translation
				// data-translation-none
				//   Forces strings within the tag to not get translated.
				//   When optimizing, this attribute will be left out of the
				//     generated HTML.
				//
				// data-translation-id
				//   Forces the contents of the tag to be set to the given
				//     translation id. Any children of this tag are not traversed.
				//   When optimizing, this attribute will be left out of the
				//     generated HTML.
				//
				// data-translate-set-attribname="text"
				//   Generate an HTML attribute named attribname with the
				//     translated string.
				//
				// data-translation-html
				//   Gobbles up all the HTML children inside the tag as the
				//     translation string.
				//   When optimizing, this attribute will be left out of the
				//     generated HTML.
				//
				// data-anyothername="whatever"
				// anyotherattrib="whatever"
				//   All other data- attributes and other attributes are left
				//     as-is.
				//
				var closeChildren = false;
				if(node.attribs && node.attribs['data-update'])
				{
					accumCode("{u:{"
						+ " n:'" + s_updateID + "',"
						+ " p:'" + node.attribs['data-update'] + "'");

					if(node.attribs['data-update-exclude'])
					{
						accumCode(", x:'" + node.attribs['data-update-exclude'] + "'");
					}

					accumCode("}");
					s_updateID++;

					closeChildren = true;
				}

				if(node.attribs && node.attribs['data-if'])
				{
					var expr = getManyOperands(node.attribs['data-if']);
					if(!closeChildren)
						accumCode('{');
					else
						accumCode(',');
					accumCode("i:{"
						+ " t:" + JSON.stringify(expr.terms) + ","
						+ " e:'" + escape(expr.expr) + "'"
						+ "}");

					closeChildren = true;
				}

				if(closeChildren)
				{
					accumCode(',\nc:[');
				}

				accumHTML('<' + node.name);

				var a;
				for(a in node.attribs)
				{
					var dataSet = false;
					var res;
					if(a.substr(0, 9) === 'data-set-')
					{
						res = /^data-set-(.*)/.exec(a);
							// 1 = the contents of the attrib, without quotes.

						if(res && res[1])
						{
							accumHTML(' ' + res[1] + '="');
							accumMustachedString(node.attribs[a]);
							accumHTML('"');
							dataSet = true;
						}
					}
					else if(a.substr(0, 19) === 'data-translate-set-')
					{
						res = /^data-translate-set-(.*)/.exec(a);
							// 1 = the contents of the attrib, without quotes.

						if(res && res[1])
						{
							accumHTML(' ' + res[1] + '="');
							accumTranslatableString(node.attribs[a]);
							accumHTML('"');
							dataSet = true;
						}
					}

					if(a === 'data-generate')
					{
						accumHTML(' ');
						accumMustachedString(node.attribs[a]);
					}

					if(!(s_options.optimize
						&& (dataSet
							|| a === 'data-path'
							|| a === 'data-if'
							|| a === 'data-update'
							|| a === 'data-update-exclude'
							|| a === 'data-no-translation'
							|| a === 'data-translation-set'
							|| a === 'data-translation-none'
							|| a === 'data-translation-id'
							|| a === 'data-translation-html')))
					{
						accumHTML(' ' + a + '="' + node.attribs[a] + '"');
					}
				}

				accumHTML('>');

				if(node.attribs && node.attribs['data-path'])
				{
					accumCode("{r:'" + node.attribs['data-path'] + "'");

					if(node.children)
					{
						accumCode(',\nc:[');
						self.generateCodeInternal(handler, node.children, isTranslatable(node), true);

						accumCode(']');
					}
					accumCode('},\n');
				}
				else if(node.attribs && node.attribs['data-translation-id'])
				{
					// Forcibly set the contents of this node to a given
					// translation tag. This will not traverse the children.
					var tag = node.attribs['data-translation-id'];
					var str = tag;
					if(node.children && node.children[0].type === 'text')
					{
						str = node.children[0].data;
					}

					accumCode("{t:'" + tag + "'},\n");
					s_translationStrings[tag] = { file: s_curFile, str: escape(str), doNotPutInMessageFile: true };
				}
				else if(node.attribs && node.attribs['data-translation-html'])
				{
					accumTranslatableString(gobbleChildren(handler, node.children));
				}
				else if(node.children)
				{
					self.generateCodeInternal(handler, node.children, isTranslatable(node), false);
				}

				// Don't output a closing tag if the tag doesn't call for one.
				if(!handler.isEmptyTag(node))
				{
					accumHTML('</' + node.name + '>');
				}

				if(closeChildren)
				{
					accumCode(']},\n');
				}

				break;
		}
	});
}

function gobbleChildren(handler, nodes)
{
	var str = '';
	nodes.forEach(function (node) {
		switch (node.type)
		{
			case 'text':
				str += node.raw;
				break;

			case 'directive':
				str += '<' + node.raw + '>';
				break;

			case 'comment':
				if(!s_options.dev)
				{
					if(reIfDev.test(node.data))
					{
						s_inDev++;
					}
				}

				str += '<!--' + node.raw + '-->';

				if(!s_options.dev)
				{
					if(reEndifDev.test(node.data))
					{
						s_inDev--;
						if(s_inDev < 0)
							s_inDev = 0;
					}
				}
				break;

			default:
				str += '<' + node.raw + '>';

				if(node.children)
				{
					str += gobbleChildren(handler, node.children, str);
				}

				// Don't output a closing tag if the tag doesn't call for one.
				if(!handler.isEmptyTag(node))
				{
					str += '</' + node.name + '>';
				}
				break;
		}
	});

	return str;
}


function isTranslatable(node)
{
	switch(node.name)
	{
		case 'script':
		case 'style':
			return false;
	}

	if(node.attribs && (node.attribs['data-no-translation'] || node.attribs['data-translation-none']))
	{
		return false;
	}

	return true;
}

////////////////////////////////////////////////////////////////////////

var reTrim = /^(\s*)(.*?)(\s*)$/;
function accumTranslatableString(str)
{
	if(!/[a-zA-Z]/.test(str))
	{
		accumHTML(str);
		return;
	}

	//str = str.replace(/[\r\n]+/g, ' ');
	var res = reTrim.exec(str)
	if(!res)
	{
		accumCode("{t:'" + addTranslationString(str) + "'},\n");
	}
	else
	{
		if(res[1])
		{
			accumHTML(res[1]);
		}
		if(res[2])
		{
			accumCode("{t:'" + addTranslationString(res[2]) + "'},\n");
		}
		if(res[3])
		{
			accumHTML(res[3]);
		}
	}
}

function addTranslationString(str)
{
	var tag = crc32(str, 16);

	var res = /([a-z])(.*)([a-z])[^a-z]*$/i.exec(str);
	if(res)
	{
		tag = res[1] + res[2].length + res[3] + '.' + tag;
	}
	else
	{
		tag = 'X' + '.' + tag;
	}

	tag = s_prefix + tag;

	s_translationStrings[tag] = { file: s_curFile, str: str };

	return tag;
}

////////////////////////////////////////////////////////////////////////

function accumMustachedString(str)
{
	var arr = str.split(/[{}]/);
	var i = 0;

	if(arr.length === 1)
	{
		accumCode("{r:'" + escape(str.trim()) + "'},\n");
	}
	else
	{
		while(i < arr.length)
		{
			if(i & 1)
			{
				// Odd entries are inside of curly braces
				accumCode("{r:'" + escape(arr[i].trim()) + "'},\n");
			}
			else
			{
				// Even entries are outside
				accumHTML(arr[i]);
			}

			i++;
		}
	}
}

////////////////////////////////////////////////////////////////////////

var reCRWhitespace = /([\r\n]+)[ \t]*/g;
var reWhitespace = /[ \t]+/g;

function accumCode(str)
{
	if(s_inDev)
		return;

	if(s_aHTML.length)
	{
		var html = s_aHTML.join('');
		s_aHTML = [];

		if(s_options.optimize)
		{
			html = html.replace(reCRWhitespace, '\n');
			html = html.replace(reWhitespace, ' ');
		}
		html = escape(html);

		s_aCode.push("{s:'" + html + "'},\n");
	}

	// If we're closing an array, check the previous code that was pushed.
	// If it ends in a trailing comma, remove that comma.
	// OMG, this is such a hack.
	if(str.charAt(0) === ']')
	{
		var last = s_aCode[s_aCode.length-1];
		var reTrailingComma = /,(\s*)$/;
		s_aCode[s_aCode.length-1] = last.replace(reTrailingComma, '$1');
	}

	s_aCode.push(str);
}

function accumHTML(str)
{
	if(s_inDev)
		return;

	s_aHTML.push(str);
}


////////////////////////////////////////////////////////////////////////

var reBS = /\\/g;
var reNL = /\n/g;
var reCR = /\r/g;
var reSQ = /'/g;
var reDQ = /"/g;
var reTab = /\t/g;

//
// escape
//
// Escapes HTML so it can safely live inside of Javascript strings.
//
function escape(str)
{
	return str
		.replace(reBS, '\\\\')
		.replace(reSQ, "\\'")
		.replace(reDQ, '\\"')
		.replace(reNL, '\\n')
		.replace(reCR, '\\r')
		.replace(reTab, '\\t');
}

////////////////////////////////////////////////////////////////////////

var opsStr = "== != eq ne lt le gt ge is".split(' ').join('|');
var reIfExpr = new RegExp('(.+)\\s('+opsStr+')\\s(.*)');
function getOperands(str)
{
	var ret = {
		terms: [ str ],
		expr: 'r[0]'
	};

	var res = reIfExpr.exec(str);
	if(res)
	{
		ret.terms = [ res[1] ];

		if(res[2])
		{
			ret.expr += ' ' + res[2];
		}

		if(res[3])
		{
			var reLiterals = new RegExp("^(true|false|[+0-9]|-|'(.*)')");
			if(reLiterals.test(res[3]))
			{
				ret.expr += ' '+res[3];
			}
			else
			{
				ret.expr += ' r[1]';
				ret.terms.push(res[3]);
			}
		}
	}

	return ret;
}

var opsSrc  = "eq ne lt le gt ge is".split(' ');
var opsDest = "=== != < <= > >= ==".split(' ');
function getManyOperands(str)
{
	var ret;

	if(!/[{]/.test(str))
	{
		ret = getOperands(str);
	}
	else
	{
		var b = [];
		var expr = '';

		while(str)
		{
			var re = /([^{]*)\{([^}]*)\}(.*)/;
			var res = re.exec(str);
			if(res)
			{
				expr += res[1];
				if(res[2])
				{
					expr += 'r['+b.length+']';
					b.push(res[2]);
				}
				str = res[3];
			}
			else
			{
				expr += str;
				str = '';
			}
		}

		ret = {
			terms: b,
			expr: expr
		};
	}

	ret.expr = ret.expr.replace(new RegExp(' ' + opsSrc.join(' | ') + ' ', 'g'), function(match, offset, string) {
		return opsDest[opsSrc.indexOf(match.trim())];
	});

	return ret;
}


////////////////////////////////////////////////////////////////////////

function htmlparserHandler(error, dom)
{
	if(error)
	{
		console.error(error);
	}
	else
	{
		// Everything is OK!
	}
}

////////////////////////////////////////////////////////////////////////

module.exports = StencilMaker;

// End of File
