$(document).ready(function(){

    // jQuery methods go here...
    $("#button-close-door").click(function(){
        $(".door").show();
    });
    $("#button-open-door").click(function(){
        $(".door").hide();
    });

});