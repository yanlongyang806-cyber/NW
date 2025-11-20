var $jquery = jQuery.noConflict();

var selected_ranges = null;

function printGraph (inVar) 
{  
    var data = inVar["data"];
    var graphoptions = inVar["options"];
    if (!graphoptions)
        graphoptions = {};

    graphoptions["selection"] = { mode: "xy" };
    if (inVar["time"])
        graphoptions["xaxis"] = { mode: "time"};

    //var count = 0;
    //for ( var name in data ) if (count++ > 1) break;
    //graphoptions["legend"] = { show: ((count > 1)?true:false) };
   
    graphoptions["legend"] = { show: false };

    var d = [];

    var choiceContainer = $jquery("#choices");
    choiceContainer.find("input:checked").each(function () {
            var key = $jquery(this).attr("name");
			var inserted = false;
            if (key && data[key])
			{
                d.push(data[key]);
			}
        });
    
    var plot = $jquery.plot($jquery("#placeholder"), d, graphoptions);
    
    var overoptions = {
        legend: {show : false },
        lines: { show: true, lineWidth: 1 },
        shadowSize: 0,
        yaxis: { ticks: [] },
        selection: { mode: "xy" }
    };
    
    if (inVar["time"])
        overoptions["xaxis"] = { mode: "time" };

    var overview = $jquery.plot($jquery("#overview"), d, overoptions);

    // now connect the two

    $jquery("#placeholder").unbind("plotselected");
    $jquery("#placeholder").bind("plotselected", function (event, ranges) {
        // do the zooming
        plot = $jquery.plot($jquery("#placeholder"), d,
                      $jquery.extend(true, {}, graphoptions, {
                          xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
                          yaxis: { min: ranges.yaxis.from, max: ranges.yaxis.to }
                      }));

        // don't fire event on the overview to prevent eternal loop
        overview.setSelection(ranges, true);

		// save selection for update
		selected_ranges = ranges;
    });

    $jquery("#overview").unbind("plotselected");
    $jquery("#overview").bind("plotselected", function (event, ranges) {
        plot.setSelection(ranges);
    });

	// reset selection
	if (selected_ranges)
	{
		plot.setSelection(selected_ranges);
	}

	// Update auto_refresh.
	update_lastseen = new Date();
}

function getFlotColor(name)
{
    var lookupColors = {
        aqua:[0,255,255],
        azure:[240,255,255],
        beige:[245,245,220],
        black:[0,0,0],
        blue:[0,0,255],
        brown:[165,42,42],
        cyan:[0,255,255],
        darkblue:[0,0,139],
        darkcyan:[0,139,139],
        darkgrey:[169,169,169],
        darkgreen:[0,100,0],
        darkkhaki:[189,183,107],
        darkmagenta:[139,0,139],
        darkolivegreen:[85,107,47],
        darkorange:[255,140,0],
        darkorchid:[153,50,204],
        darkred:[139,0,0],
        darksalmon:[233,150,122],
        darkviolet:[148,0,211],
        fuchsia:[255,0,255],
        gold:[255,215,0],
        green:[0,128,0],
        indigo:[75,0,130],
        khaki:[240,230,140],
        lightblue:[173,216,230],
        lightcyan:[224,255,255],
        lightgreen:[144,238,144],
        lightgrey:[211,211,211],
        lightpink:[255,182,193],
        lightyellow:[255,255,224],
        lime:[0,255,0],
        magenta:[255,0,255],
        maroon:[128,0,0],
        navy:[0,0,128],
        olive:[128,128,0],
        orange:[255,165,0],
        pink:[255,192,203],
        purple:[128,0,128],
        violet:[128,0,128],
        red:[255,0,0],
        silver:[192,192,192],
        white:[255,255,255],
        yellow:[255,255,0]
    };  

    if (lookupColors[name]) {
        var flotcolor = lookupColors[name];
        return 'rgb('+flotcolor[0]+','+flotcolor[1]+','+flotcolor[2]+')';
    }
    else
        return name;
}

var currentLines = 0;

function makeGraph (inVar)
{
    var datasets = inVar["data"];

	// insert checkboxes 
    var choiceContainer = $jquery("#choices");
	var linesInData = 0;
	$jquery.each(datasets, function(key, val) {
		linesInData++;
	});
	if (currentLines != linesInData)
	{
		$jquery.each(datasets, function(key, val) {
			if ($jquery("input[name='"+key+"']").length == 0)
			{
				var color = val["color"];
				var span = "<span>";
				if (color) {
					color = getFlotColor(color);
					span = '<span style=\"background-color:' + color + '\" >';
				}

				choiceContainer.append('<div class="graph_line"> '+span+'<input type="checkbox" name="' + key +
								   '" checked="checked" ></input></span>' + val.label+"</div>");
			}
		});
		currentLines = linesInData;
	}

    choiceContainer.find("input").click( function () {
        printGraph(inVar);
    });

    printGraph(inVar);
}

function loadGraph(url)
{
        $jquery.getJSON(url, makeGraph);
}

function startGraphRefresh()
{
	setInterval(check_graph_update, auto_refresh_seconds * 1000);

	function check_graph_update()
	{
		var refresh = $jquery("#autorefresh:checked").val();
		var log_id = window.location.search.split("[")[1].split("]")[0];
		var graph_name = window.location.search.split("[")[2].split("]")[0];
		var graph_time = window.location.search.split("]")[2].split(".")[1];
		if (graph_time == "live")
		{
			graph_time = "0";
		}

		if (refresh == "1")
		{
			loadGraph("/viewxpath?xpath=LogParser["+log_id+"].graphData["+graph_name+"]."+graph_time+"&update=1&nocache=1");
		}
	}
}
