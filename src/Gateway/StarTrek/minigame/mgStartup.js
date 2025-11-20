'use strict';

var ui = require('./mgUI');
var mg = require('./mg');
var defs = require('./defs');

module.exports.table = null;

$(document).ready(function () {

	var table = defs.createTable();

	ui.startEventHandlers(table);

	mg.startTurn(table);

	module.exports.table = table;
});



// End of File
