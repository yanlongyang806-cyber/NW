var $jquery = jQuery.noConflict(); 

$jquery(document).ready(function(){
                $jquery('.rollover_link').hover(
                                function() {
                                                $jquery(this).next().show();
                                },
                                function() {
                                                $jquery(this).next().hide();
                                }
                );
});
