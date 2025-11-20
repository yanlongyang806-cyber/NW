'use strict';

var utils = require('./utils');

/////////////////////////////////////////////////////////////////////////////

function ActionBundle(action, template)
{
	this.action = action;
	this.source = action.parentCard;
	this.targets = [];
	this.params = {};	// Parameters stored up during action application

	utils.extend(this, template);
}

ActionBundle.addOnFunction = function(name)
{
	ActionBundle.prototype[name] = function() {
		var self = this;
		var keep = false; // Returns false unless all

		if(this.action && this.action.actionDef[name])
		{
			if(typeof this.action.actionDef[name] === 'function')
			{
				keep = this.action.actionDef[name].call(self);
			}
			else
			{
				keep = true;
				this.action.actionDef[name].forEach(function(fn) {
					keep = fn.call(self) && keep;
				});
			}
		}

		return keep;
	};
}

ActionBundle.addOnFunction('onChoose'); // Immediately when an action is chosen
ActionBundle.addOnFunction('onQueued'); // At the end of a single player's turn, when they lock their choices
ActionBundle.addOnFunction('onOrders'); // At the end of both player's turns, in speed order but before Resolve
ActionBundle.addOnFunction('onEachTargetEarlyResolve'); // At the end of both player's turns, in speed order immediately before a ship's resolve
ActionBundle.addOnFunction('onResolve'); // At the end of both player's turns, in speed order for each target
ActionBundle.addOnFunction('onEachTargetEarlyUpkeep'); // At the beginning of the round, after reset, before upkeep
ActionBundle.addOnFunction('onEachTargetLateUpkeep'); // At the beginning of the round, after reset

ActionBundle.prototype.checkTargets = function()
{
	if(this.action.actionDef.onChoose)
	{
		var bundle = new ActionBundle(this.action, { test: true, allowAffected: true });
		var b = bundle.onChoose();
		if(!b)
		{
			bundle.source.log('Lost targeting!');
		}
		else
		{
			var final = [];

			this.targets.forEach(function(target) {
				var i = bundle.test.indexOf(target);
				if(i >= 0)
				{
					final.push(bundle.test.splice(i, 1)[0]);
				}
			});

			var need = this.targets.length - final.length;
			if(need)
			{
				// Sort the remaining items here.
				final = final.concat(bundle.test.slice(0, need));
			}

			this.targets = final;
		}
	}
}

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

module.exports = ActionBundle;

/////////////////////////////////////////////////////////////////////////////

// End of File
