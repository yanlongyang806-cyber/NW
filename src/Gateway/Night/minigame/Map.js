'use strict';

var utils = {};
if(typeof deepExtend === 'undefined')
	utils = require('./utils');
else
	utils.deepExtend = deepExtend;

// ----------------------------------------------------------------------------
//
// ----------------------------------------------------------------------------

function Map(heightOrMapObj, width)
{
	this.name = '';
	this.id = '';
	this.width = 0;
	this.height = 0;
	this.tags = '';
	this.tiles = [];
	this.encounters = {};
	this.locations = {};
	this.rooms = {};
	this.roomCount = 0;
	this.showAll = false;
	this.showColors = false;

	if(typeof heightOrMapObj === 'number')
	{
		this.width = width;
		this.height = heightOrMapObj;

		for(var h = 0; h < this.height; h++)
		{
			this.tiles[h] = [];
			for(var w = 0;w < this.width; w++)
			{
				this.tiles[h][w] = { type: '-', colors: [] };
			}
		}
	}
	else
	{
		this.importMap(heightOrMapObj);
	}
}

Map.prototype.importMap = function(mapObj)
{
	utils.deepExtend(this, mapObj);
	this.tiles = [];

	var rows = typeof mapObj.tiles === 'string' ? mapObj.tiles.split(/[\r\n]+/) : [].concat(mapObj.tiles);

	var maxCols = 0;
	for(var r = 0; r < rows.length; r++)
	{
		rows[r] = rows[r].split(/\s+/);
		maxCols = rows[r].length > maxCols ? rows[r].length : maxCols;
	}
	this.height = rows.length;
	this.width = maxCols;

	for(r = 0; r < rows.length; r++)
	{
		this.tiles[r] = [];
		for(var c = 0; c < rows[r].length; c++)
		{
			switch(rows[r][c].charAt(0))
			{
				case 'R':
				case 'H':
					this.fromSelectionFillRect(makeTileSelectionBox(r, c), rows[r][c].charAt(0));
					break;
				default:
					this.tiles[r][c] = { type: '-', colors: [] };
					break;
			}

			for(var i = 1; i < rows[r][c].length; i++)
			{
				if(rows[r][c][i] >= 'a' && rows[r][c][i] <= 'g')
				{
					this.tiles[r][c].colors.push(rows[r][c][i]);
				}
			}
		}
	}

	this.calculateRooms();
}

Map.prototype.exportMap = function()
{
	this.calculateRooms();

	var m = deepExtend({}, this);

	var rows = [];
	for(var r = 0; r < this.tiles.length; r++)
	{
		var cols = [];
		for(var c = 0; c < this.tiles[r].length; c++)
		{
			var s = this.tiles[r][c].type ? this.tiles[r][c].type : '-';
			for(var i = 0; i < this.tiles[r][c].colors.length; i++)
			{
				s += this.tiles[r][c].colors[i];
			}
			cols.push(s);
		}
		rows.push(cols.join(' '));
	}

	m.tiles = rows;

	for(var id in m.encounters)
		delete m.encounters[id].complete;


	return m;
}

Map.prototype.getTileClass = function(r, c)
{
	var ret = '';
	switch(this.tiles[r][c].type)
	{
		case 'H':
			ret = 'hall';
			break;

		case 'R':
			ret = 'room';
			break;
	}

	return ret;
}

