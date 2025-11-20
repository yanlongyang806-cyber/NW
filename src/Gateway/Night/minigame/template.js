
// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

var cache = {};

function tmpl(str, data)
{
	// Figure out if we're getting a template, or if we need to
	// load the template - and be sure to cache the result.
	var fn;
	if(!/[<{\s]/.test(str))
	{
		fn = cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML)
	}
	else
	{
		// Generate a reusable function that will serve as a template
		// generator (and which will be cached).
		var s = "var p=[],print=function(){p.push.apply(p,arguments);};"

			// Introduce the data as local variables using with(){}
			+ "with(obj){p.push('"

			// Convert the template into pure JavSaScript
			+ str.replace(/[\r\t\n]/g, " ")
				.replace(/'(?=[^{]*}})/g,"\t")
				.replace(/'/g, "\\'")
				.replace(/\t/g, "'")
				.replace(/\{\{(.+?)}}/g, "',$1,'")
				.replace(/\{\{/g, "');")
				.replace(/\}\}/g, "p.push('")
			+ "');}return p.join('');";

		fn = new Function("obj", s);
	}

	// Provide some basic currying to the user
	return data ? fn( data ) : fn;
}

module.exports = tmpl;

// End of File
