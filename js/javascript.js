$(document).ready(function(){
    var abortarAccion = false;

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

    $(".container-buttons").click(function () {
        abortarAccion = true;
    });

    $("#demo").click(function(){
        startCounter(3);
        setTimeout(function(){
            if(!abortarAccion){
                moverPiso();
            }
        }, 3500);
    });

    function startCounter(counter){
        if(counter > 0){
            setTimeout(function(){
                $("#counter")[0].innerHTML = counter;
                counter--;
                startCounter(counter);
            }, 1000);
        }
    }

    function moverPiso() {
        var pisos = [2,3];
        pisos.forEach(function (piso) {
            $("#bt"+piso).children().first().attr('src', 'img/Num'+piso+' Apagado.png');
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
            // console.log(piso);
            setTimeout(function () {
                $("#button-hide-door").trigger('click');
                $(".arrow-down").show();
                $(".arrow-up").show();
                $("#bt"+piso).children().first().attr('src', 'img/Num'+piso+' Encendido.png');
                $("#bt"+pisoActual).children().first().attr('src', 'img/Num'+pisoActual+'.png');
                pisoActual = piso;
            }, 4000);

           $(".flat-number")[0].innerHTML = piso;


        }, i*10000);
    }

    // Peticiones AJAX
    var xhttp = new XMLHttpRequest();
    var pisoActual = 0;

    function create_new_event(listaHash, pisoActual) {
        //Generar id petición
        var uniqid = Date.now();

        var xhttp;
       // Validar variables

        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseJSON.Lista_Destinos);
                this.responseJSON.Lista_Destinos.forEach(function(i) {
                    $("#bt"+piso).children().first().attr('src', 'img/Num'+piso+' Apagado.png');
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