// Assign walls, etc.
Map.prototype.generateHTML = function(questState)
{
	var str = [];

	for(var r = 0; r < this.height; r++)
	{
		for(var c = 0; c < this.width; c++)
		{
			if(this.showAll || this.tileVisible(r, c, questState))
			{
				str.push('<div data-row="' + r + '" data-col="' + c +'"');
				str.push(' class="tile ui-selectee');
				str.push(' ' + this.getTileClass(r, c));

				var n = this.lookNorth(r, c);
				var s = this.lookSouth(r, c);
				var w = this.lookWest(r, c);
				var e = this.lookEast(r, c);

				if(!n)
				{
					str.push(' wall-n');
				}
				if(!e)
				{
					str.push(' wall-e');
				}
				if(!s)
				{
					str.push(' wall-s');
				}
				if(!w)
				{
					str.push(' wall-w');
				}
				str.push('">');

				// HALLWAYS ------------------------
				if(this.tiles[r][c].type === 'R')
				{
					var nw = this.lookNorthWest(r, c);
					var ne = this.lookNorthEast(r, c);
					var sw = this.lookSouthWest(r, c);
					var se = this.lookSouthEast(r, c);

					if(n === 'H')
					{
						str.push('<div class="overlay opening open-n"></div>');
					}
					if(e === 'H')
					{
						str.push('<div class="overlay opening open-e"></div>');
					}
					if(s === 'H')
					{
						str.push('<div class="overlay opening open-s"></div>');
					}
					if(w === 'H')
					{
						str.push('<div class="overlay opening open-w"></div>');
					}

					if(n && n !== 'H' && e && e !== 'H' && (!ne || ne === 'H'))
					{
						str.push('<div class="overlay corner corner-ne"></div>');
					}

					if(n && n !== 'H' && w && w !== 'H' && (!nw || nw === 'H'))
					{
						str.push('<div class="overlay corner corner-nw"></div>');
					}

					if(s && s !== 'H' && w && w !== 'H' && (!sw || sw === 'H'))
					{
						str.push('<div class="overlay corner corner-sw"></div>');
					}

					if(s && s !== 'H' && e && e !== 'H' && (!se || se === 'H'))
					{
						str.push('<div class="overlay corner corner-se"></div>');
					}

					// Encounters
					var enc = this.getEncounter(r, c, questState);
					if(enc)
					{
						if(enc.start)
						{
							str.push('<div class="overlay stairs-up"></div>');
						}
						else
						{
							str.push('<div class="overlay ' + (enc.end ? ' boss' : ' encounter') + (enc.complete ? ' complete"' : '"'));
							str.push(' data-encounter-id="' + enc.id + '" data-encounter-tags="' + (enc.taglist || '') + '" data-tt="Tags: ' + enc.tags + '"></div>');
						}
					}
				}

				// Colors
				if(this.showColors)
				{
					for(var i = 0; i < this.tiles[r][c].colors.length; i++)
					{
						str.push(this.tiles[r][c].colors[i]);
					}
				}
			}
			else
			{
				str.push('<div data-row="' + r + '" data-col="' + c +'"');
				str.push(' class="tile ui-selectee');
				str.push('">');
			}

			str.push('</div>');
		}
		str.push('<div class="clear"></div>');
	}

	return str.join('');
}

Map.prototype.generateEncountersHTML = function(questState)
{
	var str = [];

	str.push('<ul>');
	var keys = Object.keys(this.rooms).sort();
	for(var i = 0; i < keys.length; i++)
	{
		var key = keys[i];
		str.push('<li>Room '+key+'<br>');
		str.push('Requires:');
		str.push('<ul>');
		for(var j = 0; j < this.rooms[key].requires.length; j++)
		{
			var e = questState ? questState.encounters[this.rooms[key].requires[j]] : this.encounters[this.rooms[key].requires[j]];
			str.push('<li>');
			str.push('r'+e.row+'c'+e.col+':'+e.color);
			str.push('</li>');
		}
		str.push('</ul>');
		str.push('Opens:');
		str.push('<ul>');
		for(var id in this.rooms[key].opens)
		{
			str.push('<li>')
			str.push(id);
			str.push('</li>')
		}
		str.push('</ul>');
		str.push('</li>');
	}
	str.push('</ul>');

	return str.join('');
}

Map.prototype.tileVisible = function(r, c, questState)
{
	var rooms = this.roomsVisible(questState);

	var t = this.tiles[r][c];
	for(var i = 0; i < t.colors.length; i++)
	{
		if(t.colors[i] in rooms)
		{
			return true;
		}
	}

	return false;
}

