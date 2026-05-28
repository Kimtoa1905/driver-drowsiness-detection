import cv2
import mediapipe as mp
import numpy as np
import time
import json
import os
import threading
from collections import deque
from datetime import datetime

# ===== PATH =====
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))

ALERT_FOLDER = os.path.join(project_root, "backend_api", "static", "alerts")
LOG_FILE = os.path.join(project_root, "backend_api", "data", "alerts.json")

os.makedirs(ALERT_FOLDER, exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

# ===== CONFIG =====
DROWSY_TIME = 1.5
COOLDOWN = 3
MAX_STORAGE = 12
SMOOTHING = 10

EAR_THRESHOLD = 0.20
SMILE_THRESHOLD = 0.5

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]
MOUTH = [61, 13, 14, 291]

# ===== MEDIAPIPE =====
mp_face = mp.solutions.face_mesh
face_mesh = mp_face.FaceMesh(max_num_faces=1, refine_landmarks=True)

# ===== CAMERA =====
cap = cv2.VideoCapture(0)

# ===== STATE =====
ear_history = deque(maxlen=SMOOTHING)
eye_closed_start = None
last_alert_time = 0

calibrating = True
calibration_data = []
calibration_start = time.time()

# ===== FUNCTION =====
def distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))

def calculate_EAR(eye):
    A = distance(eye[1], eye[5])
    B = distance(eye[2], eye[4])
    C = distance(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def calculate_MAR(mouth):
    A = distance(mouth[1], mouth[2])
    C = distance(mouth[0], mouth[3])
    return A / C

# ===== SAVE LOG =====
def save_log_worker(log, frame, filepath):
    try:
        cv2.imwrite(filepath, frame)

        logs = []
        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                try:
                    logs = json.load(f)
                except:
                    logs = []

        logs.insert(0, log)

        while len(logs) > MAX_STORAGE:
            old = logs.pop(-1)
            old_path = os.path.join(ALERT_FOLDER, old["image"])
            if os.path.exists(old_path):
                os.remove(old_path)

        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=4, ensure_ascii=False)

        print(f"🚨 SAVED: {log['image']}")

    except Exception as e:
        print("❌ ERROR:", e)

print("🚀 DROWSINESS PRO v2 RUNNING...")

# ===== LOOP =====
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.resize(frame, (480, 360))
    frame = cv2.flip(frame, 1)

    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    status = "SAFE"
    color = (0, 255, 0)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:

            left_eye, right_eye, mouth = [], [], []

            # ===== LẤY LANDMARK =====
            for idx in LEFT_EYE:
                lm = face_landmarks.landmark[idx]
                left_eye.append((int(lm.x * w), int(lm.y * h)))

            for idx in RIGHT_EYE:
                lm = face_landmarks.landmark[idx]
                right_eye.append((int(lm.x * w), int(lm.y * h)))

            for idx in MOUTH:
                lm = face_landmarks.landmark[idx]
                mouth.append((int(lm.x * w), int(lm.y * h)))

            # ===== EAR =====
            ear_left = calculate_EAR(left_eye)
            ear_right = calculate_EAR(right_eye)
            ear = (ear_left + ear_right) / 2.0

            ear_history.append(ear)
            ear_smooth = sum(ear_history) / len(ear_history)

            # ===== MAR =====
            mar = calculate_MAR(mouth)

            # ===== CALIBRATION =====
            if calibrating:
                calibration_data.append(ear_smooth)
                if time.time() - calibration_start > 3:
                    EAR_THRESHOLD = np.mean(calibration_data) * 0.7
                    calibrating = False
                    print("✅ Calibrated EAR:", EAR_THRESHOLD)

            # ===== HEAD DOWN =====
            nose = face_landmarks.landmark[1]
            chin = face_landmarks.landmark[152]
            head_down = (chin.y - nose.y) < 0.05

            # ===== EYE TIME LOGIC =====
            if ear_smooth < EAR_THRESHOLD:
                if eye_closed_start is None:
                    eye_closed_start = time.time()
            else:
                if eye_closed_start and time.time() - eye_closed_start < 0.3:
                    pass  # blink nhanh
                else:
                    eye_closed_start = None

            drowsy_eye = False
            if eye_closed_start:
                if time.time() - eye_closed_start > DROWSY_TIME:
                    drowsy_eye = True

            # ===== SMILE DETECTION =====
            is_smiling = mar > SMILE_THRESHOLD

            # ===== FINAL DECISION =====
            if (drowsy_eye and not is_smiling) or head_down:
                status = "DROWSY"
                color = (0, 0, 255)

                now = time.time()
                if now - last_alert_time > COOLDOWN:
                    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"drowsy_{ts}.jpg"
                    filepath = os.path.join(ALERT_FOLDER, filename)

                    log = {
                        "id": ts,
                        "time": datetime.now().strftime("%H:%M:%S %d/%m/%Y"),
                        "image": filename,
                        "status": "DROWSY"
                    }

                    threading.Thread(
                        target=save_log_worker,
                        args=(log, frame.copy(), filepath)
                    ).start()

                    last_alert_time = now

            # ===== DEBUG UI =====
            cv2.putText(frame, f"EAR: {ear_smooth:.2f}", (20, 80),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)

            cv2.putText(frame, f"MAR: {mar:.2f}", (20, 110),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)

    # ===== UI =====
    cv2.putText(frame, status, (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, color, 3)

    cv2.imshow("DROWSINESS PRO v2", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()