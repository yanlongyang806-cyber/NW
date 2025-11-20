'use strict';

var s_mapList = [];
var s_mapSelected = '';
var s_mapLoaded = '';
var s_mapCurrent = null;

// Setup event hooks etc
$(document).ready(function() {

	$(document).keyup(function(event) {

		var numberMap = {
			49: 'a',
			50: 'b',
			51: 'c',
			52: 'd',
			53: 'e',
			54: 'f',
			55: 'g',
			56: 'h',
			57: 'i',
			48: ''
		}

		// Only look for short cuts when there isnt an input field in focus.
		if(!$('input:focus').length)
		{
			tooltipHide();
			switch(event.keyCode)
			{
				case 27: // esc
					$('.ui-selected').removeClass('ui-selected');
					if($('#encounter-tags-edit').length)
					{
						tooltipHide();
					}
					break;

				case 82: // r
					if(event.shiftKey)
					{
						// Shift + r

					}
					else
					{
						fromSelectionMakeRoom();
					}
					break;

				case 49: // 1
				case 50: // 2
				case 51: // 3
				case 52: // 4
				case 53: // 5
				case 54: // 6
				case 55: // 7
				case 56: // 8
				case 57: // 9
				case 48: // delete color
					fromSelectionFillColor(numberMap[event.keyCode]);
					break;

				case 67: // c
					$('#color').click();
					break;

				case 71: // g
					$('#grid').click();
					break;

				case 72: // h
					fromSelectionMakeHall();
					break;

				case 83: // s
					if(event.shiftKey)
					{
						// Shift + s
						fromSelectionAddExit();
					}
					else
					{
						fromSelectionAddStart();
					}
					break;

				case 84: // t
					fromSelectionToggleEncounter();
					break;

				case 86: // v
					$('#visible').click();
					break;

				case 88: // x
					if(event.ctrlKey)
					{
						return;
					}
					else if(event.shiftKey)
					{
						// Shift + x
						addEndEncounterAtSelection();
					}
					else if(event.altKey)
					{
						// Alt + x
						removeEncountersAtSelection();
					}
					else
					{
						addEncounterAtSelection();
					}
					break;

				case 8: // bksp
				case 46: // del
				case 110: // numeric pad .
					fromSelectionEraseAll();
					break;

			}

			console.log(event.keyCode);
		}

	});

	getMapListFromLocalStorage();
	updateMapList();

	// Card selection (for picking which one to load)
	$(document).on('click', '#maplist .maplist-entry', function(event) {
		selectMapEntryById($(this).attr('data-mapid'));
	})

	// -----------------------------------------------------------
	// For Tooltips
	//
	$(document).on('mouseenter', '[data-tt]', function(event) {
		if(!$('#encounter-tags-edit').length)
		{
			var text = this.getAttribute('data-tt');
			$('#tooltip').html(text);
			$('#tooltip').css(tooltipPosition($(this)));
			$('#tooltip').show();
		}
	});

	$(document).on('mouseleave', '[data-tt]', function(event) {
		if(!$('#encounter-tags-edit').length)
		{
			tooltipHide();
		}
	});
	// -----------------------------------------------------------


	$(document).on('contextmenu', '[data-encounter-tags]', function() {
		var text = this.getAttribute('data-encounter-tags');
		$('#tooltip').html(tagEditForm(this.getAttribute('data-encounter-id'),
			this.getAttribute('data-encounter-tags'),
			this.getAttribute('data-encounter-opens')));
		$('#tooltip').css(tooltipPosition($(this)));
		$('#tooltip').show();
		$('#encounter-tags-edit').focus();

		return false;
	});

	$(document).on('keyup', '#encounter-tags-edit', function(event) {
		switch(event.keyCode)
		{
		case 27: // esc
		case 13: // Enter
			tooltipHide();
			break;

		default:
			// update tags with current
			var input = $('#encounter-tags-edit');
			var e = s_mapCurrent.encounters[input.attr('data-enc-id')];
			e['tags'] = input.val();

			updateEncounterElem(input, e);
			break;
		}
	});

	$(document).on('keyup', '#encounter-opens-edit', function(event) {
		switch(event.keyCode)
		{
		case 27: // esc
		case 13: // Enter
			tooltipHide();
			break;

		default:
			// update opens with current
			var input = $('#encounter-opens-edit');
			var e = s_mapCurrent.encounters[input.attr('data-enc-id')];
			e['alsoOpens'] = input.val();

			updateEncounterElem(input, e);
			break;
		}
	});

});

function updateEncounterElem(elem, enc)
{
	$('.overlay[data-encounter-id="' + elem.attr('data-enc-id') + '"]')
		.attr('data-encounter-tags', (enc['tags'] || ''))
		.attr('data-encounter-opens', (enc['alsoOpens'] || ''))
		.attr('data-tt', 'Tags: ' + (enc['tags'] || '(none)')
			+ '<br>'
			+ 'Opens: ' + (enc['alsoOpens'] || '(none)'));
}


