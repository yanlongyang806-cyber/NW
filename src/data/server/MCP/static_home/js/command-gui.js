/*
    Command Menuizer
        This script will turn <command> tags into AJAX buttons.

        @depends YUI
        @depends auto-refresh.js
*/

var button = 0;

var query = [];

var querystring = this.location.search.substring(1);
if (querystring.length > 0){
    var params = querystring.split("&");
    for (var i=0 ; i  <params.length ; i++){
        var pos = params[i].indexOf("=");
        var name = params[i].substring(0, pos);
        var value = params[i].substring(pos + 1);
        query[name] = (value?value:true);
    }
}

function guify_tags(element)
{
    menuize_commands(element);
    menuize_editables(element);
    buttonize_anchors(element);
}

function guify_document(element)
{
   limitNav_load();
   buttonize_limitnav(element);
}

//convert all <command> child nodes to menu buttons
function menuize_commands(element)
{
	var commandblocks = YAHOO.util.Dom.getElementsByClassName('tdCommands','td');
	commandblocks = commandblocks.concat(YAHOO.util.Dom.getElementsByClassName('divCommands','div'));
	
	var buttons = [];

	for (var i = 0; i < commandblocks.length; i++) {
		var block = commandblocks[i];
		var blockEl = new YAHOO.util.Element(block);

		if (!YAHOO.util.Dom.isAncestor(element, block))
			continue;

		var commands = blockEl.getElementsByTagName('command');
		var items = [];

		var x = 0;
		for (var j = 0; j < commands.length; j++) {
			var cmd = commands[j];
			if (cmd.parentNode.parentNode == block && cmd.menuized != true)
			{
                cmd.setAttribute('title', "Execute Commmand: " + cmd.getAttribute('name'));
				items[x++] = { text: cmd.getAttribute('name'), value: cmd.id, onclick: { fn: menuCommandCallback, obj: cmd }};
				cmd.menuized = true;
			}
		}
		
		if (items.length == 1)
		{
			buttons[button] = new YAHOO.widget.Button({
					label: items[0].text,
					id: "commands" + button, 
					onclick: { fn: buttonCommmandCallback, obj: items[0].onclick.obj },
					container: block });
			button++;
		}
		else if (items.length > 1)
		{
			buttons[button] = new YAHOO.widget.Button({
					type: "menu",
					id: "commands" + button, 
					label: "commands",
					menu: items, 
					container: block });
			button++;
		}
	}
}

//These callbacks are here because they seem to break if I put them inline.
function buttonCommmandCallback(type, cfgObj) {
	popModalDialog(cfgObj);
}
function menuCommandCallback(type, args, cfgObj) {
	popModalDialog(cfgObj);
}

//Pop a modal dialog and initiate an async request command.
function popModalDialog(commandObj)
{
	var modalCommand =  
	        new YAHOO.widget.Panel("commandpanel",   
	            { modal: true,
                  close: true,
                  draggable: true,
                  //constraintoviewport: true,
                  iframe: true,
	              visible: false
	            }  
	        ); 

	var url = commandObj.getAttribute('href');
	var args = url.split("?");
	if (args.length > 1) {
		url = args[0];
		args = args[1] + "&xml=1";
	} else {
		args = "xml=1";
	}

    if (commandObj.getAttribute('forceupdate')) {
        modalCommand.subscribe("destroy", function(type,args) { update();});
        modalCommand.subscribe("hide", function(type,args) { update();});
    }

    //escape key listener to dismiss the modal
    var kl = new YAHOO.util.KeyListener(document, { keys:27 },  							
												  { fn:modalCommand.destroy,
													scope:modalCommand,
													correctScope:true }, "keyup" ); 
	modalCommand.cfg.queueProperty("keylisteners", kl);

    //set the content.
	modalCommand.setHeader(commandObj.getAttribute('title')); 
	modalCommand.setBody("Loading Command..."); 
    modalCommand.setFooter("&nbsp;");
    YAHOO.util.Dom.setStyle(modalCommand.footer, "text-align", "right");
    
    //attach the modal and prep to show.
    modalCommand.render(document.body); 


    //configure the command request
    var callback = {
        success: processModalCommand,
        failure: function(o) {
            var el = o.argument;
            el.innerHTML = "CONNECTION FAILED!";
        },
        argument: modalCommand
    };

	//dispatch the initial command AJAX request.
	var request = YAHOO.util.Connect.asyncRequest('POST', url, callback, args);
    
    modalCommand.subscribe("destroy", function () { 
	     if (request) {
            if (YAHOO.util.Connect.isCallInProgress(request)) {
                YAHOO.util.Connect.abort(request);
            }
         }
	});

    //show the modal window to block further interaction.
    modalCommand.center();
	modalCommand.show(); 
}

