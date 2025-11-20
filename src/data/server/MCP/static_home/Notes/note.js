var urlParams;

(window.onpopstate = function()
{
	var match,
	pl     = /\+/g, // Regex for replacing addition symbol with a space
	search = /([^&=]+)=?([^&]*)/g,
	decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
	query  = window.location.search.substring(1);
	urlParams = {};
	while(match = search.exec(query))
		urlParams[decode(match[1])] = decode(match[2]);
})();

$(document).ready(function()
{
	// Handle GET variables.
	$('h2.product').text(urlParams.product + '-Specific Comments');
	$('h2.system').text(urlParams.system   + '-Specific Comments');
	if(urlParams.designer) $('body').addClass('designer');

	// Fetch JSON page.
	$('section').hide();
	$('input[type="button"]').attr('disabled', true);
	$.ajax({
		dataType: 'json',
		url: window.location.href.replace('pretty=1', 'json=1')
	}).done(function(data)
	{
		// Display data.
		$('header h1').text(data.title);
		$('body').attr('data-name', data.notename);
		if(data.note)
		{
			$('section').each(function()
			{
				var scope = $(this).attr('data-scope');
				$(this).find('textarea').each(function()
				{
					var type = $(this).attr('data-type');
					$(this).val(data.note[scope][type]);
				});
			});
		}
        $('section').show();

		// Register events.
		$('input[type="button"]').click(function()
		{
			var json_rpc_url = window.location.href.replace('viewxpath?', 'rpc?');
			json_rpc_url = json_rpc_url.split('.')[0];
			$(this).attr('disabled', true);
			var name = $('body').attr('data-name');
			var scope = $(this).parents('section').attr('data-scope');
			var type = $(this).siblings('textarea').attr('data-type');
			var note = $(this).siblings('textarea').val();
			var req_id = $(this).attr('id');
			$.ajax({
				type: 'post',
				dataType: 'json',
				url: json_rpc_url,
				data: JSON.stringify({
					'method': 'NotesServer_SetNote',
					'params': [name, scope, type == 'critical' ? 1 : 0, note],
					'id' : req_id
				})
			}).done(function(data)
			{
				$('#' + data.id).attr('disabled', false);
				var message = $('#' + data.id).siblings('span');
				if(data.error)
					message.text(data.error).addClass('error');
				else
					message.text(data.result).removeClass('error');
				message.css('display', 'inline');
				setTimeout(function() { message.fadeOut(1000); }, 2000);
			});
		});
		$('input[type="button"]').attr('disabled', false);
	});
});