function tagEditForm(encId, tags, opens)
{
	return 'Tags: <input id="encounter-tags-edit" data-enc-id="' + encId + '" type="text" value="' + tags + '">'
		+ 'Opens: <input id="encounter-opens-edit" data-enc-id="' + encId + '" type="text" value="' + opens + '">';
}


function setMap(map)
{
	s_mapCurrent = map;
	s_mapCurrent.showAll = true;
	$('#map').html(s_mapCurrent.generateHTML()).selectable({
		start: function( event, ui ) {
			$('input').blur();
		},
		stop: function( event, ui ) {
			var t, e = $('.encounter.ui-selected');
			if(e.length)
			{
				t = $(e[0]).attr('data-encounter-tags') || '';
				$('input[name="encounter-tags"]').val(t);
			}
		}
	});
}

function setGrid(map)
{
	$('#map-grid').html(map.generateHTML(false, true));

	$('#map-grid div[data-row="0"]').each(function() {
		$(this).append('<span class="column-number">' + $(this).attr('data-col') + '</span>');
	});

	$('#map-grid div[data-col="0"]').each(function() {
		$(this).append('<span class="row-number">' + $(this).attr('data-row') + '</span>');
	});

}

// ----------------------------------------------------------------------------
// Tooltip stuff
// ----------------------------------------------------------------------------


// Make sure the tooltip is on the side of the item nearest the middle of the browser window.
// This prvents tooltips being drawn that could extend off screen
function tooltipPosition(jqElem)
{

	var pos = jqElem.offset();
	var height = $(window).height();
	var width = $(window).width();

	var ret = {top:'',left:'',bottom:'',right:''};

	// Horizontal padding to space the tooltip away from the element
	var h_pad = 5;

	// Is the element on the top half of the window, or the bottom half?
	if(((pos.top + jqElem.outerHeight()) - window.pageYOffset) > (height / 2))
	{
		// Tooltip aligned bottom
		ret['bottom'] = height - pos.top - jqElem.outerHeight();
	}
	else
	{
		// Tooltip aligned top
		ret['top'] = pos.top;
	}

	// Is the element on the left half of the window, or the right?
	if((pos.left + jqElem.outerWidth(true)) > (width / 2))
	{
		// Tooltip left of the element
		ret['right'] = width - pos.left + h_pad;
	}
	else
	{
		// Tooltip right of the element
		ret['left'] = pos.left + jqElem.outerWidth(true) + h_pad;
	}

	return ret;
}

function tooltipHide() {
	$('#tooltip').empty();
	$('#tooltip').hide();
	$('#tooltip').css({top:'',left:'',bottom:'',right:''});
}

// ----------------------------------------------------------------------------
//
// ----------------------------------------------------------------------------

function getSelectionBox()
{
	var rTop = -1, rBot = -1, cLeft = -1, cRight = -1;
	var rNow, cNow;
	var tiles = $('.tile.ui-selected');

	tiles.each(function() {
		rNow = parseInt($(this).attr('data-row'), 10);
		cNow = parseInt($(this).attr('data-col'), 10);

		// Top is lower numbers
		if(rTop === -1) rTop = rNow;
		else if(rNow < rTop) rTop = rNow;

		// Bottom is higher numbers
		if(rBot === -1) rBot = rNow;
		else if(rNow > rBot) rBot = rNow;

		// Left is lower numbers
		if(cLeft === -1) cLeft = cNow;
		else if(cNow < cLeft) cLeft = cNow;

		// Right is higher numbers
		if(cRight === -1) cRight = cNow;
		else if(cNow > cRight) cRight = cNow;
	});

	return {
		top: rTop,
		bottom: rBot,
		left: cLeft,
		right: cRight
	};
}


// ----------------------------------------------------------------------------
// Map modification API
// ----------------------------------------------------------------------------

function fromSelectionMakeRoom()
{
	var box = getSelectionBox();
	s_mapCurrent.fromSelectionFillRect(box, 'R');
	s_mapCurrent.calculateRooms();

	$('#map').html(s_mapCurrent.generateHTML());
}

function fromSelectionMakeHall()
{
	var box = getSelectionBox();
	s_mapCurrent.fromSelectionFillRect(box, 'H');
	s_mapCurrent.calculateRooms();

	$('#map').html(s_mapCurrent.generateHTML());
}

function fromSelectionEraseAll()
{
	var box = getSelectionBox();
	s_mapCurrent.fromSelectionFillRect(box, undefined);
	s_mapCurrent.calculateRooms();

	$('#map').html(s_mapCurrent.generateHTML());
}

