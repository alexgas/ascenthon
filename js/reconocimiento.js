$( function (){

        let video = document.getElementById('videoInput');
        let streaming = false;
        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        let cap = new cv.VideoCapture(video);

        const FPS = 30;
        function processVideo() {

            console.log('Streaming: ' + streaming);

            try {
                if (!streaming) {
                    // clean and stop.
                    console.log('clean');
                    src.delete();
                    dst.delete();
                    return;
                }
                let begin = Date.now();
                // start processing.
                cap.read(src);
                console.log('read');

                cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
                cv.imshow('canvasOutput', dst);
                // schedule the next one.
                let delay = 1000/FPS - (Date.now() - begin);
                setTimeout(processVideo, delay);
            } catch (err) {
                console.dir('Error: ' + err);
            }
        };

// schedule the first one.
        setTimeout(processVideo, 0);

    $('#toggleCapture').on('click', () => {
       streaming = !streaming;
        processVideo();
    });

});