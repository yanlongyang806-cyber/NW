'use strict';

function randomInt(from, to)
{
	return Math.floor(Math.random() * (to - from + 1)) + from;
}

module.exports = randomInt;

// End of File
