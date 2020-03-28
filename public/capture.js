const constraints = {
    video: true
};

const video = document.getElementById('video');

async function streamer() {

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

}

streamer();



