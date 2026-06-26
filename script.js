// ===============================
// RetroCam Pro - Part 3A
// Camera Setup
// ===============================

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const shutter = document.getElementById("shutter");
const flash = document.getElementById("flash");
const timestamp = document.getElementById("timestamp");

let stream = null;
let facingMode = "environment";
let currentFilter = "none";
let zoomLevel = 1;

// Start Camera
async function startCamera() {

    try {

        // Stop previous stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        const constraints = {

            audio: false,

            video: {

                facingMode: {
                    ideal: facingMode
                },

                width: {
                    ideal: 3840
                },

                height: {
                    ideal: 2160
                }

            }

        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);

        video.srcObject = stream;

        updateTimestamp();

    } catch (err) {

        alert("Camera not supported or permission denied.");

        console.error(err);

    }

}

startCamera();


// ===============================
// Switch Camera
// ===============================

document
.getElementById("switchCamera")
.addEventListener("click", async () => {

    facingMode =
        facingMode === "environment"
        ? "user"
        : "environment";

    await startCamera();

});


// ===============================
// Timestamp
// ===============================

function updateTimestamp(){

    setInterval(()=>{

        const now = new Date();

        timestamp.innerHTML =
            now.toLocaleDateString() +
            "<br>" +
            now.toLocaleTimeString();

    },1000);

}


// ===============================
// Flash Animation
// ===============================

function animateFlash(){

    flash.classList.add("flash");

    setTimeout(()=>{

        flash.classList.remove("flash");

    },350);

}


// ===============================
// Play Shutter Sound
// ===============================

function playShutter(){

    shutter.currentTime = 0;

    shutter.play().catch(()=>{});

}
// ===============================
// RetroCam Pro - Part 3B
// Capture + Download
// ===============================

const captureBtn = document.getElementById("capture");

let capturedImage = null;

// Take Photo
captureBtn.addEventListener("click", () => {

    animateFlash();

    playShutter();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Apply current filter
    ctx.filter = getFilter(currentFilter);

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    capturedImage = canvas.toDataURL(
        "image/jpeg",
        0.98
    );

    downloadPhoto();

});


// ===============================
// Download
// ===============================

function downloadPhoto(){

    if(!capturedImage) return;

    const link = document.createElement("a");

    const name =
        "RetroCam_" +
        Date.now() +
        ".jpg";

    link.download = name;

    link.href = capturedImage;

    link.click();

}


// ===============================
// Filters
// ===============================

function getFilter(name){

switch(name){

case "vintage":
return "sepia(.45) contrast(1.15) saturate(1.25)";

case "vhs":
return "contrast(1.35) saturate(2)";

case "polaroid":
return "brightness(1.1) contrast(.9) sepia(.25)";

case "bw":
return "grayscale(1)";

case "dream":
return "brightness(1.15) blur(.5px)";

case "cyber":
return "hue-rotate(180deg) saturate(2)";

case "film":
return "contrast(1.3) sepia(.2)";

case "pink":
return "hue-rotate(-15deg) saturate(1.6)";

case "retro":
return "sepia(.3) contrast(1.2)";

default:
return "none";

}

}


// ===============================
// Filter Buttons
// ===============================

document
.querySelectorAll(".filters button")
.forEach(button=>{

button.addEventListener("click",()=>{

currentFilter =
button.dataset.filter;

video.style.filter =
getFilter(currentFilter);

});

});
// ===============================
// RetroCam Pro - Part 3C
// Timer + Torch + Zoom
// ===============================

let timerSeconds = 0;

const timerBtn = document.getElementById("timerBtn");

timerBtn.addEventListener("click", () => {

    if(timerSeconds === 0){

        timerSeconds = 3;
        alert("Timer: 3 seconds");

    }else if(timerSeconds === 3){

        timerSeconds = 5;
        alert("Timer: 5 seconds");

    }else if(timerSeconds === 5){

        timerSeconds = 10;
        alert("Timer: 10 seconds");

    }else{

        timerSeconds = 0;
        alert("Timer Off");

    }

});

async function takePhoto(){

    if(timerSeconds > 0){

        await new Promise(resolve=>setTimeout(resolve, timerSeconds*1000));

    }

    animateFlash();

    playShutter();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.filter = getFilter(currentFilter);

    ctx.drawImage(video,0,0);

    const link = document.createElement("a");

    link.download = "RetroCam_" + Date.now() + ".jpg";

    link.href = canvas.toDataURL("image/jpeg",0.98);

    link.click();

}

captureBtn.onclick = takePhoto;


// ===============================
// Torch (Android devices only)
// ===============================

async function toggleTorch(){

    const track = stream.getVideoTracks()[0];

    const capabilities = track.getCapabilities();

    if(!capabilities.torch){

        alert("Torch is not supported on this device.");

        return;

    }

    const settings = track.getSettings();

    await track.applyConstraints({

        advanced:[{

            torch: !settings.torch

        }]

    });

}


// ===============================
// Pinch Zoom
// ===============================

let scale = 1;

video.addEventListener("wheel",(e)=>{

    e.preventDefault();

    if(e.deltaY < 0){

        scale += 0.1;

    }else{

        scale -= 0.1;

    }

    scale = Math.max(1,Math.min(scale,3));

    video.style.transform = `scale(${scale})`;

});
