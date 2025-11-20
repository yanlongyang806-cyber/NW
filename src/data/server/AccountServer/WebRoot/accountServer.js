$(document).ready(function() {
     $("input").bind("blur", function () {
        $(this).val($.trim($(this).val()));
     });
});
