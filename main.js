const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const flower = document.getElementById('flower-wrapper');

function onResults(results) {
    // 캔버스 초기화 및 손 그리기
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#ffffff', lineWidth: 2});
            drawLandmarks(canvasCtx, landmarks, {color: '#ff4444', lineWidth: 1, radius: 3});

            // 제스처 인식: 엄지 끝(4번)과 검지 끝(8번) 사이의 거리 측정
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];
            
            const distance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);

            // 거리가 일정 수준 이상이면 'blooming' 클래스 추가
            if (distance > 0.15) {
                flower.classList.add('blooming');
            } else {
                flower.classList.remove('blooming');
            }
        }
    }
    canvasCtx.restore();
}

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 640,
    height: 480
});
camera.start();