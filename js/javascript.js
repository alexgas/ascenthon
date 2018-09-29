$(document).ready(function(){
    var abortarAccion = false;
    var pisoActual = 0;

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
        let pisos = [2,3];
        startAction(pisos);
    });

    function startAction(pisos) {
        pisos.forEach(function (piso) {
            $("#bt"+piso).append('<img class="parpadea" style="position: absolute" src="img/Num' + piso + '%20Apagado.png">')
        });
        startCounter(3);
        setTimeout(function(){
            if(!abortarAccion){
                moverPiso(pisos);
            }else{
                pisos.forEach(function (piso) {
                    $("#bt"+piso).find('.parpadea').remove();
                });
            }
        }, 3500);
    }

    function startCounter(counter){
        if(counter > 0){
            setTimeout(function(){
                $("#counter")[0].innerHTML = counter;
                counter--;
                startCounter(counter);
            }, 1000);
        }
    }

    function moverPiso(pisos) {
        pisos.forEach(function (piso) {
            // $("#bt"+piso).children().first().attr('src', 'img/Num'+piso+' Apagado.png');
            setDelay(piso, pisos.indexOf(piso))
        });
    };
    function setDelay(piso, i) {

        setTimeout(function () {
            $("#button-show-door").trigger('click');
            if(piso > pisoActual){
                $(".arrow-down").hide();
                $(".arrow-up").addClass('parpadea');
            }else{
                $(".arrow-up").hide();
                $(".arrow-down").addClass('parpadea');
            }
            // console.log(piso);
            $("#bt"+piso).find('.parpadea').remove();
            setTimeout(function () {
                $("#button-hide-door").trigger('click');
                $(".arrow-down").show();
                $(".arrow-up").show();
                $(".arrow-down").removeClass('parpadea');
                $(".arrow-up").removeClass('parpadea');

                $("#bt"+piso).children().first().attr('src', 'img/Num'+piso+' Encendido.png');
                $("#bt"+pisoActual).children().first().attr('src', 'img/Num'+pisoActual+'.png');
                pisoActual = piso;
            }, 4000);

           $(".flat-number")[0].innerHTML = piso;


        }, i*10000);
    }

    // Peticiones AJAX

    function createNewEvent(img64, uniqueid, date) {
        var xhttp;

        // Validar variables

        $.ajax({
            type: "POST",
            url: 'http://ascensor.hackathon.local:8085/hackv1/nuevoTrayecto',
            data: {id:uniqueid, date:date, pisoActual:pisoActual, img:img64},
            success: function (data) {
                console.log(data);
                if(data.pisos){
                    startAction(data.pisos)
                }
            },
        });
    }

    function guidGenerator() {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

});