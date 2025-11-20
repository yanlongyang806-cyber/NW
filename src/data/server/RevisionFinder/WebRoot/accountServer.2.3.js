$(document).ready(function() {
     $("input").bind("blur", function () {
        $(this).val($.trim($(this).val()));
     });

     $(".tablesorter").tablesorter( {widgets: ['zebra']} );
     $(".summary-paginated").tablesorterPager({container: $("#pager")});
});