Map.prototype.roomsVisible = function(questState)
{
	var visible = {};

	for(var id in this.rooms)
	{
		var room = this.rooms[id];

		if(room.showAlways)
		{
			visible[id] = true;
		}

		if(room.requires.length > 0)
		{
			var bComplete = true;

			for(var i = 0; bComplete && i < room.requires.length; i++)
			{
				var e = questState ? questState.encounters[room.requires[i]] : this.encounters[room.requires[i]];
				bComplete = bComplete && (e.complete || e.start);
			}

			if(bComplete)
			{
				visible[id] = true;
				for(var color in room.opens)
				{
					visible[color] = true;
				}
			}
		}
	}

	return visible;
}

// ----------------------------------------------------------------------------
// Room calculation
// ----------------------------------------------------------------------------

Map.prototype.calculateRooms = function()
{
	this.rooms = {};

	this.colorMapByEncounter();

	// Loop over the map and look to see which colors share tiles with
	// this color. If two colors share a tile, then they are adjacent.
	// All the rooms that are adjacent to a "complete" room will be made
	// visible.
	for(var r = 0; r < this.height; r++)
	{
		for(var c = 0; c < this.width; c++)
		{
			var colors = this.tiles[r][c].colors;
			for(var j = 0; j < colors.length; j++)
			{
				var room = this.rooms[colors[j]] = this.rooms[colors[j]] || { requires: [], opens: {} };
				for(var k = 0; k < colors.length; k++)
				{
					if(j !== k)
					{
						room.opens[colors[k]] = true;
					}
				}
			}
		}
	}

	// Now loop over all the encounters and put them in the room where they
	// live.
	for(var id in this.encounters)
	{
		var color = this.encounters[id].color;
		if(this.rooms[color])
		{
			this.rooms[color].requires.push(id);
			if(this.encounters[id].start)
			{
				this.rooms[color].showAlways = true;
			}
		}
		else
		{
			console.error('Found an encounter without a room!');
		}
	}

	this.roomCount = Object.keys(this.rooms).length;
}

Map.prototype.colorMapByEncounter = function()
{
	var r;
	var c;

	// Clear out all of the auto-calculated rooms
	for(r = 0; r < this.height; r++)
	{
		for(c = 0; c < this.width; c++)
		{
			this.tiles[r][c].colors = this.tiles[r][c].colors.filter(function(val, idx, a) {
				return !(val >= '0' && val <= '9');
			});
		}
	}

	var i = 0;
	// Loop over every encounter, and give the room and the connecting hallways
	// that contains it a color. If there's already a color, then just use it.
	for(var id in this.encounters)
	{
		r = this.encounters[id].row;
		c = this.encounters[id].col;
		if(this.tiles[r][c].colors.length > 0)
			this.encounters[id].color = this.tiles[r][c].colors[0];
		else
		{
			if(i > 9)
			{
				console.log('Too many colors for encoding. Fix it, lazy lazy Shannon.')
			}

			this.encounters[id].color = ''+i;
			i++;
			this.colorMap(r, c, this.encounters[id].color, 'R', 'H');
		}
	}
}

Map.prototype.colorMap = function(r, c, v, typesRoom, typesHall)
{
	if(r < 0 || c < 0 || r >= this.height || c >= this.width)
		return;

	var types = typesRoom+typesHall;

	var t = this.tiles[r][c];
	if(t.colors.indexOf(v) < 0)
	{
		if(types.indexOf(t.type) >= 0)
		{
			t.colors.push(v);

			var a = t.colors.filter(function(v) {
				return (v >= 'a' && v <= 'g');
			});

			if(a.length === 0)
			{
				typesRoom = typesHall.indexOf(t.type) >= 0 ? '' : typesRoom;
				this.colorMap(r-1, c, v, typesRoom, typesHall);
				this.colorMap(r+1, c, v, typesRoom, typesHall);
				this.colorMap(r, c-1, v, typesRoom, typesHall);
				this.colorMap(r, c+1, v, typesRoom, typesHall);
			}
		}
	}
}

