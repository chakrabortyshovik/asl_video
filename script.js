const gestureTextBox = document.getElementById('gesture-text-box');
const speechTextBox = document.getElementById('speech-text-box');

// ZEGOCLOUD Setup
const appId = 1152931286; // Replace with your App ID
const serverSecret = "d4bdaa634bb85bcd67ffc891be252cd2"; // Replace with your Server Secret
const roomId = "room2";
const userId = "UserID-" + Math.floor(Math.random() * 10000);
const userName = "jack" + Math.floor(Math.random() * 10000);
const TOKEN = generatePrebuiltToken(appId, serverSecret, roomId, userId, userName);

const zp = ZegoUIKitPrebuilt.create(TOKEN);
zp.joinRoom({
    container: document.querySelector("#root"),
    scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
    },
});

// Gesture Detection
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.style.display = 'none';
    document.body.appendChild(video);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    setInterval(() => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
            const formData = new FormData();
            formData.append('frame', blob);
            fetch('/detect', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                const detectedText = data.detected_text.trim();
                if (detectedText) {
                    gestureTextBox.value += detectedText;
                }
            });
        }, 'image/jpeg');
    }, 1000);
});

function speakGestureText() {
    const text = gestureTextBox.value.trim();
    fetch('/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    })
    .then(response => response.blob())
    .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();
    });
}

function clearTextBoxes() {
    gestureTextBox.value = "";
    speechTextBox.value = "";
}

// Speech-to-Text via WebRTC or third-party service
// Placeholder for additional speech-to-text integration.
