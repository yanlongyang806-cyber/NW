/* Auto-refresh for ServerMon
 *
 * @depends YUI
 * @depends command-gui.js
 *
 */

var updater = null;

var update_url = null;

var update_text = null;
//keep the initial dom innerHTML for the first update.
var initial_dom_html = null;
var update_lastseen = new Date();

var update_args = null;

var update_request = 0;

var request_failure = false;
var request_isred = false;

var update_element = null;

var auto_refresh_cookie = escape(document.location.href);
//auto_refresh_cookie = auto_refresh_cookie.replace(/\.g/,"");
//special characters that cause YUI to get incorrect values for the cookie
auto_refresh_cookie = auto_refresh_cookie.replace(/%/g,"");
auto_refresh_cookie = auto_refresh_cookie.replace(/\//g,"");

//the number of seconds to wait between auto refresh.
var auto_refresh_seconds = 3.0;

// If true, always do update even if nothing has changed.
var always_update = false;

// This is set to true when something in the page does not want auto-refresh, for instance, if it handles auto-refresh itself.
var disable_auto_refresh = false;

//Call this to setup the auto updater.
function load(element, swapelement)
{
    unfuckIE();

	update_args = getArgs();
    update_args['update'] = 1;
		
	update_url = document.location.protocol + "//" + document.location.host;
	update_url = update_url + document.location.pathname;
	
	// determine if auto-update should be checked
	var au_default = document.getElementById('defaultautorefresh');
	var au = document.getElementById('autorefresh');
	var defaultstatus = (au_default == null ? false : (au_default.value == 1 ? true : false));
	var savedcheckedstatus = YAHOO.util.Cookie.get(auto_refresh_cookie);
	if (savedcheckedstatus)
			au.checked = (savedcheckedstatus == 1);
	else 
		au.checked = defaultstatus;

	update_element = document.getElementById(element);
    initial_dom_html = update_element.innerHTML;


    var refreshButton = new YAHOO.widget.Button("refreshbutton", {onclick: { fn: update }});
    var xmlbutton = new YAHOO.widget.Button("xmlbutton", {onclick: { fn: xmlify }});

    if (update_args["seconds"]) {
        auto_refresh_seconds = update_args["seconds"];
        delete update_args["seconds"];
    }
    setAutorefreshTimeout(auto_refresh_seconds);
}

function setAutorefreshTimeout(seconds)
{
    if (updater)
        updater.cancel();

    updater = YAHOO.lang.later(seconds*1000.0, this, setLastSeen, [], true);
}

//IE7 unfuckage. ala http://soledadpenades.com/2007/05/17/arrayindexof-in-internet-explorer/
function unfuckIE() {
    if(!Array.indexOf){
	    Array.prototype.indexOf = function(obj){
	        for(var i=0; i<this.length; i++){
	            if(this[i]==obj){
	                return i;
	            }
	        }
	        return -1;
	    }
	}
}

//Get and strip the query parameters so they can be passed back to the auto-updater.
function getArgs(replace) {
	var args = new Object();
	var query = location.search.substring(1);
	var pairs = query.split("&");
	for(var i = 0; i < pairs.length; i++) {
		var pos = pairs[i].indexOf('=');
		if (pos == -1) continue;
		var argname = pairs[i].substring(0,pos);
		var value = pairs[i].substring(pos+1);

		if (argname  != "update" && argname != "fetch_time") {
    		args[argname] = unescape(value);
        }
	}
	return args;
} 

// set cookie with auto-refersh state
function remember(o) {
	YAHOO.util.Cookie.set(auto_refresh_cookie, (o.checked?'1':'0'));
}

var update_animation = null;

// Marks the page freshness in the auto-refresh div and updates the page if the checkbox is checked.
function setLastSeen(o, data) {
    var refreshtimeEl = document.getElementById('refreshtime');

    var now = new Date();
    var secondsElapsed = (now.valueOf()/1000.0 - update_lastseen.valueOf()/1000.0);
    var se = "" + secondsElapsed;
    if (se.indexOf('.')) se = se.substring(0, se.indexOf('.') + 3);
    else se = se + ".00";

    var pulse = false;
    if ( request_failure ) {
        if (!request_isred) {
            request_isred = true;
            YAHOO.util.Dom.setStyle('refreshtime', 'background-color', "#FF9999");
        }
    } else {
        refreshtimeEl.innerHTML = "[refreshed " + se + "s ago]";
        if ( secondsElapsed > 5.0 ) { //been a while, better show as such
            if (!request_isred) {
                request_isred = true;
                YAHOO.util.Dom.setStyle('refreshtime', 'background-color', "#FF9999");
            }
        } else { //recent update. everything's fine.
            if (request_isred) {
                YAHOO.util.Dom.setStyle('refreshtime', 'background-color', "#FFFFFF");
                request_isred = false;
            }
        }
    }

    //update the page if the checkbox is checked.
    var au = document.getElementById('autorefresh');
	if (au.checked == true && !disable_auto_refresh) update();
}

function responseSuccess(o) {
    if (!o.responseText) return;
    var check_text = o.responseText.replace(/\s/g,'');
    
    //handle first update
    if (update_text == null) {
        var fc = document.createElement('firstcheck');
        fc.innerHTML = o.responseText;
        update_text = check_text;
        //in the first update we don't have text to compare, so compare the dom. (little bit more expensive)
        if (fc.innerHTML != initial_dom_html) {
            dom_update(fc);
        }
        initial_dom_html = null;
    }
    //handle subsequent update
    else {
        //if the text is not different, then the DOM will not be different so don't update.
        if (always_update || check_text != update_text) {    
            update_text = check_text;
            var newEl = document.createElement('swap');
            newEl.innerHTML = o.responseText;
            dom_update(newEl);
        }
    }

    update_lastseen = new Date();
    request_failure = false;
    update_request = 0;
};

function responseFailure(o) {
    request_failure = true;
    document.getElementById('refreshtime').innerHTML = "Request to server FAILED!";
    update_request = 0;
}

//Dispatch the request.
function update(optional) {
    if (update_request != 0) return;

    var callback =
    {
      success:responseSuccess,
      failure:responseFailure
    };

    var query = "";
    update_args['fetch_time'] = (new Date()).valueOf();

    if (optional)
    {
        for (param in optional) 
        {
            update_args[param] = optional[param];
        }
    }

    for (param in update_args)
    {
        if (update_args[param] && param != "update")
        {
            if (query != "") query += "&";
            query += param + "=" + update_args[param];
        }
    }

    if (query != "") query += "&";
    query += "update=1";

    update_request = YAHOO.util.Connect.asyncRequest('GET', update_url + "?" + query, callback);
}

function xmlify()
{
    var query = "";
    for (param in update_args)
    {
        if (update_args[param] && param != "update")
        {
            if (query != "") query += "&";
            query += param + "=" + update_args[param];
        }
    }
    if (query != "") query += "&";
    query += "format=xml";
    document.location = update_url + "?" + query;
}

//These are classes of elements that were added to the dom AFTER getting it from the server.
var ignoreUpdateOnClasses = [ "killed", "refresh_checkbox", "yui-button", "toggleButton" ];
//I fucking hate MSIE.

//Update the DOM recursively starting with the updated element.
function dom_update(newEl)
{
	var rootEl = update_element;
	refresh_element(rootEl, newEl);
    guify_document(rootEl);
}

function refresh_element(oel, uel) {
	var oi; //original dom index
	var ui; //updated dom index

	var lastChild = null;
	var animations = [];
	var removeList = [];

    if (YAHOO.util.Dom.hasClass(oel, "tdCommands") || YAHOO.util.Dom.hasClass(oel, "divCommands") ) {
        for (ui = 0; ui < uel.childNodes.length; ui++) {
            var uChild = uel.childNodes[ui];
            if (uChild.id != null) {
                var match = YAHOO.util.Dom.getFirstChildBy(oel, function(el) { return (el.id == uChild.id); });
                if (match == null) {
                    var pnode = oel.parentNode;
                    pnode.replaceChild(uel, oel);
                    guify_tags(pnode);
                    return;
                }
            }
        }
        return;
    }
    if (YAHOO.util.Dom.hasClass(oel, "js-button")) {
        if (YAHOO.util.Dom.hasClass(uel, 'js-button') && oel.nodeName == uel.nodeName) {
            var pnode = oel.parentNode;
            pnode.replaceChild(uel, oel);
            guify_tags(pnode);
            return;
        }
    }

    if (uel.nodeType == "link")
    {
        if (uel.rel == "shortcut icon")
        {
            favicon.change(uel.href);
        }
    }

    if (uel.tagName.toLowerCase() == "img")
        oel.src = uel.src;
    else if (oel.href || uel.href)
        oel.href = uel.href;
    

    //check if leaf
    if (oel.childNodes.length == 0 && uel.childNodes.length == 0 && oel.nodeTyle == uel.nodeType) {
        oel.parentNode.replaceChild(uel, oel);
        return;
    }

	for (oi = 0, ui = 0; oi < oel.childNodes.length ; oi++ ) {
		var oChild = oel.childNodes[oi];
		var uChild = (ui > uel.childNodes.length)?null:uel.childNodes[ui++];

        //skip ignored classes
        if (oChild.className) {
            if (ignoreUpdateOnClasses.indexOf(oChild.className.split(' ',1)[0]) >= 0) {
                if (uChild != null && uChild.className)
                    if (uChild.className.split(' ',1)[0] != oChild.className.split(' ',1)[0]) ui--;
                continue;
            }
        }

        //if we're out of updated elements, start removing original elements.
		if (uChild == null) {
            //if ((oChild.id != null || oChild.className != null) && oChild.clientHeight > 1) {
			//	removeList.push(oChild);
			//} else {
				oel.removeChild(oChild);
                oi--;
			//}
            continue;
		}

        //skip non-matching text nodes
        if (!(oChild.nodeName == "#text" && uChild.nodeName == "#text") && 
            /\S/.test(uChild.nodeValue) != /\S/.test(oChild.nodeValue)) {
            if (/\S/.test(oChild.nodeValue)) oi--;
            else ui--;
            continue;
        }

		//handle text replacement
		if (oChild.nodeName == "#text" && uChild.nodeName == "#text") {
            if (oChild.nodeValue != uChild.nodeValue)
    			oChild.nodeValue = uChild.nodeValue;
		}
		else {
            var match = true;
            if (oChild.tagName != uChild.tagName) {
                match = false;
            }
            else if (oChild.id != uChild.id) {
                match = false;
            }
            else if (oChild.id == null && oChild.className != uChild.className) {
                match = false;
            }
            if ( !match )
            {	//found an add or remove node. (i.e. not a node with a matching counterpart to update)

                var match = YAHOO.util.Dom.getFirstChildBy(oel, 
                    function(el) { 
                        if (el.id == uChild.id) // true only if both el and uChild have an id.
                            return true;
                        else if (el.id != uChild.id)
                            return false;
                        else if (el.nodeName == uChild.nodeName) {
                            if (el.className && uChild.className) {
                                if (el.className.split(' ',1)[0] == uChild.className.split(' ',1)[0]) return true;
                                else return false;
                            }
                            return true;
                        }
                        return false;
                    });
                //look for an updated child in oel
                if (match)
                {	//remove oChild because the next node is further down the list.
                    ui--; //keep the same uChild for the next comparison.
                    var och = 0;
                    //if (oChild.hasAttribute("clientHeight")) och = oChild.clientHeight;
                    if ((oChild.id != null || oChild.className != null) && och > 1) {	//lazy removal, animation.
                        removeList.push(oChild);
                    } else {	//immediate removal, no animation
                        oel.removeChild(oChild);
                        oi--;
                    }
                }
                else
                {	//add the uChild because it is not in the list
                    if (lastChild != null) 
                        YAHOO.util.Dom.insertAfter(uChild, lastChild);
                    else 
                        YAHOO.util.Dom.insertBefore(uChild, oChild);
                    
                    ui--; //back up uel because uChild has been removed.

                    lastChild = oel.childNodes[oi];
                    guify_tags(uChild);

                    //Animate for supported browsers!

/* Disabling insert animations for now. hasAttribute and clientHeight seem to be broken.
                    //save the height so we can expand to it.
                    if (uChild.hasAttribute("clientHeight")) {
                        var uHeight = uChild.clientHeight;
                        if ( uHeight > 0 ) {
                            //set the style for expansion
                            YAHOO.util.Dom.setStyle(uChild, "height", "1px");
                            YAHOO.util.Dom.setStyle(uChild, "overflow", "hidden");
                        
                            var expandComplete = function() { 
                                var el = this.getEl();
                                YAHOO.util.Dom.setStyle(el, "overflow", "");
                                YAHOO.util.Dom.setStyle(el, "height", "");
                            }
                            var expandAnim = new YAHOO.util.Anim(uChild, {height: {to: uHeight}}, 0.3 );
                            expandAnim.onComplete.subscribe(expandComplete);
                            animations.push(expandAnim);
                        }
                    }
*/
                }
            }
            else
            {
                //move down the list so the insertion point stays correct.
                lastChild = oChild;
                //do comparison for the children.
                if (oChild.className != uChild.className)
                    oChild.className = uChild.className;
                
                refresh_element(oChild,uChild);
            }
        }
	}
	//make sure to append any new uChild elements.
	while (ui < uel.childNodes.length)
	{
		var uChild = uel.childNodes[ui++];
		if (lastChild != null) YAHOO.util.Dom.insertAfter(uChild, lastChild);
		else oel.appendChild(uChild);
		lastChild = oel.lastChild;

        guify_tags(uChild);
        
        //Animate for supported browsers:

/* Disabling animations for now. hasAttribute and clientHeight seem to break randomly...
        //save the height so we can expand to it.
        if (uChild.hasAttribute("clientHeight")) {
            var uHeight = uChild.clientHeight;

            if ( uHeight > 0 ) {
                //set the style for expansion
                YAHOO.util.Dom.setStyle(uChild, "height", "1px");
                YAHOO.util.Dom.setStyle(uChild, "overflow", "hidden");
                            
                var expandComplete = function() { 
                var el = this.getEl();
                    YAHOO.util.Dom.setStyle(el, "overflow", "");
                }
                var expandAnim = new YAHOO.util.Anim(uChild, {height: {to: uHeight}}, 0.3 );
                expandAnim.onComplete.subscribe(expandComplete);
                animations.push(expandAnim);
            }
        }
*/
	}

	while ( removeList.length > 0) {
		var oChild = removeList.pop();
		oChild.className = "killed";
		YAHOO.util.Dom.setStyle(oChild, "background-color", "black");
		YAHOO.util.Dom.setStyle(oChild, "overflow", "hidden");
        
        oChild.parentNode.removeChild(oChild);

/* Disabling Animations because IE sucks.
		var collapseComplete = function() { 
			var el = this.getEl(); 
			el.parentNode.removeChild(el); 
            YAHOO.util.Dom.setStyle(el, "height", "");
		}
		var animattr = {
			height: { to: 0 }
		};
		var collapseAnim = new YAHOO.util.Anim(oChild, animattr, 0.3 );
		collapseAnim.onComplete.subscribe(collapseComplete);
		animations.push(collapseAnim);
        */
	}

	//fire all animations
	//for (var i = 0; i < animations.length; i++) animations[i].animate();
}

//remove this function.
function toggle_updates() {}
