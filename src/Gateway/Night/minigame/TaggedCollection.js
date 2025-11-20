'use strict';

var randomInt = require('./randomInt');

function TaggedCollection(constructifier)
{
	this.constructifier = constructifier;
	this.index = {};
	this.collection = { all: [] };

	// Expected fields for items in the collection. (* are required)
	//
	//     id*
	//     tags*
	//     used
	//

}

TaggedCollection.prototype.get = function(id)
{
	return this.index[id];
}

TaggedCollection.prototype.add = function(def)
{
	var self = this;

	if(!Array.isArray(def.tags))
		def.tags = def.tags.split(/\s+/);

	var c = new this.constructifier(def);

	self.index[c.id] = c;
	self.collection['all'].push(c);

	def.tags.forEach(function(tag) {
		if(tag) // disallow '' and undefined on purpose. Also disallows 0.
		{
			if(!self.collection[tag])
				self.collection[tag] = [];

			self.collection[tag].push(c);
		}
	});
}

TaggedCollection.prototype.reset = function()
{
	for(var id in this.collection)
	{
		for(var i = 0; i > this.collection[id].length; i++)
		{
			if(this.collection[id][i].reset)
			{
				this.collection[id][i].reset();
			}
		}
	}
}

TaggedCollection.prototype.choose = function(tagFilter, used)
{
	var a = this.getMatching(tagFilter);

	if(!a)
	{
		console.error('No encounters match the tag filter!');
		a = this.collection.all;
	}


	var unused;
	if(used)
	{
		unused = a.filter(function(a) { return !(a.id in used); });
	}
	else
	{
		unused = a.filter(function(a) { return !a.used; });
	}

	if(!unused.length)
	{
		//console.error('Not enough encounters to give a unique one!');
		return undefined;
	}

	return unused[randomInt(0, unused.length-1)];
}

TaggedCollection.prototype.getMatching = function(tags)
{
	if(!Array.isArray(tags))
		tags = tags.split(/\s/);

	var a;

	var self = this;
	for(var i = 0; i < tags.length; i++)
	{
		var tag = tags[i];
		if(tag)
		{
			var op = intersect;
			switch(tag.charAt(0))
			{
				case '-':
					tag = tag.slice(1);
					op = except;
					break;

				case '+':
					tag = tag.slice(1);
					op = union;
					break;
			}

			a = intersect(a, self.collection[tag]);
		}
	}

	return a;
}


//////////////////////////////////////////////////////////////////////////

function except(a, b) { return intersect(a, b, true); }

function intersect(a, b, reject)
{
	if(!a)
		return b;
	else if(!b)
		return a;

	var r = [];
	for(var i = 0; i < a.length; i++)
	{
		for(var j = 0; j < b.length; j++)
		{
			var keep = reject ? a[i] !== b[j] : a[i] === b[j];
			if(keep)
			{
				r.push(a[i]);
				break;
			}
		}
	}

	return r;
}

function union(a, b)
{
	if(!a)
		return b;
	else if(!b)
		return a;

	return a.concat(b);
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////


module.exports = TaggedCollection;

//////////////////////////////////////////////////////////////////////////

// End of File
