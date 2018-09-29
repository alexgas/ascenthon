$( function (){

    let streaming = false;
    let video = document.getElementById('videoInput');
    let utils = new Utils('errorMessage'); //use utils class
    let classifier = new cv.CascadeClassifier();
    let faceCascadeFile = 'haarcascade_frontalface_default.xml';
    let contador = 0;

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

        let faceImages = [];


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
                    src.delete();
                    dst.delete();
                    gray.delete();
                    faces.delete();
                    faceImages = [];
                    return;
                } else {
                    contador++;
                    let begin = Date.now();

                    cap.read(src);
                    src.copyTo(dst);
                    cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);

                    cv.imshow('canvasOutputNoFaces', dst);

                    let imagen = document.getElementById('canvasOutputNoFaces');
                    let base64 = imagen.toDataURL();

                    // detectar caras.
                    classifier.detectMultiScale(gray, faces, 1.1, 3, 0);

                    //si el vector de caras contiene alguna la enviamos al back
                    if(faces.size() > 0){
                        console.log('hay una cara!!!');
                        //console.log(base64);
                       // createNewEvent(base64);
                    }

                    // dibujar rectangulos en caras.
                    for (let i = 0; i < faces.size(); ++i) {
                        let face = faces.get(i);
                        let point1 = new cv.Point(face.x, face.y);
                        let point2 = new cv.Point(face.x + face.width, face.y + face.height);
                        cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
                    }
                    cv.imshow('canvasOutput', dst);

                    //let delay = 1000 / FPS - (Date.now() - begin);
                    setTimeout(processVideo, 100);
                }
            } catch (err) {
                console.dir('Error: ' + err);
            }

    };


    $('#button-hide-door').on('click', () => {
        streaming = !streaming;
        console.log(faceImages.length);

        processVideo();

    });




});