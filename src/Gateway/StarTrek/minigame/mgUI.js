'use strict';

var mg = require('./mg');
var render = require('./resolver').render;
var stencils = require('./Stencils');

function startEventHandlers(table)
{
	$(document).on('click', '[data-id]', function(event) {
		onSelection(table, this, event);
	});

	$(document).on('mouseenter', '.card', function(event) {
		var id = this.getAttribute('data-id');
		var obj = table.getObjectsForId(id);

		var c = obj[1];
		if(c && c.nextActionBundle && c.nextActionBundle.targets)
		{
			c.nextActionBundle.targets.forEach(function(target) {
				$('.'+target.id).addClass('targeted');
			});
		}
	});

	$(document).on('mouseleave', '.card', function(event) {
		$('.card').removeClass('targeted');
	});

	$(document).on('mouseenter', '[data-tt]', function(event) {
		var text = this.getAttribute('data-tt');
		$('#tooltip').html(text);
		$('#tooltip').css( {
			left: $(this).offset().left + $(this).outerWidth() + 5,
			top: $(this).offset().top,
		});
		$('#tooltip').show();
	});

	$(document).on('mouseleave', '[data-tt]', function(event) {
		$('#tooltip').hide();
	});
}

function onSelection(table, elem, event)
{
	var obj;
	if(table.selecting)
	{
		var elemid = elem.getAttribute('data-id');
		var found = false;

		table.selecting.forEach(function(id) {
			found = found || elemid.indexOf('.' + id + '.') >= 0;
		});

		if(found)
		{
			console.log('Found match '+elemid);
			$('body').removeClass('select-mode');

			table.selecting.forEach(function(id) {
				$('.card.'+id).removeClass('selectable');
			});

			$('#selecting').hide();

			table.selecting = false;

			obj = table.getObjectsForId(elemid);
			table.onSelected(table, obj[0], obj[1], obj[2]);
		}
	}
	else
	{
		var id = elem.getAttribute('data-id');
		obj = table.getObjectsForId(id);
		if(obj.length >= 3 && mg.queueAction(table, obj[0], obj[1], obj[2]))
		{
			event.stopPropagation();
		}
	}
}

function updateTableau(table)
{
	table.players.forEach(function(player) {
		player.canUseActions = false;
		player.hasActionsToUse = false;

		player.cards.forEach(function(card) {

			card.isDisabled = !card.canExecuteAction();
			// console.log('dis:'+card.isDisabled)
			if(!card.isDisabled)
				player.canUseActions = true;

			if(!card.isDisabled && !card.nextActionBundle)
				player.hasActionsToUse = true;

			card.actions.forEach(function(action) {
				action.canExecute = mg.canExecute(action) ? 1 : 0;
			});
		});
	});

	setFromStencil('#tableau', 'tableau', table);
}

//
// setFromStencil
//
// Renders the named stencil into the given DOM selector.
// Rootpath can be a string path (which will reference off off metaEnt) or
//   an object.
//
// After rendering into the selector, the given callback is called.
//
function setFromStencil(selector, nameStencil, rootpath, callback)
{
	if(stencils[nameStencil] && typeof stencils[nameStencil] === 'function')
	{
		render(stencils[nameStencil], nameStencil, rootpath, function(e, r) {
			$(selector).html(r.join(''));
			if(callback)
			{
				callback(e, r);
			}
		});
	}
	else
	{
		console.error('Invalid stencil name: ' + nameStencil);
	}
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

module.exports.onSelection			= onSelection;
module.exports.startEventHandlers	= startEventHandlers;
module.exports.updateTableau		= updateTableau;
module.exports.setFromStencil		= setFromStencil;


// End of File
