$(document).ready(function(){
    let abortarAccion = false;
    let pisoActual = 0;
    let pisos = [];
    let accionHecha = false;
    let viajes = 0;
    let viajesRealizados = 0;

    let streaming = false;
    let video = document.getElementById('videoInput');
    let utils = new Utils('errorMessage'); //use utils class
    let classifier = new cv.CascadeClassifier();
    let faceCascadeFile = 'haarcascade_frontalface_default.xml';
    utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
        classifier.load(faceCascadeFile); // in the callback, load the cascade from file
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            console.log("An error occured! " + err);
        });

    let contador = 0;
    let faceImages = [];



    // Métodos jquery y animaciones
    function hideDoor(){
        $('#audio-open').get(0).play();
        setTimeout(function(){
            $(".door").hide();
        }, 2200);
        $(".door").removeClass("door-left-to-rigth").addClass('door-right-to-left');
        streaming = true;
        processVideo();
    };
    function showDoor() {
        $('#audio-close').get(0).play();
        $(".door").removeClass('door-right-to-left').addClass("door-left-to-rigth");
        $(".door").show();
        streaming = false;
        processVideo();
    }
    $("#button-hide-door").click(function(){

        hideDoor();
    });

    $("#button-show-door").click(function(){
        showDoor();
    });

    $(".container-buttons-left").click(function () {
        // ABORTAR
        pisos = [];
        abortarAccion = true;
        showDoor();
    });

    $("#bt0").click(function () {
        streaming = false;
        pisos = [{Piso:0}];
        abortarAccion = false;
        //startAction(pisos);
    });


    function startAction() {

        startCounter(7);
        setTimeout(function(){
            if(!abortarAccion){
                moverPiso();
            }else{
                pisos.forEach(function (row) {
                    $("#bt"+row.Piso).find('.parpadea').remove();
                });
            }
        }, 11000);
    }

    function startCounter(counter){
        if(counter > 0){
            setTimeout(function(){
                if(abortarAccion){
                    $("#counter")[0].innerHTML = 'Desplazamiento abortado';
                }else{
                    counter--;
                    $("#counter")[0].innerHTML = 'Desplazamiento en ' + counter;
                    startCounter(counter);
                }
            }, 1000);
        }
    }

    function moverPiso() {

        if (pisos.length > 0){
            pisos.forEach(function (row) {
                setDelay(row.Piso, pisos.indexOf(row))
            });
        }
    };
    function setDelay(piso, i) {

        setTimeout(function () {
           showDoor();
            if(piso > pisoActual){
                $(".arrow-down").hide();
                $(".arrow-up").addClass('parpadea');
            }else{
                $(".arrow-up").hide();
                $(".arrow-down").addClass('parpadea');
            }
            console.log('piso destino: ' + piso);

            
             $("#bt"+piso).find('.parpadea').remove();
            setTimeout(function () {
                $('#audio-piso').attr('src', 'audio/Piso_'+piso +'.ogg').get(0).play();
                
                setTimeout(function () {
                    hideDoor();                    
                },2000);
                $(".arrow-down").show();
                $(".arrow-up").show();
                $(".arrow-down").removeClass('parpadea');
                $(".arrow-up").removeClass('parpadea');

                $("#bt"+piso).children().first().attr('src', 'img/Num'+piso+' Encendido.png');
                $("#bt"+pisoActual).children().first().attr('src', 'img/Num'+pisoActual+'.png');
                pisoActual = piso;
                setTimeout(function(){
                    showDoor();
                }, 6000)
            }, 4000);

           $(".flat-number")[0].innerHTML = piso;

        }, i*10000);
    }

    // Peticiones AJAX
    
    function createNewEvent(img64, uniqueid, date) {
        var xhttp;

        // Validar variables

        $.ajax({
            async: false,
            type: "POST",
            url: 'http://10.1.6.45:8085/hackv1/nuevoTrayecto',
            data: {id:uniqueid, date:date, pisoActual:pisoActual, img:img64},
            success: function (data) {

                //console.log(data);
                if(data.datos && data.datos[0]){

                    for (let k in data.datos){

                        let existPiso = false;

                        pisos.forEach(function (row) {

                            if (row.Piso && JSON.stringify(row) === JSON.stringify(data.datos[k]) ) {

                               // console.log('Ya esta marcado este piso');
                                existPiso = true;
                            }
                        });

                        if (!existPiso){

                            //console.log('Nuevo piso a marcar');
                            pisos.push(data.datos[k]);
                        }

                    }

                   // console.log('Pisos: '  + JSON.stringify(pisos));

                    pisos.forEach(function (row) {

                        if($("#bt"+row.Piso).find('.parpadea').length < 1){
                            $("#bt"+row.Piso).append('<img class="parpadea" style="position: absolute" src="img/Num' + row.Piso + '%20Apagado.png">')
                            
                        }
                    });

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

    //CAPTURA DE CARA Y RECONOCIMIENTO


    function processVideo() {


        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        let cap = new cv.VideoCapture(video);
        let gray = new cv.Mat();
        let faces = new cv.RectVector();

        const FPS = 30;


        try {
            if (!streaming) {
                // clean and stop.

                //console.log('clean');
                src.delete();
                dst.delete();
                gray.delete();
                faces.delete();
                faceImages = [];
                contador = 0;
                accionHecha = false;
                $('.left').css('filter', 'contrast(25%)');
                return;

            } else {

                $('.left').css('filter', 'contrast(100%)');
                contador++;

                if (contador <= 5){

                    let begin = Date.now();

                    cap.read(src);
                    src.copyTo(dst);
                    cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);

                    cv.imshow('canvasOutputNoFaces', dst);

                    // detectar caras.
                    classifier.detectMultiScale(gray, faces, 1.1, 3, 0);

                    //si el vector de caras contiene alguna la enviamos al back
                    if(faces.size() > 0){
                       // console.log('hay una cara!!!');
                        if(!accionHecha){
                            startAction();
                            accionHecha = true;
                        };

                        //console.log(base64);

                        // dibujar rectangulos en caras.
                        for (let i = 0; i < faces.size(); ++i) {
                            let face = faces.get(i);
                            let point1 = new cv.Point(face.x, face.y);
                            let point2 = new cv.Point(face.x + face.width, face.y + face.height);
                            cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);

                            /* crop face
                            let source = cv.imread('canvasOutputNoFaces');
                            let dest = new cv.Mat();
                            let rect = new cv.Rect(face.x, face.y, face.width, face.height);
                            if (0 <= rect.x
                                && 0 <= rect.width
                                && rect.x + rect.width <= source.cols
                                && 0 <= rect.y
                                && 0 <= rect.height
                                && rect.y + rect.height <= source.rows) {
                                // box within the image plane
                                dest = source.roi(rect);
                                cv.imshow('canvasOutput2', dest);
                                faceImages.push(base64);

                            */

                        }

                        cv.imshow('canvasOutputNoFaces', dst);
                        let imagen = document.getElementById('canvasOutputNoFaces');
                        let base64 = imagen.toDataURL();
                        let date = this.Date.now();
                        let eventId = guidGenerator();
                        //llamada a metodo que envia imagen al servidor
                        createNewEvent(base64, eventId, date);
                    }

                    cv.imshow('canvasOutput', dst);
                    //let delay = 1000 / FPS - (Date.now() - begin);

                }else{
                    //console.log('numero de caras: ' + faceImages.length);
                    streaming = false;
                    contador = 0;
                }
                setTimeout(processVideo, 500);
            }
        } catch (err) {
            console.dir('Error: ' + err);
        }

    };




});