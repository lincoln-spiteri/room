let video;

function startUp() {

    video = document.getElementById('video');

    navigator.mediaDevices.getUserMedia( {video: true} )
        .then((stream) => {

            video.srcObject = stream;
            video.play();
        })
}

startUp();