function fromSelectionFillColor(fill)
{
	var box = getSelectionBox();
	s_mapCurrent.fromSelectionFillColor(fill, box);
	s_mapCurrent.calculateRooms();

	$('#map').html(s_mapCurrent.generateHTML());
}

function colorMapByEncounter()
{
	s_mapCurrent.calculateRooms();

	$('#map').html(s_mapCurrent.generateHTML());
	$('#encounters').html(s_mapCurrent.generateEncountersHTML());
}

function addEndEncounterAtSelection()
{
	var box = getSelectionBox();
	if(box.top < 0)
	{
		alert('You need to select a tile for this encounter');
	}

	var tags = $('input[name="encounter-tags"]').val() || '';
	s_mapCurrent.addEncounter(box.top, box.left, tags, true);

	$('#map').html(s_mapCurrent.generateHTML());
}


function addEncounterAtSelection()
{
	var box = getSelectionBox();
	if(box.top < 0)
	{
		alert('You need to select a tile for this encounter');
	}

	var tags = $('input[name="encounter-tags"]').val() || '';
	s_mapCurrent.addEncounter(box.top, box.left, tags);

	$('#map').html(s_mapCurrent.generateHTML());
}

function removeEncountersAtSelection()
{
	$('.encounter.ui-selected, .boss.ui-selected, .stairs-up.ui-selected').each(function() {
		var tile = $(this).closest('.tile');
		s_mapCurrent.removeEncounter(tile.attr('data-row'), tile.attr('data-col'));
		$(this).remove();
	})

	$('#map').html(s_mapCurrent.generateHTML());
}

function fromSelectionToggleEncounter()
{
	var box = getSelectionBox();
	if(box.top < 0)
		return;

	s_mapCurrent.toggleEncounter(box.top, box.left);

	$('#map').html(s_mapCurrent.generateHTML());
}

function fromSelectionAddStart()
{
	var box = getSelectionBox();
	if(box.top < 0)
		return;

	var tags = $('input[name="encounter-tags"]').val() || '';

	s_mapCurrent.addStart(box.top, box.left, tags);

	$('#map').html(s_mapCurrent.generateHTML());
}

function fromSelectionAddExit()
{
	var box = getSelectionBox();
	if(box.top < 0)
		return;

	var tags = $('input[name="encounter-tags"]').val() || '';

	s_mapCurrent.addExit(box.top, box.left, tags);

	$('#map').html(s_mapCurrent.generateHTML());
}

function fromSelectionAddEnd()
{
	var box = getSelectionBox();
	if(box.top < 0)
		return;

	s_mapCurrent.addEnd(box.top, box.left);

	$('#map').html(s_mapCurrent.generateHTML());
}

function toggleVisibility()
{
	s_mapCurrent.showAll = !s_mapCurrent.showAll;

	if(s_mapCurrent.showAll)
		$('#hiding').hide();
	else
		$('#hiding').show();

	$('#map').html(s_mapCurrent.generateHTML());
}

function toggleColors()
{
	s_mapCurrent.showColors = !s_mapCurrent.showColors;

	$('#map').html(s_mapCurrent.generateHTML());
}

function toggleGrid(checked)
{
	if(checked)
	{
		$('#map-grid').show();
	}
	else
	{
		$('#map-grid').hide();
	}
}

// ----------------------------------------------------------------------------
// Data Stuff
// ----------------------------------------------------------------------------

function saveMap()
{
	if($('input[name="map-name"]').val())
	{
		saveDisplayMap();
		updateMapList();
//		$('#copy-box').show();
//		$('#copy-text').text(JSON.stringify(map, null, "\t")).select();
	}
	else
	{
		alert('You need to give this map a name if you want to save it.');
	}
}

function saveDisplayMap()
{
	s_mapCurrent.name = $('input[name="map-name"]').val();
	s_mapCurrent.tags = $('input[name="map-tags"]').val();
	s_mapCurrent.id = normalizeName(s_mapCurrent.name);

	var map = s_mapCurrent.exportMap();

	removeMapFromMapListById(s_mapLoaded);
	s_mapLoaded = map.id;

	s_mapList.push(map);
	saveMapListToLocalStorage();

	return map;
}

function removeMapFromMapListById(id)
{
	var m;
	for(m = 0;m < s_mapList.length; m++)
	{
		if(s_mapList[m].id === id)
		{
			s_mapList.splice(m, 1);
			return;
		}
	}
}

function getMapFromMapListById(id)
{
	var m;
	for(m = 0;m < s_mapList.length; m++)
	{
		if(s_mapList[m].id === id)
		{
			return s_mapList[m];
		}
	}

	return false;
}

