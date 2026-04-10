import cv2
import time
import json
import os
import threading
import winsound
from datetime import datetime
from ultralytics import YOLO

# ===== CONFIG =====
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))

MODEL_PATH = "model/yolov8n.pt"
ALERT_FOLDER = os.path.join(project_root, "backend_api", "static", "alerts")
LOG_FILE = os.path.join(project_root, "backend_api", "data", "alerts.json")

CONF_THRESHOLD = 0.3
AREA_THRESHOLD = 1000
COOLDOWN = 4
MAX_STORAGE = 12

# ===== INIT =====
model = YOLO(MODEL_PATH)
cap = cv2.VideoCapture(0)

os.makedirs(ALERT_FOLDER, exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

last_alert_time = 0
prev_time = 0

# ===== IoU =====
def calculate_iou(box1, box2):
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    inter = max(0, x2 - x1) * max(0, y2 - y1)

    area1 = (box1[2]-box1[0]) * (box1[3]-box1[1])
    area2 = (box2[2]-box2[0]) * (box2[3]-box2[1])

    union = area1 + area2 - inter
    return inter / union if union > 0 else 0

# ===== DISTANCE =====
def is_near(box1, box2, threshold=130):
    x1, y1, x2, y2 = box1
    x1b, y1b, x2b, y2b = box2

    c1 = ((x1 + x2) / 2, (y1 + y2) / 2)
    c2 = ((x1b + x2b) / 2, (y1b + y2b) / 2)

    dist = ((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2)**0.5
    return dist < threshold

# ===== SAVE LOG =====
def save_log_worker(new_log, frame_to_save, filepath):
    try:
        cv2.imwrite(filepath, frame_to_save)

        logs = []
        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                try:
                    logs = json.load(f)
                except:
                    logs = []

        logs.insert(0, new_log)

        while len(logs) > MAX_STORAGE:
            old = logs.pop(-1)
            old_path = os.path.join(ALERT_FOLDER, old["image"])
            if os.path.exists(old_path):
                os.remove(old_path)

        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=4, ensure_ascii=False)

        print(f"🚨 SAVED: {new_log['image']}")

    except Exception as e:
        print("❌ ERROR:", e)

print("🚀 PRODUCTION FINAL RUNNING...")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.resize(frame, (640, 480))
    results = model(frame, conf=0.25, verbose=False)

    persons = []
    phones = []

    # ===== DETECT =====
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0]
            conf = float(box.conf[0])
            label = model.names[int(box.cls[0])]

            area = (x2 - x1) * (y2 - y1)
            if conf < CONF_THRESHOLD or area < AREA_THRESHOLD:
                continue

            if label == "person":
                persons.append((x1, y1, x2, y2))
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (255, 0, 0), 2)

            elif label == "cell phone":
                phones.append((x1, y1, x2, y2))
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)

    # ===== LOGIC =====
    violation = False
    suspicious = False

    for p in persons:
        for ph in phones:
            iou = calculate_iou(p, ph)

            if iou > 0.12:
                violation = True
                break
            elif is_near(p, ph):
                suspicious = True

    # ===== STATUS =====
    if violation:
        status = "USING PHONE"
        color = (0, 0, 255)
    elif suspicious:
        status = "SUSPICIOUS"
        color = (0, 255, 255)
    else:
        status = "SAFE"
        color = (0, 255, 0)

    cv2.putText(frame, status, (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1, color, 3)
    current_time = time.time()
    fps = 1 / (current_time - prev_time) if prev_time != 0 else 0
    prev_time = current_time

    cv2.putText(frame, f"FPS: {int(fps)}", (20, 90),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)

    # ===== SAVE =====
    if violation:
        now = time.time()
        if now - last_alert_time > COOLDOWN:
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"violation_{ts}.jpg"
            filepath = os.path.join(ALERT_FOLDER, filename)

            log = {
                "id": ts,
                "time": datetime.now().strftime("%H:%M:%S %d/%m/%Y"),
                "image": filename,
                "status": "USING_PHONE"
            }

            threading.Thread(
                target=save_log_worker,
                args=(log, frame.copy(), filepath)
            ).start()

            last_alert_time = now

    cv2.imshow("PHONEGUARD AI - FINAL", frame)

    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()