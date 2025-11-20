'use strict';

var Pile = require('./Pile');
var utils = require('./utils');

function Companion(options)
{
	utils.extend(this, options);

	// Expected fields (* are required):
	//		id*
	//		name*
	//		pile* (pile definition string)
	//		level
	//		quality

	this.pile = new Pile(this.id+'-'+this.quality+'-'+this.level, this.pile);
}

Companion.prototype.htmlList = function()
{
	var str = '<div class="companion">';
	str += '<div class="info">';
	str += '<h4 class="name">' + this.name + '</h4>';
	str += '<div class="subinfo">';
	str += ' <span class="quality">' + this.quality + '</span>';
	str += ' <span class="level">' + this.level + '</span>';
	str += '</div>';
	str += '</div>';
	str += this.pile.htmlList();
	str += '</div>';

	return str;
}


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

if(module && module.exports)
	module.exports = Companion;

///////////////////////////////////////////////////////////////////////////

// End of File
