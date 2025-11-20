'use strict';

var utils = require('./utils');

var exports = module.exports;

var attack = require('./primsAttack');
var attrib = require('./primsAttrib');
var counter = require('./primsCounter');
var general = require('./primsGeneral');
var status = require('./primsStatus');
var target = require('./primsTarget');


utils.extend(module.exports, attack, attrib, counter, general, status, target);

// End of File