//Handle the initial command AJAX request.
function processModalCommand(o) {
    var el = o.argument;
    if (!el.body) return;
    //Here we'll need to parse the response and parameterize any forms found in it.
    var responseEl = document.createElement('swap');
    //response text
    responseEl.innerHTML = "<div style=\"display:none;width:0px\">I fucking hate IE</div>" + o.responseText;

    var cmdresponse = responseEl.getElementsByTagName('command_response')[0];

    if (cmdresponse) {
        var val = cmdresponse.getAttribute('value');
        if (val == "onmcp" || val == "immediate") {
            el.body.innerHTML = "Executing Command...";
            YAHOO.lang.later(1000, this, function() { o.argument.destroy(); }, [], false);
        }
        else if (val == "redirect") {
            document.location = cmdresponse.getAttribute('href');

        }
        else if (val == "form") {
            var form = YAHOO.util.Dom.getFirstChildBy(responseEl, function(el) { return el.tagName.toLowerCase() == "form"; } );
            if (form == null)
                form = YAHOO.util.Dom.getFirstChildBy(cmdresponse, function(el) { return el.tagName.toLowerCase() == "form"; } );
            
            var focusinput = null;
            var okButtonLabel = "Ok";
            var inputs = 
                YAHOO.util.Dom.getElementsBy(
                    function(el){ return YAHOO.util.Dom.isAncestor(form, el); },
                    'input',
                    responseEl);            //strip buttons from the form
            for (var i = inputs.length - 1; i >= 0; i--) {
                var input = inputs[i];
                if (input.type == 'button' || input.name == 'confirm') 
                    input.parentNode.removeChild(input);
                else if (input.type == 'text')
                    focusinput = input;
                else if (input.type == 'submit') {
                    if (input.value) okButtonLabel = input.value;
                    input.parentNode.removeChild(input);
                }
            }
            //This parameter gets stripped with the buttons.
            var xmlinput = document.createElement('input');
            xmlinput.setAttribute("value","Yes");
            xmlinput.setAttribute("name","confirm");
            xmlinput.setAttribute("type","hidden");
            form.appendChild(xmlinput);

            //for fun.
            xmlinput = document.createElement('input');
            xmlinput.setAttribute("value","1");
            xmlinput.setAttribute("name","xml");
            xmlinput.setAttribute("type","hidden");
            form.appendChild(xmlinput);

            //create buttons
            var cancelButton = new YAHOO.widget.Button({
                    label:"Cancel",
                    id:"cancelButton",
                    container:el.footer }); 
            cancelButton.on("click", function(o){ el.destroy(); });
            var okButton = new YAHOO.widget.Button({
                    label:okButtonLabel,
                    id:"okButton",
                    container:el.footer}); 
            okButton.on("click", function() { 
                dispatchCommand(el, form); 
                okButton.destroy(); 
                cancelButton.set("label","Done");
                cancelButton.focus();
            });

            //Attach eventhandler to intercept form submission. I hate MSIE.
            form.onsubmit = function () { 
                dispatchCommand(el, form);
                okButton.destroy();
                cancelButton.set("label","Done");
                cancelButton.focus();
                return false; 
            };

            //place the form
            el.body.innerHTML = "<div></div>";
            el.body.replaceChild(form,YAHOO.util.Dom.getFirstChild(el.body));
            el.center();
            if (focusinput != null) 
                focusinput.focus();
            else
                okButton.focus();
        }
        else if (val == "defer") {
            var form = YAHOO.util.Dom.getFirstChildBy(responseEl, function(el) { return el.tagName.toLowerCase() == "form"; } );
            if (form == null)
                form = YAHOO.util.Dom.getFirstChildBy(cmdresponse, function(el) { return el.tagName.toLowerCase() == "form"; } );
            var action = form.action;
            //more fun
            var xmlinput = document.createElement('input');
            xmlinput.value = "1";
            xmlinput.name = "xml";
            xmlinput.type = "hidden";
            form.appendChild(xmlinput);

            //configure the command request
            var callback = {
                success: updateModalCommand,
                failure: function(o) {
                    var el = o.getEl();
                    el.innerHTML = "CONNECTION FAILED!";
                },
                argument: el
            };
            //create the subsequent AJAX request
            YAHOO.util.Connect.setForm(form);
            el.body.innerHTML = "Waiting for command to execute...";

            var cancelButton = new YAHOO.widget.Button({
                    label:"Done",
                    id:"cancelButton",
                    container:el.footer }); 
            el.center();
            cancelButton.on("click", function(o){ el.destroy(); });
            cancelButton.focus();

            var request = YAHOO.util.Connect.asyncRequest('POST', action, callback);
            el.subscribe("destroy", function () { 
	            if (request) {
                    if (YAHOO.util.Connect.isCallInProgress(request)) {
                        YAHOO.util.Connect.abort(request);
                    }
                }
	        });
        }
        else if (val == "edit") {
            var form = YAHOO.util.Dom.getFirstChildBy(responseEl, function(el) { return el.tagName.toLowerCase() == "form"; } );
            if (form == null)
                form = YAHOO.util.Dom.getFirstChildBy(cmdresponse, function(el) { return el.tagName.toLowerCase() == "form"; } );
            
            var focusinput = null;
            var okButtonLabel = "Ok";

            //for fun.
            xmlinput = document.createElement('input');
            xmlinput.value = "1";
            xmlinput.name = "xml";
            xmlinput.type = "hidden";
            form.appendChild(xmlinput);

            //create buttons
            var cancelButton = new YAHOO.widget.Button({
                    label:"Cancel",
                    id:"cancelButton",
                    container:el.footer }); 
            cancelButton.on("click", function(o){ el.destroy(); });
            var okButton = new YAHOO.widget.Button({
                    label:okButtonLabel,
                    id:"okButton",
                    container:el.footer}); 
            okButton.on("click", function() { 
                dispatchCommand(el, form); 
                okButton.destroy(); 
                cancelButton.set("label","Done");
                cancelButton.focus();
            });

            //Attach eventhandler to intercept form submission. I hate MSIE.
            form.onsubmit = function () { 
                dispatchCommand(el, form);
                okButton.destroy();
                cancelButton.set("label","Done");
                cancelButton.focus();
                return false; 
            };

            //place the form
            el.body.innerHTML = "<div></div>";
            el.body.replaceChild(form,YAHOO.util.Dom.getFirstChild(el.body));
            el.center();
            if (focusinput != null) 
                focusinput.focus();
            else
                okButton.focus();
        }
        else if (val == "error") {
            el.body.innerHTML = "Encountered an error executing command:<br/>";
            el.body.appendChild(responseEl);
            el.center();
        }
        else {
            el.body.innerHTML = "Illegal command response from server:" + val;
            el.center();
        }
    }
    else {
        o.argument.destroy();
    }
}

