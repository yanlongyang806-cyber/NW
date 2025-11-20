"use strict";

var phantom;
var exports;
var module = {};

var require_internal = require;

var require = function(name)
{
	if(/\//.test(name))
	{
		module.exports = {};
		exports = module.exports;

		phantom.injectJs(name);

		return module.exports;
	}
	else
	{
		return require_internal(name);
	}
}
