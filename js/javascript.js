$(document).ready(function(){

    // Métodos jquery y animaciones
    $("#button-hide-door").click(function(){
        setTimeout(function(){
            $(".door").hide();
        }, 2200);
        $(".door").removeClass("door-left-to-rigth").addClass('door-right-to-left');
    });
    $("#button-show-door").click(function(){
        $(".door").removeClass('door-right-to-left').addClass("door-left-to-rigth");
        $(".door").show();
    });

    $("#bt0").click(function(){
        moverPiso();
    });

    function moverPiso() {
        var pisos = [2,3];
        pisos.forEach(function (piso) {
            setDelay(piso, pisos.indexOf(piso))
        });
    };
    function setDelay(piso, i) {

        setTimeout(function () {
            $("#button-show-door").trigger('click');
            if(piso > pisoActual){
                $(".arrow-down").hide();
            }else{
                $(".arrow-up").hide();
            }
            pisoActual = piso;
            console.log(piso);
            setTimeout(function () {
                $("#button-hide-door").trigger('click');
                $(".arrow-down").show();
                $(".arrow-up").show();
                $("#bt"+piso).children().first().attr('src', 'img/Num'+piso+' Apagado.png');
            }, 4000);

           $(".flat-number")[0].innerHTML = piso;

        }, i*7000);
    }

    // Peticiones AJAX
    var xhttp = new XMLHttpRequest();
    var pisoActual = 0;

    function create_new_event(listaHash, pisoActual) {
        //Generar id petición
        var uniqid = Date.now();

        var xhttp;
        if (str == "") {
            document.getElementById("txtHint").innerHTML = "";
            return;
        }
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseJSON.Lista_Destinos);
                this.responseJSON.Lista_Destinos.forEach(function(i) {
                    document.getElementById("bt"+i).removeClass('red').addClass('green');
                    setTimeout(function(){
                        moverPiso(this.responseJSON.Lista_Destinos);
                    }, 2200);
                });
            }
        };
        xhttp.open("GET", "getcustomer.asp?q="+str, true);
        xhttp.send();
    }

});