//Initiates a subsequent AJAX request upon submission of the modal panel's form.
function dispatchCommand(modalCommand, form) {
    var action = form.action;
    
    //configure the command request
    var callback = {
        success: updateModalCommand,
        failure: function(o) {
            var el = o.getEl();
            el.innerHTML = "CONNECTION FAILED!";
            el.center();
        },
        argument: modalCommand
    };

    //create the subsequent AJAX request
    YAHOO.util.Connect.setForm(form);
    
    modalCommand.body.innerHTML = "Executing Command...";
    modalCommand.center();

    var request = YAHOO.util.Connect.asyncRequest('POST', action, callback);
    modalCommand.subscribe("destroy", function () { 
	     if (request) {
            if (YAHOO.util.Connect.isCallInProgress(request)) {
                YAHOO.util.Connect.abort(request);
            }
         }
	});
}
	
function updateModalCommand(o) {
    var el = o.argument;
    if (!el.body) return;
    //Here we'll need to parse the response and parameterize any forms found in it.
    var responseEl = document.createElement('swap');
    //response text

    var responseString = "<div style=\"display:none;width:0px;\">Seriously, IE sucks.</div>" + o.responseText;

    responseEl.innerHTML = responseString;
    
    var cmdresponse = responseEl.getElementsByTagName('command_response')[0];

    if (cmdresponse) {
        var val = cmdresponse.getAttribute('value');
        if (val == "onmcp" || val == "immediate") {
            el.body.innerHTML = "Done.";
            el.center();
            YAHOO.lang.later(1000, this, function() { if (el != null) el.destroy(); }, [], false);
        }
        else if (val == "defer") { //Do wait for command.
           var form = YAHOO.util.Dom.getFirstChildBy(responseEl, function(el) { return el.tagName.toLowerCase() == "form"; } );
            if (form == null)
                form = YAHOO.util.Dom.getFirstChildBy(cmdresponse, function(el) { return el.tagName.toLowerCase() == "form"; } );
            var action = form.action;
            //more fun
            var xmlinput = document.createElement('input');
            xmlinput.value = "1";
            xmlinput.name = "xml";
            xmlinput.type = "hidden";
            form.appendChild(xmlinput);

            //configure the command request
            var callback = {
                success: updateModalCommand,
                failure: function(o) {
                    var el = o.getEl();
                    el.innerHTML = "CONNECTION FAILED!";
                },
                argument: el
            };
            //create the subsequent AJAX request
            YAHOO.util.Connect.setForm(form);
            el.body.innerHTML = "Waiting for command to execute...";
            el.center();
            var request = YAHOO.util.Connect.asyncRequest('POST', action, callback);
        }
        else if (val == "success"){
            responseEl.innerHTML = "<pre>" + responseEl.innerHTML + "</pre>";
            el.body.replaceChild(responseEl, el.body.firstChild);
            el.center();
        }
        else if (val == "success_hidden"){
            el.hide();
        }
        else if (val == "error") {
            el.body.innerHTML = "Encountered an error executing command:<br/>";
            el.body.appendChild(responseEl);
            el.center();
        }
        else {
            el.body.innerHTML = "Illegal command response from server:" + val;
            el.center();
        }
    }
}

