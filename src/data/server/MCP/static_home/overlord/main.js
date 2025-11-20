var version = '0.2';
var language = false;
var template = false;

var languages = [
	{ id: 'en', name: 'English' },
	{ id: 'fr', name: 'French' },
	{ id: 'de', name: 'German' }
];

var trans = function(string, arg)
{
	if((string in Messages) && (language in Messages[string]))
	{
		Messages[string].used = true;
		return Messages[string][language].replace(/%/, arg);
	}
	console.log('Untranslated string (' + language + '): ' + string);
	var html = '<em>' + Handlebars.Utils.escapeExpression(string) + '</em>';
	return new Handlebars.SafeString(html);
}

Handlebars.registerHelper('trans', trans);

function get_date_time()
{
	// Default to one hour in the future.
	var date = new Date();
	date.setHours(date.getHours() + 1);

	// Get date pieces.
	var y = date.getFullYear();
	var m = (date.getMonth() + 1);
	var d = date.getDate();
	var h = date.getHours();

	// Pad numbers.
	if(m < 10) m = '0' + m;
	if(d < 10) d = '0' + d;
	if(h < 10) d = '0' + h;

	// Return formatted date.
	return y + '/' + m + '/' + d + ' ' + h + ':00';
}

function render_page()
{
	// Apply translations using pre-compiled page template.
	$('body').html(template({
		version: version,
		languages: languages,
		clusters: Overlord.clusters,
		shards:   Overlord.shards,
		versions: Overlord.versions,
		dateTime: get_date_time()
	}));

	// Initialize header drop-downs and tabs.
	$('#language').val(language);
	$('#language option[value="' + language + '"]').attr('selected', true);
	$('#language').change(function()
	{
		var lang = $(this).val();
		if(lang == language) return;
		language = lang;
		render_page();
	});
	$('#cluster').change(function()
	{
		$('#shard option').hide();
		$('#shard option[data-cluster="' + $(this).val() + '"]').show();
		$('#shard option:selected').attr('selected', false);
		$('#shard option:first').show().attr('selected', true);
		$('#shard').trigger('change');
	});
	$('#shard').change(function()
	{
		var shard_id = $(this).find('option:selected').val();
		if(shard_id == 'all')
		{
			var cluster_id = $('#cluster option:selected').val();
			shard_id = $('#shard option[data-cluster="' + cluster_id + '"]').val();
		}
		var error = Overlord.select(shard_id);
		if(error) { alert(trans(error)); return; }
	});
	$('#cluster').trigger('change');
	$('header a').click(function()
	{
		$('header a').removeClass('selected');
		$(this).addClass('selected');
		$('section').hide();
		$('section[data-tab="' + $(this).attr('data-tab') + '"]').show();
	});
	$('header a:first').trigger('click');

	// Initialize operation handling.
	Messages['confirm_shard_prime'].used = true;
	Messages['confirm_shard_patch'].used = true;
	Messages['confirm_white_glove'].used = true;
	Messages['confirm_shard_stop'].used  = true;
	$('section input[type="button"]').click(function()
	{
		var form = $(this).parent();
		switch($(this).attr('data-cmd'))
		{
			case 'prime':
				var version_id = form.find('select[name="version"]').val();
				var version = Overlord.versions[version_id].name;
				if(Overlord.shard.primed && Overlord.shard.primed != version)
					if(!confirm(trans('confirm_shard_prime', Overlord.shard.primed)))
						return;
				var error = Overlord.prime(version_id);
				if(error) alert(trans(error));
				break;
			case 'start':
				var version_id = form.find('select[name="version"]').val();
				var version = Overlord.versions[version_id].name;
				if([Overlord.shard.primed, Overlord.shard.patched].indexOf(version) == -1)
					if(!confirm(trans('confirm_shard_patch')))
						return;
				var error = Overlord.start(version_id);
				if(error) alert(trans(error));
				break;
			case 'lock':
				var error = Overlord.lock();
				if(error) alert(trans(error));
				break;
			case 'unlock':
				if(Overlord.shard.white_glove)
					if(!confirm(trans('confirm_white_glove')))
						return;
				var error = Overlord.unlock();
				if(error) alert(trans(error));
				break;
			case 'stop':
				var time    = form.find('input[name="time"]').val();
				var units   = form.find('select[name="units"]').val();
				var message = form.find('textarea[name="message"]').val();
				if(!confirm(trans('confirm_shard_stop')))
					return;
				var error = Overlord.stop(time * units, message);
				if(error) alert(trans(error));
				break;
		}

		// Cool-down the button.
		$(this).attr('disabled', true);
		setTimeout((function(elem)
		{
			return function()
			{
				$(elem).attr('disabled', false);
			};
		})(this), 500);
	});

	// Log unused localization messages.
	for(string in Messages)
		if(typeof(Messages[string].used) == 'undefined')
			console.log('Unused string: ' + string);
}

$(document).ready(function()
{
	// Compile page template.
	template = Handlebars.compile($('#template').html());

	// Set default language.
	language = navigator.language.toLowerCase().match(/[a-z]+/);
	
	// Initialize Overlord API.
	$('body').html('<header><h1>' + trans('Loading Overlord') + '...</h1></header>');
	var fatal_error = Overlord.init();
	if(fatal_error) { $('h1').text(fatal_error); return; }

	// Render page.
	render_page();
});

Overlord.update = function()
{
	$('#status').html(trans(Overlord.shard.status));
	$('#patched').html(Overlord.shard.patched ? Overlord.shard.patched : '...');
	$('#primed').html(Overlord.shard.primed   ? Overlord.shard.primed  : '...');
	var rules = {
		'prime':  ['Running', 'Locked'],
		'start':  ['Disconnected'],
		'unlock': ['Locked'],
		'stop':   ['Starting', 'Running', 'Locked']
	};
	for(var tab in rules)
	{
		var ready = rules[tab].indexOf(Overlord.shard.status) != -1;
		$('header a[data-tab="' + tab + '"]').attr('data-ready', ready);
	}
};
