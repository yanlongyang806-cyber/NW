'use strict';

var s_mapList = [];
var s_mapSelected = '';
var s_mapLoaded = '';
var s_mapCurrent = null;

// Setup event hooks etc
$(document).ready(function() {

	$(document).keyup(function(event) {
		// Only look for short cuts when there isnt an input field in focus.
		if(!$('input:focus').length)
		{
			switch(event.keyCode)
			{
				case 27: // esc
					$('.ui-selected').removeClass('ui-selected');
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

				case 65: // a
					fromSelectionFillColor('a');
					break;

				case 66: // b
					fromSelectionFillColor('b');
					break;

				case 67: // c
					fromSelectionFillColor('c');
					break;

				case 68: // d
					fromSelectionFillColor('d');
					break;

				case 69: // e
					fromSelectionFillColor('e');
					break;

				case 70: // f
					fromSelectionFillColor('f');
					break;

				case 71: // g
					fromSelectionFillColor('g');
					break;


				case 72: // h
					fromSelectionMakeHall();
					break;

				case 83: // t
					fromSelectionAddStart();
					break;

				case 84: // t
					fromSelectionToggleEncounter();
					break;

				case 88: // x
					if(event.shiftKey)
					{
						// Shift + x
						addEndEncounterAtSelection();
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
		var text = this.getAttribute('data-tt');
		$('#tooltip').html(text);
		$('#tooltip').css(tooltipPosition($(this)));
		$('#tooltip').show();
	});

	$(document).on('mouseleave', '[data-tt]', function(event) {
		tooltipHide();
	});
	// -----------------------------------------------------------

});


function setMap(map)
{
	s_mapCurrent = map;
	$('#map').html(s_mapCurrent.generateHTML()).selectable({
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
	var box = getSelectionBox();
	if(box.top < 0)
		return;

	s_mapCurrent.removeEncounter(box.top, box.left);

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
	var map = new Map(0, 0);
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

		var buttons = '<a class="icon-button" onclick="if(confirm(\'Are you sure you want '
			+ 'to delete the selected map?\')){deleteSelectedMap(); tooltipHide();}" '
			+ 'data-tt="Delete a map from the map list."><img src="./img/delete-icon.png"></a>';

		buttons += '<a class="icon-button" onclick="copySelectedMap(); tooltipHide();" '
			+ 'data-tt="Make a copy of this map.">'
			+ '<img src="./img/copy-icon.gif"></a>';

		buttons += '<a class="icon-button" onclick="loadSelectedMap(); tooltipHide();" '
			+ 'data-tt="Load the selected card from the card list into the form.">'
			+ '<img src="./img/open-icon.png"></a>';

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

// End of File
