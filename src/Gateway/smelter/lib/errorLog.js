//
// More readable error lgos in the console.
//
/////////////////////////////////////////////////////////////////////
var util = require('util');
var colors = require('colors');

var errorLog = {};

// Settings:
errorLog.range = 4; // how many lines to look back/forward from an error


// "Constants":
var big_red_line = '================================================================================\n'.bold.red;


// Basic 'Error' message presented between bold red lines.
errorLog.error = function(label, msg, file)
{
	var out = label + ' - ERROR: \n'.bold.red + file.bold + '\n';
	out = out + big_red_line;
	out = out + msg.yellow + '\n';
	out = out + big_red_line;
	util.log(out)
}

// 'Fixed' message just output in bold green
errorLog.fixed = function(label, msg)
{
	var out = label + ' - ' + msg;
	util.log(out.bold.green);
}

// Pad the left of a string
errorLog.padString = function(str,length,pad)
{
	if(typeof pad == "undefined") pad = ' ';

	while(str.length < length)
	{
		str = pad + str;
	}
	
	return str;
}

// Error message in detail.  (For code errors)
// So many vars I feel like I need to be more clever
errorLog.detail = function(label, msg, file, line, column, source, tab_width)
{
	// tabs = 4 spaces because when an error is at column 5
	// it could ACTUALLY be at character 2 IN JavaScript.
	// However for the LESS parser, 1 tab = 1 column ><
	if(typeof tab_width == "undefined") tab_width = 4;
	
	var src_arr = source.split("\n");
	src_arr.unshift("Source: "); // Just filler for 0 index
	
	// If we're told to ignore the error, gtfo
	if(src_arr[line].indexOf("JSHINT_IGNOREME") != -1) return;
	
	var start = (line - errorLog.range);
	var end = (line + errorLog.range);
	
	// Varify valid ranges
	if(start < 1) start = 1;
	if(end > (src_arr.length)) end = src_arr.length;
	
	var detail = '';
	var pad = end.toString().length;
	var line_num = ''; // to pad
	for (i=start;i<=end;i++)
	{
		if(i == line)
		{
			// Flag the column.
			var tmp_char = '';
			var col = 0;
			var tmp_line = '';
			for(j=0;j<src_arr[i].length;j++)
			{
				tmp_char = src_arr[i].charAt(j);
				if(tmp_char == "\t")
				{
					col = col + tab_width;
				}
				else
				{
					col++;
				}

				if(col == column)
				{
					tmp_line = tmp_line + tmp_char.bold.yellow;
				}
				else
				{
					tmp_line = tmp_line + tmp_char;
				}
			}
			src_arr[i] = tmp_line;
			line_num = " " + (errorLog.padString(i.toString(),pad) + ": ").bold.yellow
			
		}
		else
		{
			line_num = " " + errorLog.padString(i.toString(),pad) + ": ";
		}
		detail = detail + line_num + src_arr[i] + "\n";
	}
	
	var out = label + ' - ERROR: \n'.bold.red + file.bold + '\n';
	out = out + big_red_line;
	out = out + msg.yellow + '\n';
	out = out + 'on line ' + line + ' column ' + column + "\n";
	out = out + detail;
	out = out + big_red_line;
	util.log(out)
}

module.exports = errorLog;

// End of File