//Replaces anchor tags with 'js-button' class with YUI buttons that make POST xml requests
function buttonize_anchors(element)
{
    var atags = YAHOO.util.Dom.getElementsByClassName('js-button', 'a');

    for (var i = 0; i < atags.length; i++) {
        var tag = atags[i];
        if (YAHOO.util.Dom.hasClass(tag, 'js-buttonized'))
            continue;

        YAHOO.util.Dom.addClass(tag, 'js-buttonized');

        if (!YAHOO.util.Dom.isAncestor(element, tag))
			continue;

        var id = "anchors" + button;
        var label = tag.innerHTML;
        var href = tag.href;
        tag.innerHTML = "";
        tag.href = "javascript:void(0);";
        tag.textContent = "";

        var oAButton = new YAHOO.widget.Button({
            type: "push",
            href: href,
            id: id,
            container: tag,
            onclick: { fn: buttonAnchorCallback, obj: {id:id,href:href} },
            label: label
        });


        button++;
    }
}

//The anchor button click callback
function buttonAnchorCallback(type, cfgObj) {
    this.setAttributes({disabled:true, label:"loading..."});

    var url = cfgObj.href;
    var args = url.split("?");
	if (args.length > 1) {
		url = args[0];
		args = args[1] + "&xml=1";
	} else {
		args = "xml=1";
	}

    //configure the command request
    var callback = {
        success: function(o) {
            //Force AutoRefresh to update
            update();
        },
        failure: function(o) {
            o.setAttributes({disabled:false});
            alert("Button request failed for URL: " + url);
        }
    };

	//dispatch the initial command AJAX request.
	var request = YAHOO.util.Connect.asyncRequest('POST', url, callback, args);
}

function menuize_editables(element)
{
    var Dom = YAHOO.util.Dom;
    var Event = YAHOO.util.Event;

    var etags = YAHOO.util.Dom.getElementsByClassName('editable','span');

    for (var i = 0; i < etags.length; i++)
    {
        var tag = etags[i];

        if (!YAHOO.util.Dom.isAncestor(element, tag))
			continue;

        if (!tag.menuized)
        {
            tag.menuized = true;
            var path = tag.getAttribute("path");

            tag.setAttribute("title", "Edit Field " + path);
            tag.setAttribute("name", path);
            tag.setAttribute("href", "/edit?xpath=" + query["xpath"] + ".Struct" + "&fieldpath=" + path);
            tag.setAttribute("forceupdate", true);
        }
    }
    //This leaks the object in auto-refresh.
    Event.on(element, 'dblclick', function(ev) {
        var tar = Event.getTarget(ev);
        while (tar != element) {
            if (Dom.hasClass(tar, 'editable')) {
                popModalDialog(tar); 
                break;
            }
            tar = tar.parentNode;
        }
    });
}

