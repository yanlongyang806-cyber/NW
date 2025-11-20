function getDateFromSS2000(seconds)
{
    var tt = new Date();
    tt.setUTCDate(1);
    tt.setUTCMonth(0);
    tt.setUTCFullYear(2000);
    tt.setUTCHours(0);
    tt.setUTCMinutes(0);
    tt.setUTCSeconds(0);

    var d = new Date;

    d.setTime(tt.getTime() + seconds * 1000);

    return d;
}

function convertFromSS2000(seconds)
{
    if (!seconds) return "Unknown";
    var d = getDateFromSS2000(seconds);
    return d.toUTCString();
}

function convertFromSS2000Short(seconds)
{
    if (!seconds) return "Unknown";
    var d = getDateFromSS2000(seconds);
    return dateFormat(d, "yyyy-mm-dd HH:MM:ss Z");
}

$(document).ready(function() {
    $("input").bind("blur", function () {
        $(this).val($.trim($(this).val()));
    });

    $('#mainmenu > li').bind('mouseover', mainmenu_open)
    $('#mainmenu > li').bind('mouseout',  mainmenu_timer)

    var max_width = 0;

    $(".verticalForm label").each(function(i, e) {
        if ($(this).width() > max_width) {
            max_width = $(this).width();
        }
    });

    $(".ss2000").each(function(i, e) {
        seconds = parseInt($(this).html())
        if (seconds) {
            $(this).html(convertFromSS2000(seconds));
        }
    });

    $(".shortss2000").each(function(i, e) {
        seconds = parseInt($(this).html())
        if (seconds) {
            $(this).html(convertFromSS2000Short(seconds));
        }
    });

    max_width += 10

    $(".verticalForm")
        .find("label")
            .css("width", max_width+"px")
            .css("display", "block")
            .css("float", "left")
            .css("text-align", "right")
            .end()
        .find("small")
            .css("margin-left", max_width+10+"px")
            .end()
        .find(".submit")
            .css("margin-left", max_width+"px")

    $("label, input, select").tooltip();
    $(".tablesorter").dataTable();
});

var timeout    = 500;
var closetimer = 0;
var ddmenuitem = 0;

function mainmenu_open() {  
    mainmenu_canceltimer();
    mainmenu_close();
    ddmenuitem = $(this).find('ul').css('visibility', 'visible');
}

function mainmenu_close() {
    if(ddmenuitem) ddmenuitem.css('visibility', 'hidden');
}

function mainmenu_timer() {
    closetimer = window.setTimeout(mainmenu_close, timeout);
}

function mainmenu_canceltimer() {
    if(closetimer) {
        window.clearTimeout(closetimer);
        closetimer = null;
    }
}

document.onclick = mainmenu_close;