function loadMapIntoEditor(mapObj)
{
	var map = new Layout(0, 0, true);
	map.importMap(mapObj);
	map.showAll = true;
	$('#hiding').hide();

	setMap(map);
	$('input[name="map-name"]').val(map.name);
	$('input[name="map-tags"]').val(map.tags);
	s_mapLoaded = map.id;

	$('.maplist-entry')
		.removeClass('loaded')
		.filter('[data-mapid="' + map.id + '"]')
		.addClass('loaded');
}

function saveMapListToLocalStorage()
{
	localStorage.setItem('mapList', JSON.stringify(s_mapList));
}

function getMapListFromLocalStorage()
{

	var str = localStorage.getItem('mapList');
	if(str)
	{
		s_mapList = JSON.parse(str);
	}
	else
	{
		s_mapList = [];
	}
	return s_mapList;
}

function normalizeName(name)
{
	return name.replace(/\s\'/g,'_');
}

// ----------------------------------------------------------------------------
// Map List UI
// ----------------------------------------------------------------------------

function updateMapList()
{
	var html = '', m;

	s_mapList.sort(function(a, b) {
		if(a.name > b.name)
			return 1;
		else
			return -1;
	});

	for(m = 0; m < s_mapList.length; m++)
	{
		html += '<div class="maplist-entry';
		if(s_mapLoaded === s_mapList[m]['id'])
		{
			html += ' loaded';
		}
		html += '" data-mapid="' + s_mapList[m]['id'] + '">' + s_mapList[m]['name'] + '</div>';
	}
	$('#maplist').html(html);

}

function selectMapEntryById(id)
{
	// Clear any previous selection
	$('.maplist-entry').removeClass('selected').find('a').remove();

	var elem = $('#maplist [data-mapid="' + id + '"]');

	if(elem)
	{
		elem.addClass('selected');
		s_mapSelected = id;

		var buttons = '<a class="icon-button red" onclick="if(confirm(\'Are you sure you want '
			+ 'to delete the selected map?\')){deleteSelectedMap(); tooltipHide();}" '
			+ 'data-tt="Delete a map from the map list.">r</a>';

		buttons += '<a class="icon-button" onclick="copySelectedMap(); tooltipHide();" '
			+ 'data-tt="Make a copy of this map.">2</a>';

		buttons += '<a class="icon-button" onclick="loadSelectedMap(); tooltipHide();" '
			+ 'data-tt="Load the selected card from the card list into the form.">1</a>';

		elem.append(buttons);
	}
}

function deleteSelectedMap()
{
	var mapid = $('.maplist-entry.selected').attr('data-mapid');
	if(mapid)
	{
		removeMapFromMapListById(mapid);
		updateMapList();
	}
	else
	{
		console.error("deleteSelectedMap(): mapid not found.");
	}
}

function copySelectedMap()
{
	var mapid = $('.maplist-entry.selected').attr('data-mapid');
	if(mapid)
	{
		var newMap = {};
		$.extend(newMap, getMapFromMapListById(mapid));

		newMap['id'] = newMap['id'] + '_COPY';
		newMap['name'] = newMap['name'] + ' COPY';
		s_mapList.push(newMap);

		updateMapList();
	}
	else
	{
		console.error("copySelectedMap(): mapid not found.");
	}
}

function loadSelectedMap()
{
	var mapid = $('.maplist-entry.selected').attr('data-mapid');
	if(mapid)
	{
		loadMapIntoEditor(getMapFromMapListById(mapid));
	}
	else
	{
		console.error("loadSelectedMap(): mapid not found.");
	}
}

// ----------------------------------------------------------------------------
// Import/Export UI
// ----------------------------------------------------------------------------

function exportMapList()
{
	$('#copy-box').show();
	$('#copy-text').val(JSON.stringify(s_mapList, null, "\t")).select();
	$('#copy-box-name').text('MapListExport.json');
	$('#copy-box-import').hide();
	$('#copy-box-import-thingy').hide();

}

function importMapListPrompt()
{
	$('#copy-box').show();
	$('#copy-text').val('');
	$('#copy-box-name').text('MapListImport.json');
	$('#copy-box-import').show();
	$('#copy-box-import-thingy').show();
}

function importMapListFromCopyBox()
{
	var list = $('#copy-text').val();
	list = JSON.parse(list);
	s_mapList = list;
	s_mapLoaded = '';
	s_mapSelected = '';
	updateMapList();
}

function importMapPicture()
{
	var str = $('#copy-text').val();
	s_mapLoaded = '';
	s_mapSelected = '';

	var map = new Map(0, 0);
	map.importMap(str);
	setMap(map);
}


// ----------------------------------------------------------------------------


function changeTileset(tileset)
{
	$('.dungeon-map').removeClass('dungeon forest parchment-01 parchment-02').addClass(tileset);
}

// End of File