function buttonize_limitnav(element)
{
    var divOffset = document.getElementById("Offset");
    var divLimit = document.getElementById("Limit");
    var divCount = document.getElementById("Count");
    var divMore = document.getElementById("More");
    var divNav = document.getElementById("navigation_bar");

    if (!divNav)
        return;

    if (!divOffset || !divLimit  || !divCount || !divMore )
    {
        divNav.innerHTML = "";
        return;
    }
    if (!YAHOO.util.Dom.hasClass(divOffset, "svrParam") ||
        !YAHOO.util.Dom.hasClass(divLimit, "svrParam") ||
        !YAHOO.util.Dom.hasClass(divCount, "svrParam") ||
        !YAHOO.util.Dom.hasClass(divMore, "svrParam"))
    {
        divNav.innerHTML = " ";
        return;
    }

    var limit = parseInt(divLimit.innerHTML);
    var offset = parseInt(divOffset.innerHTML);
    var count = parseInt(divCount.innerHTML);
    var more = parseInt(divMore.innerHTML);
    

    if (limit == 0)
    {
        divNav.innerHTML = "Viewing " + count + " elements starting at:" + offset;
        return;
    }

    var total = offset + count + more;
    var navHTML = "";

    if (offset > 0)
    {
        navHTML += '<button type="button" id="limitPrev">Prev</button>';     
    }
    if (count == 1)
    {
        if (limit == 1) navHTML += ' Viewing ' + limit + ' element: ' + offset + 'of ' + total;
        else navHTML += ' Viewing ' + limit + '(1) element: ' + offset + ' of ' + total;
    }
    else if (count > 1)
    {
        navHTML += ' Viewing ';
        if (limit != count) navHTML += limit + '(' + count + ')';
        else navHTML += limit;
        navHTML += ' elements: ' + offset + ' - ' + (offset + count - 1) + ' of ' + total;
    }
    if (more > 0)
    {
        navHTML += '<button type="button" id="limitNext">Next</button>';
    }
    
    divNav.innerHTML = navHTML;


    if (offset > 0)
    {
        var prevButton = new YAHOO.widget.Button("limitPrev", {onclick: { fn: limitNav_Prev }});
    }
    if (more > 0)
    {
        var nextButton = new YAHOO.widget.Button("limitNext", {onclick: { fn: limitNav_Next }});
    }
    
}

function limitNav_Prev()
{
    var divOffset = document.getElementById("Offset");
    var divLimit = document.getElementById("Limit");

    if (!divOffset || !divLimit)
        return;

    if (!YAHOO.util.Dom.hasClass(divOffset, "svrParam") ||
        !YAHOO.util.Dom.hasClass(divLimit, "svrParam"))
    {
        return;
    }

    var params = new Object();
    params['svrLimit'] = parseInt(divLimit.innerHTML);
    params['svrOffset'] = parseInt(divOffset.innerHTML) - params['svrLimit'];

    window.location.hash = "svr[" + params['svrOffset'] + "," + params['svrLimit'] + "]";

    update(params);
}

function limitNav_Next()
{
    var divOffset = document.getElementById("Offset");
    var divLimit = document.getElementById("Limit");

    if (!divOffset || !divLimit)
        return;

    if (!YAHOO.util.Dom.hasClass(divOffset, "svrParam") ||
        !YAHOO.util.Dom.hasClass(divLimit, "svrParam"))
    {
        return;
    }

    var params = new Object();
    params['svrLimit'] = parseInt(divLimit.innerHTML);
    params['svrOffset'] = parseInt(divOffset.innerHTML) + params['svrLimit'];

    window.location.hash = "svr[" + params['svrOffset'] + "," + params['svrLimit'] + "]";

    update(params);
}

function limitNav_load()
{
    var divOffset = document.getElementById("Offset");
    var divLimit = document.getElementById("Limit");

    if (!divOffset || !divLimit)
        return;

    if (!YAHOO.util.Dom.hasClass(divOffset, "svrParam") ||
        !YAHOO.util.Dom.hasClass(divLimit, "svrParam"))
    {
        return;
    }

    var params = new Object();
    params['svrLimit'] = parseInt(divLimit.innerHTML);
    params['svrOffset'] = parseInt(divOffset.innerHTML);

    var match = /svr\[(\d+),(\d+)\]/i.exec(window.location.hash);
    if (match && match.length == 3)
    {
        if (params['svrLimit'] != match[2] || params['svrOffset'] != match[1])
        {
            params['svrLimit'] = match[2];
            params['svrOffset'] = match[1];

            update(params);
            return true;
        }
    }
    return false;
}

function toggleTable(tableId, button, num)
{
    if($jquery(button).text() == 'Expand')
    {
        $jquery('.' + tableId + ' tr').show();
        $jquery(button).text('Collapse');
    }
    else
    {
        $jquery('.' + tableId + ' tr').slice(num+1).hide();
        $jquery(button).text('Expand');
    }
}
