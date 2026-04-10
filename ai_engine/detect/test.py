import cv2
import time
import json
import os
import threading
import winsound
from datetime import datetime
from ultralytics import YOLO

# ===== CONFIG (Tự động hóa đường dẫn) =====
# Lấy đường dẫn thư mục hiện tại của file test.py (ai_engine/detect/)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Lùi ra 2 cấp để ra thư mục gốc dự án (Dermify_Project)
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))

# Đường dẫn đến backend_api dựa trên cấu trúc dự án
MODEL_PATH = "yolov8n.pt" 
ALERT_FOLDER = os.path.join(project_root, "backend_api", "static", "alerts")
LOG_FILE = os.path.join(project_root, "backend_api", "data", "alerts.json")

CONF_THRESHOLD = 0.2    # Hạ thấp để dễ bắt vật thể
AREA_THRESHOLD = 1000   # Hạ thấp để vật thể ở xa cũng bắt được
COOLDOWN = 3            # 3 giây chụp 1 lần để mau đầy 12 ảnh
MAX_STORAGE = 12        # Khớp với Dashboard React

# ===== INIT =====
model = YOLO(MODEL_PATH)
cap = cv2.VideoCapture(0)

# Tạo thư mục nếu chưa tồn tại
os.makedirs(ALERT_FOLDER, exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

last_alert_time = 0
frame_count = 0

def save_log_worker(new_log, frame_to_save, filepath):
    """Lưu đa luồng: Đẩy mới lên đầu, dọn dẹp bản ghi thứ 13"""
    try:
        cv2.imwrite(filepath, frame_to_save)
        logs = []
        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                try: logs = json.load(f)
                except: logs = []
        
        # Đẩy mới nhất lên vị trí 0
        logs.insert(0, new_log)
        
        # Xóa thằng cũ nhất khi vượt quá 12
        while len(logs) > MAX_STORAGE:
            old_data = logs.pop(-1)
            old_path = os.path.join(ALERT_FOLDER, old_data["image"])
            if os.path.exists(old_path):
                try: os.remove(old_path)
                except: pass
        
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=4, ensure_ascii=False)
            
        print(f"🚨 [TEST ALERT] Đã đẩy lên Dashboard: {new_log['image']}")
    except Exception as e:
        print(f"❌ Lỗi: {e}")

def is_near(box1, box2, threshold=300): # Tăng threshold để dễ kích hoạt vi phạm
    x1, y1, x2, y2 = box1
    x1b, y1b, x2b, y2b = box2
    c1 = ((x1 + x2) / 2, (y1 + y2) / 2)
    c2 = ((x1b + x2b) / 2, (y1b + y2b) / 2)
    dist = ((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2)**0.5
    return dist < threshold

print(f"🛠️ PRODUCTION TEST MODE: Đang chạy...")
print(f"📂 Thư mục lưu ảnh: {ALERT_FOLDER}")
print(f"📝 Thư mục lưu log: {LOG_FILE}")

while True:
    ret, frame = cap.read()
    if not ret: break
    
    display_frame = cv2.resize(frame, (640, 480))
    results = model(display_frame, conf=0.2, verbose=False)

    person_boxes = []
    other_boxes = []

    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0]
            label = model.names[int(box.cls[0])]
            
            if label == "person":
                person_boxes.append((x1, y1, x2, y2))
                cv2.rectangle(display_frame, (int(x1), int(y1)), (int(x2), int(y2)), (255, 0, 0), 2)
            else:
                other_boxes.append((x1, y1, x2, y2))
                cv2.rectangle(display_frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)

    # Kiểm tra vi phạm giả lập (Người gần bất cứ vật gì)
    violation = False
    if person_boxes and other_boxes:
        for p in person_boxes:
            for o in other_boxes:
                if is_near(p, o):
                    violation = True; break

    if violation:
        cv2.putText(display_frame, "VIOLATION TEST", (20, 50), 1, 2, (0, 0, 255), 3)
        now = time.time()
        if now - last_alert_time > COOLDOWN:
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            fn = f"test_violation_{ts}.jpg"
            fp = os.path.join(ALERT_FOLDER, fn)
            
            log_data = {
                "id": ts,
                "time": datetime.now().strftime("%H:%M:%S %d/%m/%Y"),
                "image": fn,
                "status": "TEST_MODE"
            }
            
            threading.Thread(target=save_log_worker, args=(log_data, display_frame.copy(), fp)).start()
            last_alert_time = now

    cv2.imshow("TESTING PRODUCTION - ESC TO STOP", display_frame)
    if cv2.waitKey(1) == 27: break

cap.release()
cv2.destroyAllWindows()