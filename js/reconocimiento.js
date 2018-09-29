let $ = jQuery.noConflict();

$( function (){

    let streaming = false;
    let video = document.getElementById('videoInput');
    let utils = new Utils('errorMessage'); //use utils class
    let classifier = new cv.CascadeClassifier();
    let faceCascadeFile = 'haarcascade_frontalface_default.xml';
    let contador = 0;
    let faceImages = [];


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

                    console.log('clean');
                    src.delete();
                    dst.delete();
                    gray.delete();
                    faces.delete();
                    faceImages = [];
                    contador = 0;
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
                            console.log('hay una cara!!!');
                            //console.log(base64);
                            // createNewEvent(base64);

                            // dibujar rectangulos en caras.
                            for (let i = 0; i < faces.size(); ++i) {
                                let face = faces.get(i);
                                let point1 = new cv.Point(face.x, face.y);
                                let point2 = new cv.Point(face.x + face.width, face.y + face.height);
                                cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
                                //cv.imshow('canvasOutput', dst);
                                //crop face
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

                                    let cara = document.getElementById('canvasOutput2');
                                    let base64 = cara.toDataURL();

                                    //let date = this.Date.now();
                                    //let eventId = guidGenerator();
                                    //llamada a metodo que envia imagen al servidor
                                    //createNewEvent(base64, eventId, date);

                                    faceImages.push(base64);
                                    // source.delete();
                                    //dest.delete();
                                }

                            }
                        }
                        cv.imshow('canvasOutput', dst);
                        cv.imshow('canvasOutputNoFaces', dst);
                        //let delay = 1000 / FPS - (Date.now() - begin);

                    }else{
                        console.log('numero de caras: ' + faceImages.length);
                        streaming = false;
                        contador = 0;
                    }
                    setTimeout(processVideo, 500);
                }
            } catch (err) {
                console.dir('Error: ' + err);
            }

    };

    //Listener para el botón del ascensor
    $('#button-hide-door').on('click', () => {
        streaming = true;
        processVideo();

    });

});