"use strict";

///////////////////////////////////////////////////////////////////////////////
//
// Initial Variables and setup
//

// What field are we editing, if anything
var s_activeField = false, s_activeFieldValue;

// These referecne the global action objects
require('./CardDef');

var actionGroups = require('./actions');
var cardList = require('./cardList');


var s_cardLoaded = '', s_cardSelected = '', s_cardModified = false;

// Setup event hooks etc
$(document).ready(function() {

	$(document).keyup(function(event) {
		// Allow 'esc' to get peoeple out of editing a field.
		if (event.keyCode == 27)
		{
			if(s_activeField)
			{
				$('[data-fieldname="' + s_activeField + '"]').text(s_activeFieldValue);
				s_activeField = false;
				s_activeFieldValue = undefined;
			}
		}
	});

	$('.editable-field').attr("tabindex", "1");

	// This does the editing in place for text fields
	$('.editable-field').on('click focus', function() {
		if(!s_activeField)
		{
			s_activeField = $(this).attr('data-fieldname');
			s_activeFieldValue = $(this).text();

			$(this).html('<input id="editing-field" name="name" type="text" value="' + s_activeFieldValue + '" tabindex="1"/>');
			$(this).find('input').focus().on('keypress blur', function(event) {
				if(s_activeField !== 'name') // All other fields are numeric
				{
					if((event.type === 'keypress')
						&& (!((event.which === 46) // period
							|| (event.which > 47 && event.which < 58) // 0 - 9
							|| (event.which === 13)) // Enter
						)
					)
					{
						return false;
					}
				}

				if(event.type === 'blur' || (event.type === 'keypress' && event.which === 13))
				{
					var value = $(this).val();
					if(value == '') value = '0';
					if(s_activeField !== 'name')
					{
						value = parseFloat(value, 10); // Strip leading/trailing zeros or whatever
					}
					$(this).closest('.editable-field').text(value);
					s_activeField = false;
					s_activeFieldValue = undefined;
					showCardContrast();
				}
			});

			setLoadedCardModified(true);
		}
	});

	// Generate our list of actions
	populateActions();

	// Blank out the card forms
	clearCardDataFromForm('loaded', true);
	clearCardDataFromForm('selected', true);

	// Fill up the card list with all known cards
	updateCardList();

	// Open/Close Action lists
	$('.action-category h4').on('click', function() {
		$(this).closest('.action-category').find('.toggle').toggle();
	});

	// Add Action to a card (button)
	$('.action-add-button').on('click', function() {
		var elem = $(this).closest('.action-action');

		addActionToCard(elem.attr('data-action'), 'loaded');
	})

	// Remove Action from a card (button)
	$('.action-remove-button').on('click', function() {
		var elem = $(this).closest('.action-action');

		removeActionFromCard(elem.attr('data-action'), 'loaded');
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

	// Card selection (for picking which one to load)
	$(document).on('click', '#cardmaker-cards div', function(event) {
		selectCardById($(this).attr('data-card-id'));
	})

})


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

///////////////////////////////////////////////////////////////////////////////
//
// Managing the card forms
//

// Save the loaded card into the card list
// No reason to save from any from but the loaded one.
function saveCardDataFromForm()
{
	var fields = { 'attribs': {}, 'actions': [] };
	$('#loaded-card [data-fieldname]').each(function(idx, elem) {
		setField(fields, $(elem).attr('data-fieldname'), $(elem).text());
	});

	$('#loaded-card .card-actions a.action').each(function(idx, elem) {
		fields['actions'].push($(this).attr('data-action'));
	})

	fields['id'] = getIndexForCard(fields);

	if((s_cardLoaded !== '') && (fields['id'] !== s_cardLoaded))
	{
		if(fields['id'] in cardList)
		{
			if(!confirm("There is a card with that name already, this will replace it.\n\nAre you sure?"))
				return;
		}
		delete(cardList[s_cardLoaded]);
	}

	cardList[fields.id] = fields;
	s_cardLoaded = fields.id;

	updateCardList();
	saveCardListToLocalStorage();
	setLoadedCardModified(false);
}

// Used to make a new card
function clearCardDataFromForm(form, force)
{

	if(!force && form === 'loaded' && s_cardModified
		&& !confirm('All of your current edits will be lost.\n\nAre you sure?'))
	{
		return false; // not cleared ok
	}

	$('#' + form + '-card [data-fieldname]').each(function(idx, elem) {
		if($(elem).attr('data-fieldname') === 'name')
		{
			$(elem).text('Card Name');
		}
		else
		{
			$(elem).text('0');
		}
	});

	$('#' + form + '-card .card-actions').empty();

	if(form === 'loaded')
	{
		$('.current-action').removeClass('current-action');
		s_cardLoaded = '';
		updateActionUsageCount();
		setLoadedCardModified(false);
	}

	return true; // cleared ok
}

function getField(card, field)
{
	var val = 'card.' + field;
	try
	{
		return eval(val);
	}
	catch(e)
	{
		console.error('getField unable to evaluate '+val);
	}
}

function setField(card, field, value)
{
	value = isNaN(value) ? '"'+value+'"' : +value;

	var val = 'card.' + field + ' = ' + value;
	try
	{
		return eval(val);
	}
	catch(e)
	{
		console.error('setField unable to evaluate '+val);
	}
}

// Load card data into the form for editing
function loadCardDataToForm(form)
{
	if(s_cardModified
		&& (form === 'loaded')
		&& (!confirm('You have unsaved changes to your currently loaded card.  Loading this card will discard those changes\n\nAre you sure?'))
	)
	{
		return;
	}

	// Confirmed above, so this should always be ok to clear.
	clearCardDataFromForm(form, true)

	var selected = $('#cardmaker-cards div.selected');
	var id = selected.attr('data-card-id');
	if(id && (id in cardList))
	{
		$('#' + form + '-card [data-fieldname]').each(function(idx, elem) {
			var field = $(this).attr('data-fieldname');
			$(this).text(getField(cardList[id], field));
		})

		for(var x = 0; x < cardList[id].actions.length; x++)
		{
			addActionToCard(cardList[id].actions[x], form, true);
		}

		if(form == 'loaded')
		{
			$('#cardmaker-cards div.loaded').removeClass('loaded');
			selected.addClass('loaded');
			s_cardLoaded = id;
			setLoadedCardModified(false);
		}
		else
		{
			// selected
			showCardContrast();
		}

	}

	updateActionUsageCount(form);
	tooltipHide();
}

// Add an action to a card from the action list
// Silent used when loading cards.
function addActionToCard(action, form, silent)
{
	if(!silent)
	{
		setLoadedCardModified(true);
	}

	if(!$("#" + form + "-card .card-actions [data-action='" + action + "']").length)
	{
		var out = '';
		var info = getActionObjectFromDotName(action);

		out += '<a class="button action" data-action="' + action + '" data-tt="' + info.description + '<br><br>Cooldown: ' + info.cooldown + '">'
			+ '<div class="bar-inner" style="width: 100%;"></div>'
			+ '<span class="bar-text"><span>' + info.name + '</span></span></a>';

		$('#' + form + '-card .card-actions').append(out);

		if(form === 'loaded')
		{
			// Mark the action as added in the list
			$('div.action-action[data-action="' + action + '"]').addClass('current-action');

			$('#loaded-card .card-actions').sortable();
		}
	}

	updateActionUsageCount();
}

// Remove an action from the card
function removeActionFromCard(action)
{
	setLoadedCardModified(true);

	$("#loaded-card .card-actions [data-action='" + action + "']").remove();

	// Unmark the action as in use in the action list
	$('div.action-action[data-action="' + action + '"]').removeClass('current-action');

	$('#loaded-card .card-actions').sortable();

	updateActionUsageCount();
}

// Update the action counters on the action list of
// actions used within that category
function updateActionUsageCount()
{
	$('.action-category').each(function(idx, elem) {
		var count = $(elem).find('.current-action').length;
		$(elem).find('.action-count').text(count);
	});
}

// Show the contrast bewteen cards (display on the selected card form)
function showCardContrast()
{
	$('.compare').remove();

	$('#loaded-card [data-fieldname]').each(function(idx, elem) {
		var fieldName = $(this).attr('data-fieldname');
		var loadedValue = parseFloat($(this).text(), 10);

		var selectedField = $('#selected-card [data-fieldname="' + fieldName + '"]');
		var selectedValue = parseFloat(selectedField.text(), 10);

		var diff = selectedValue - loadedValue;

		if(diff > 0)
		{
			selectedField.after('<span class="compare positive"> (+' + diff + ')</span>');
		}
		else if(diff < 0)
		{
			selectedField.after('<span class="compare negative"> (' + diff + ')</span>');
		}
	});
}

function setLoadedCardModified(isModified)
{
	s_cardModified = isModified;
	if(s_cardModified)
	{
		$('#loaded-card-modified').show();
	}
	else
	{
		$('#loaded-card-modified').hide();
	}
}

///////////////////////////////////////////////////////////////////////////////
//
// Helper Functions
//

// Get information about an action using its dotted name.
// ex: General.attack
function getActionObjectFromDotName(dotName)
{
	var a = dotName.split('.');

	return actionGroups[a[0]].actions[a[1]];
}

// Create an object index for this card.
function getIndexForCard(card)
{
	// this seems ok for now
	return card.name.replace(/[\s\']/g,'_');
}

// Fill in the action list to choose from
function populateActions()
{
	var out = '';
	for(var actionGroup in actionGroups)
	{
		out += '<div class="action-category">'
			+ '<h4><span class="toggleOpen toggle">+</span>'
			+ '<span class="toggleClose hide toggle">-</span>'
			+ actionGroups[actionGroup].name
			+ '<span class="action-count">0<span></h4>';
		for(var actionName in actionGroups[actionGroup].actions)
		{
			var action = actionGroups[actionGroup].actions[actionName];
			out += '<div class="action-action toggle" data-action="' + actionGroup + '.' + actionName + '" '
				+ 'data-tt="' + action.description + "<br><br>"
				+ 'Cooldown: ' + action.cooldown + '">'
				+ (action.icon ? ('<img src="http://gateway.startrekonline.com/tex/' + action.icon + '" class="icon"/> ') : '<div class="icon"></div>')
				+ action.name
				+ '<button class="action-add-button">add</button>'
				+ '<button class="action-remove-button">remove</button></div>';
		}
		out += '</div>';
	}

	$('#cardmaker-actions').html(out);
}

// Refresh card list display
function updateCardList(list)
{
	cardList = list || cardList;
	var out = '';

	var sortedKeys = cardListSortedKeys(cardList);

	var card;
	for(var x =  0; x < sortedKeys.length; x++)
	{
		card = cardList[sortedKeys[x]];
		out += '<div class="'
			+ ((card.id === s_cardLoaded) ? 'loaded' : '')
			+ ((card.id === s_cardSelected) ? ' selected' : '')
			+ '" data-card-id="' + card.id + '">' + card.name + '</div>';
	}

	$('#cardmaker-cards').html(out);

	// In case you were hovering over a button at the time.
	// That button might be gone now. (clicking delete card for example)
	tooltipHide();
}

function selectCardById(id)
{
	// Clear any previous selection
	$('#cardmaker-cards div.selected').removeClass('selected').find('a').remove();

	var elem = $('#cardmaker-cards [data-card-id="' + id + '"]');

	if(elem)
	{

		elem.addClass('selected');
		s_cardSelected = id;

		var buttons = '<a class="icon-button" onclick="if(confirm(\'Are you sure you want '
			+ 'to delete the selected card?\')){cm.deleteCardFromList()}" '
			+ 'data-tt="Delete a card from the card list."><img src="./img/delete-icon.png"></a>';

		buttons += '<a class="icon-button" onclick="cm.duplicateCardInList();" '
			+ 'data-tt="Make a copy of this card.">'
			+ '<img src="./img/copy-icon.gif"></a>';

		buttons += '<a class="icon-button" onclick="cm.loadCardDataToForm(\'loaded\');" '
			+ 'data-tt="Load the selected card from the card list into the form.">'
			+ '<img src="./img/open-icon.png"></a>';

		elem.append(buttons);

		loadCardDataToForm('selected');
	}
}

///////////////////////////////////////////////////////////////////////////////
//
// Data management
//

var clickStopper = false;

// Get the card list data as a file (cardList.js)
function downloadCardList(minified)
{
	// To stop accidental double clicks
	if(!clickStopper)
	{
		clickStopper = true;
		setTimeout(function() { clickStopper = false; }, 1000); // give it a second will ya?

		if(s_cardModified)
		{
			if(!confirm('You have unsaved changes! They will not be in this data because they were not saved.\n\nDo you sill want this data?'))
			{
				return;
			}
		}

		// Seperate text var to possibly put into localStorage.
		var text = 'var cardList = ' + JSON.stringify(cardList, null, ((!minified)?"\t":null)) + ";\nif(module.exports) module.exports = cardList;";

		var textBlob = new Blob([text], {type:'text/plain'});

		var a = document.createElement("a");
		a.download = 'cardList.js';
		a.innerHTML = "Download Cardlist";
		if (window.webkitURL != null)
		{
			// Chrome allows the link to be clicked
			// without actually adding it to the DOM.
			a.href = window.webkitURL.createObjectURL(textBlob);
		}
		else
		{
			// Firefox requires the link to be added to the DOM
			// before it can be clicked.
			a.href = window.URL.createObjectURL(textBlob);
			a.onclick = function(event) {
				document.body.removeChild(event.target);
			}
			a.style.display = "none";
			document.body.appendChild(a);
		}

		a.click();
	}
}

function displayCardListForCopy(minified)
{
	// To stop accidental double clicks
	if(!clickStopper)
	{
		clickStopper = true;
		setTimeout(function() { clickStopper = false; }, 1000); // give it a second will ya?

		if(s_cardModified)
		{
			if(!confirm('You have unsaved changes! They will not be in this data because they were not saved.\n\nDo you sill want this data?'))
			{
				return;
			}
		}

		// Seperate text var to possibly put into localStorage.
		var text = 'var cardList = ' + JSON.stringify(cardList, null, ((!minified)?"\t":null)) + ";\nif(module.exports) module.exports = cardList;";

		$('#copy-box').show();
		$('textarea#copy-text').text(text).focus().select();
	}
}

// Delete a card from the list.
function deleteCardFromList()
{
	var selected = $('#cardmaker-cards div.selected');
	var id = selected.attr('data-card-id');
	if(id && (id in cardList))
	{
		if(selected.hasClass('loaded'))
		{
			if(!clearCardDataFromForm('loaded'))
			{
				return;
			}
		}

		delete(cardList[id]);

		updateCardList();
	}
}

function saveCardListToLocalStorage()
{
	localStorage.setItem('cardList', cardList);
}

function getCardListFromLocalStorage()
{
	return localStorage.getItem('cardList');
}

function duplicateCardInList()
{
	var selected = $('#cardmaker-cards div.selected');
	var id = selected.attr('data-card-id');
	if(id && (id in cardList))
	{
		var card = {};
		$.extend(card, cardList[id]);
		card.name = card.name + ' COPY';
		card.id = card.id + '_COPY';
		cardList[id + '_COPY'] = card;

		updateCardList();
	}
}

// Make a text eval()'able version of a card entry
// Not used at this time, but keeping for the hell of it.
function makeCardDefForFile(card)
{
	var out = ''
		+ "var " + card.id + " = new CardDef({\n"
		+ "\tname: \"" + card.name + "\",\n\n"

		+ "\tattribs: {\n"
		+ "\t\tspeed: "             + card.speed + ",\n"
		+ "\t\thitpoints: "         + card.hitpoints + ",\n"
		+ "\t\tshield: "            + card.shield + ",\n"
		+ "\t\tshieldBleed: "       + card.shieldBleed + ",\n"
		+ "\t\tattackMin: "         + card.attackMin + ",\n"
		+ "\t\tattackMax: "         + card.attackMax + ",\n"
		+ "\t\tattackReflection: "  + card.attackReflection + ",\n"
		+ "\t\tattackReduction: "   + card.attackReduction + ",\n"
		+ "\t\taccuracyRating: "    + card.accuracyRating + ",\n"
		+ "\t\tevasionRating: "     + card.evasionRating + ",\n"
		+ "\t\tcriticalMult: "      + card.criticalMult + ",\n"
		+ "\t},\n\n"

		+ "\tactions: [\n";

	var a;
	for(var x = 0; x < card.actions.length; x++)
	{
		a = card.actions[x].split('.');
		out += "\t\t" + a[0].toLowerCase() + "." + a[1] + ",\n";
	}

	out += "\t]\n});\n\n";

	return out;
}

function cardListSortedKeys(cl)
{
	var keys = [];
	for(var k in cl)
	{
		keys.push(k);
	}
	keys.sort();

	return keys;
}

////////////////////////////////////////////////////////////////////////////

module.exports.clearCardDataFromForm  = clearCardDataFromForm;
module.exports.saveCardDataFromForm = saveCardDataFromForm;
module.exports.loadCardDataToForm = loadCardDataToForm;
module.exports.deleteCardFromList = deleteCardFromList;
module.exports.downloadCardList = downloadCardList;
module.exports.displayCardListForCopy = displayCardListForCopy;
module.exports.updateCardList = updateCardList;
module.exports.duplicateCardInList = duplicateCardInList;

module.exports.cardLoaded = function() { return s_cardLoaded };

// End of File
