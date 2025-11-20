// Possible error messages.
Messages['error_shard_not_found'].used   = true;
Messages['error_no_shard_selected'].used = true;
Messages['error_shard_not_running'].used = true;
Messages['error_shard_not_locked'].used  = true;
Messages['error_shard_locked'].used      = true;
Messages['error_already_primed'].used    = true;
Messages['error_invalid_version'].used   = true;
Messages['error_shard_is_running'].used  = true;
Messages['error_overlord_ajax'].used     = true;
Messages['error_cluster_not_found'].used = true;

// Finite states.
Messages['Starting'].used      = true;
Messages['Locked'].used        = true;
Messages['Running'].used       = true;
Messages['Stopping'].used      = true;
Messages['Disconnected'].used  = true;

var Overlord = {
	'shard': false,
	'clusters': [],
	'shards': [],
	'versions': []
};

Overlord.select = function(shard_id)
{
	var shard = Overlord.shards[shard_id];
	if(!shard) return 'error_shard_not_found';
	Overlord.shard = Overlord.shards[shard_id];
	Overlord.update();
	return false;
};

Overlord.prime = function(version_id)
{
	if(!Overlord.shard)
		return 'error_no_shard_selected';
	if(['Running', 'Locked'].indexOf(Overlord.shard.status) == -1)
		return 'error_shard_not_running';
	if(!(version_id in Overlord.versions))
		return 'error_invalid_version';
	var version = Overlord.versions[version_id].name;
	if(Overlord.shard.primed == version)
		return 'error_already_primed';
	Overlord.shard.primed = false;
	Overlord.update();
	var args = [
		Overlord.shard.clustername + '_ClusterController',
		'SendCommandToShard ALL DoPrePatching ' + version + ' 0 Yes, ""',
	];
	Overlord.xmlrpc('SendCommandToSimpleStatusMonitoree', args, function(response)
	{
		console.log(response); // TODO
		Overlord.shard.primed = 'TODO';
		Overlord.update();
	});
	return false;
};

Overlord.start = function(version_id)
{
	if(!Overlord.shard)
		return 'error_no_shard_selected';
	if(Overlord.shard.status != 'Disconnected')
		return 'error_shard_is_running';
	if(!(version_id in Overlord.versions))
		return 'error_invalid_version';
	var version = Overlord.versions[version_id].name;
	Overlord.shard.status = 'Starting';
	if([Overlord.shard.patched, Overlord.shard.primed].indexOf(version) == -1)
		Overlord.shard.patched = false;
	if(Overlord.shard.patched != version)
		Overlord.shard.white_glove = true;
	Overlord.update();
	Overlord.xmlrpc('LaunchCluster', [Overlord.shard.clustername, version], function(response)
	{
		console.log(response); // TODO
		Overlord.shard.status = 'TODO';
		Overlord.shard.patched = version;
		Overlord.update();
	}, 2000);
	return false;
};

Overlord.lock = function()
{
	if(!Overlord.shard)
		return 'error_no_shard_selected';
	if(Overlord.shard.status != 'Running')
		return 'error_shard_locked';
	var args = [
		Overlord.shard.clustername + '_ClusterController',
		'SendCommandToShard ALL LockTheShard 0',
	];
	Overlord.xmlrpc('SendCommandToSimpleStatusMonitoree', args, function(response)
	{
		console.log(response); // TODO
		Overlord.shard.status = 'TODO';
		Overlord.update();
	});
	return false;
};

Overlord.unlock = function()
{
	if(!Overlord.shard)
		return 'error_no_shard_selected';
	if(Overlord.shard.status != 'Locked')
		return 'error_shard_not_locked';
	var args = [
		Overlord.shard.clustername + '_ClusterController',
		'SendCommandToShard ALL LockTheShard 0',
	];
	Overlord.xmlrpc('SendCommandToSimpleStatusMonitoree', args, function(response)
	{
		console.log(response); // TODO
		Overlord.shard.status = 'TODO';
		Overlord.update();
	});
	return false;
};

