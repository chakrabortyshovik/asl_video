from flask import Flask, request, jsonify, send_file, send_from_directory
import cv2
import numpy as np
from ultralytics import YOLO
from gtts import gTTS

app = Flask(__name__)
model = YOLO("D:/Mini_Project/ASL_video_calling/weights/best.pt")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/script.js')
def script():
    return send_from_directory('.', 'script.js')

@app.route('/detect', methods=['POST'])
def detect():
    file = request.files['frame'].read()
    npimg = np.frombuffer(file, np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    results = model.predict(frame, imgsz=960)
    detected_text = ""
    if results and len(results[0].boxes):
        for box in results[0].boxes:
            cls = int(box.cls)
            detected_letter = model.names[cls]
            detected_text += detected_letter
    return jsonify({'detected_text': detected_text})

@app.route('/speak', methods=['POST'])
def speak():
    data = request.get_json()
    text = data['text']
    tts = gTTS(text, lang='en')
    tts.save('output.mp3')
    return send_file('output.mp3', mimetype='audio/mpeg')

if __name__ == '__main__':
    app.run(debug=True)