// ----------------------------------------------------------------------------
// Map modification
// ----------------------------------------------------------------------------

Map.prototype.fromSelectionFillRect = function(sel, fill)
{
	var box = sel || getSelectionBox();
	if(box.top < 0) return;

	for(var r = box.top; r <= box.bottom; r++)
	{
		for(var c = box.left; c <= box.right; c++)
		{
			this.tiles[r][c] = { type: fill ? fill : '-', colors: [] };
			if(!fill)
			{
				this.removeEncounter(r, c);
			}
		}
	}
}

Map.prototype.fromSelectionFillColor = function(fill, sel)
{
	var box = sel || getSelectionBox();
	if(box.top < 0) return;

	for(var r = box.top; r <= box.bottom; r++)
	{
		for(var c = box.left; c <= box.right; c++)
		{
			if(!fill)
			{
				this.tiles[r][c].colors = [];
			}
			else if(this.tiles[r][c].colors.indexOf(fill) < 0)
			{
				this.tiles[r][c].colors.push(fill)
			}
		}
	}
}

function encID(r, c)
{
	return 'r'+r+'c'+c;
}

Map.prototype.getEncounter = function(r, c, questState)
{
	var id = encID(r, c);
	return questState? questState.encounters[id] : this.encounters[id];
}

Map.prototype.addEncounter = function(r, c, tags, end)
{
	var id = encID(r, c);
	var e = this.encounters[id];
	if(!e)
	{
		e = { id: id, row: r, col: c, tags: '', end: end };
		this.encounters[id] = e;
	}

	e.tags = tags;

	this.calculateRooms();

	return e;
}

Map.prototype.removeEncounter = function(r, c)
{
	delete this.encounters[encID(r, c)];
	this.calculateRooms();
}

Map.prototype.addStart = function(r, c, tags)
{
	var e = this.addEncounter(r, c, tags);
	e.start = true;
	this.calculateRooms();
}

Map.prototype.toggleEncounter = function(r, c)
{
	var e = this.getEncounter(r, c);
	if(e && !e.start)
	{
		e.complete = !e.complete;
	}
}

// ----------------------------------------------------------------------------
// Look around
// ----------------------------------------------------------------------------

Map.prototype.lookDirection = function(r, c, dr, dc)
{
	r = r + dr;
	c = c + dc;

	if(r < 0
		|| r >= this.height
		|| c < 0
		|| c >= this.width
		|| this.tiles[r][c].type === '-')
	{
		return undefined;
	}

	return this.tiles[r][c].type;
}

Map.prototype.lookNorth = function(r, c) { return this.lookDirection(r, c, -1, 0); }
Map.prototype.lookNorthWest = function(r, c) { return this.lookDirection(r, c, -1, -1); }
Map.prototype.lookNorthEast = function(r, c) { return this.lookDirection(r, c, -1, 1); }
Map.prototype.lookSouth = function(r, c) { return this.lookDirection(r, c, 1, 0); }
Map.prototype.lookSouthWest = function(r, c) { return this.lookDirection(r, c, 1, -1); }
Map.prototype.lookSouthEast = function(r, c) { return this.lookDirection(r, c, 1, 1); }
Map.prototype.lookWest = function(r, c) { return this.lookDirection(r, c, 0, -1); }
Map.prototype.lookEast = function(r, c) { return this.lookDirection(r, c, 0, 1); }


function makeTileSelectionBox(r, c)
{
	return {
		top: r,
		bottom: r,
		left: c,
		right: c,
	};
}


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

if(typeof module !== 'undefined' && module.exports)
	module.exports = Map;

///////////////////////////////////////////////////////////////////////////


// End of File