Overlord.stop = function(time, message)
{
	if(!Overlord.shard)
		return 'error_no_shard_selected';
	if(['Starting', 'Running', 'Locked'].indexOf(Overlord.shard.status) == -1)
		return 'error_shard_not_running';
	Overlord.shard.message = message;
	Overlord.shard.status = 'Locked';
	Overlord.update();
	Overlord.xmlrpc('EmergencyShutdownCluster', [Overlord.shard.name, Overlord.shard.name], function(response)
	{
		console.log(response); // TODO
		Overlord.shard.status = 'TODO';
		Overlord.update();
	});
	return false;
};

Overlord.update = function()
{
	alert('Please override the Overlord.update() function!');
};

Overlord.init = function()
{
	// Synchronously load clusters.
	clusters = Overlord.ajax('Clusters');
	if(typeof(clusters) == 'string') return clusters;
	for(var i = 0; i < clusters.length; i++)
	{
		var cluster = clusters[i];
		Overlord.clusters.push({
			'index': i,
			'project': cluster.patchversion.substr(0, 2).toLowerCase(),
			'name': cluster.link.replace(/<(?:.|\n)*?>/gm, '')
		});
	}

	// Synchronously load shards.
	shards = Overlord.ajax('Shards');
	if(typeof(shards) == 'string') return shards;
	for(var i = 0; i < shards.length; i++)
	{
		var shard = shards[i];
		var patched = shard.patchversion.replace(/ .*/, '');
		var primed  = shard.primedpatchversion.replace(/ .*/, '');
		if(patched == 'UNKNOWN') patched = false;
		if(primed  == 'UNKNOWN') primed  = false;
		var cluster = -1;
		for(var j = 0; j < Overlord.clusters.length; j++)
			if(Overlord.clusters[j].name == shard.clustername)
				cluster = j;
		if(cluster == -1) return trans('error_cluster_not_found') + ': ' + shard.clustername;
		Overlord.shards.push({
			'index': i,
			'name': shard.link.replace(/<(?:.|\n)*?>/gm, ''),
			'cluster': cluster,
			'clustername': shard.clustername,
			'project': shard.patchversion.substr(0, 2).toLowerCase(),
			'patched': patched,
			'primed': primed,
			'status': shard.status,
			'message': false,
			'white_glove': false
		});
	}

	// Synchronously load patch versions.
	versions = Overlord.ajax('Night_Recentpatchversions');
	if(typeof(versions) == 'string') return versions;
	for(var i = 0; i < versions.length; i++)
	{
		var version = versions[i];
		Overlord.versions.push({
			'index': i,
			'name': version.link.replace(/<(?:.|\n)*?>/gm, '')
		});
	}

	return false; // No error.
};

Overlord.ajax = function(object)
{
	var response = {};
	$.ajax({
		'url': '/viewxpath?json=1&xpath=Overlord[0].globObj.' + object,
		'dataType': 'json',
		'async': false,
		'success': function(data)
		{
			response = data.list.objects;
		},
		'error': function(jqXHR, status, error)
		{
			response = trans('error_overlord_ajax') + ': ' + error.message;
		}
	});
	return response;
};

Overlord.xmlrpc = function(method, args, callback)
{
	params = [];
	for(var i = 0; i < args.length; i++)
	{
		type = (typeof(args[i]) == 'number') ? 'int' : 'string';
		params.push('<param><value><' + type + '>' + args[i] + '</' + type + '></value></param>');
	}
	var request = '<?xml version="1.0"?>\
		<methodCall>\
			<methodName>' + method + '</methodName>\
			<params>' + params.join('') + '</params>\
		</methodCall>\
	';
	$.ajax({
		'url': '/xmlrpc/',
		'dataType': 'xml',
		'contentType': 'text/xml',
		'type': 'post',
		'processData': false,
		'data': request,
		'success': function(jqXHR, status, response)
		{
			callback(response);//TODO
		},
		'error': function(jqXHR, status, error)
		{
			callback(error.message);//TODO
		}
	});
};
