import cv2
import time
import json
import os
import threading
import winsound
from datetime import datetime
from ultralytics import YOLO

# ===== CẤU HÌNH HỆ THỐNG (Tối ưu cho Dashboard 12 ảnh) =====
MODEL_PATH = "model/best.pt"
ALERT_FOLDER = "../../backend_api/static/alerts"
LOG_FILE = "../../backend_api/data/alerts.json"

CONF_THRESHOLD = 0.5    # Độ tin cậy tối thiểu (Tránh bắt nhầm vật giống điện thoại)
AREA_THRESHOLD = 3000   # Diện tích vùng phát hiện (Loại bỏ nhiễu ở xa)
COOLDOWN = 4            # Khoảng cách giữa 2 lần chụp (giây) để tránh spam
FRAME_SKIP = 2          # Chỉ xử lý mỗi 2 khung hình để giảm tải CPU
MAX_STORAGE = 12        # Giữ đúng 12 ảnh để khớp 3 hàng x 4 cột trên React

# ===== KHỞI TẠO =====
model = YOLO(MODEL_PATH)
cap = cv2.VideoCapture(0)

# Đảm bảo các thư mục tồn tại
os.makedirs(ALERT_FOLDER, exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

last_alert_time = 0
frame_count = 0

# ===== LOGIC LƯU TRỮ ĐA LUỒNG (THREADING) =====
def save_log_worker(new_log, frame_to_save, filepath):
    """Lưu ảnh và ghi log chạy ngầm để camera không bị đứng hình"""
    try:
        # 1. Lưu file ảnh xuống ổ cứng
        cv2.imwrite(filepath, frame_to_save)
        
        # 2. Đọc và cập nhật file JSON
        logs = []
        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                try: logs = json.load(f)
                except: logs = []
        
        # Đẩy vi phạm mới nhất lên đầu danh sách (vị trí 0)
        logs.insert(0, new_log)
        
        # Tự động dọn dẹp ảnh cũ nhất (thằng cuối cùng) khi vượt quá 12
        while len(logs) > MAX_STORAGE:
            old_data = logs.pop(-1) 
            old_path = os.path.join(ALERT_FOLDER, old_data["image"])
            if os.path.exists(old_path):
                os.remove(old_path)
        
        # Ghi lại file JSON sạch sẽ
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=4, ensure_ascii=False)
            
        print(f"🚨 [HỆ THỐNG] Đã ghi nhận bằng chứng: {new_log['image']}")
        # Phát tiếng Beep cảnh báo trên Windows
        winsound.Beep(1000, 400) 
        
    except Exception as e:
        print(f"❌ Lỗi ghi log: {e}")

# ===== LOGIC KIỂM TRA KHOẢNG CÁCH (DISTANCE CHECK) =====
def is_near(box_person, box_phone, threshold=220):
    """Kiểm tra tâm của người và điện thoại có gần nhau không"""
    px1, py1, px2, py2 = box_person
    hx1, hy1, hx2, hy2 = box_phone
    
    center_p = ((px1 + px2) / 2, (py1 + py2) / 2)
    center_h = ((hx1 + hx2) / 2, (hy1 + hy2) / 2)
    
    distance = ((center_p[0] - center_h[0])**2 + (center_p[1] - center_h[1])**2)**0.5
    return distance < threshold

print("🚀 DERMIFY AI: Hệ thống giám sát đang trực tuyến...")

# ===== VÒNG LẶP GIÁM SÁT CHÍNH =====
while True:
    ret, frame = cap.read()
    if not ret: break

    frame_count += 1
    if frame_count % FRAME_SKIP != 0: continue

    # Resize để AI xử lý nhanh hơn (640 là chuẩn YOLOv8)
    process_frame = cv2.resize(frame, (640, 480))
    
    # Chạy AI Inference
    results = model(process_frame, conf=0.3, verbose=False)

    persons = []
    phones = []
    
    # Lọc và phân loại đối tượng
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0]
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label = model.names[cls_id]

            # Loại bỏ nhiễu dựa trên độ tin cậy và kích thước
            area = (x2 - x1) * (y2 - y1)
            if conf < CONF_THRESHOLD or area < AREA_THRESHOLD:
                continue

            if label == "person":
                persons.append((x1, y1, x2, y2))
                cv2.rectangle(process_frame, (int(x1), int(y1)), (int(x2), int(y2)), (255, 0, 0), 2)
            elif label == "cell phone":
                phones.append((x1, y1, x2, y2))
                cv2.rectangle(process_frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)

    # Kiểm tra vi phạm
    violation = False
    for p in persons:
        for ph in phones:
            if is_near(p, ph):
                violation = True
                break

    # Vẽ trạng thái lên màn hình
    status = "VIOLATION DETECTED" if violation else "MONITORING: SAFE"
    color = (0, 0, 255) if violation else (0, 255, 0)
    cv2.putText(process_frame, status, (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 3)

    # Xử lý lưu cảnh báo tự động
    if violation:
        current_time = time.time()
        if current_time - last_alert_time > COOLDOWN:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            img_name = f"violation_{timestamp}.jpg"
            img_path = os.path.join(ALERT_FOLDER, img_name)
            
            data = {
                "id": timestamp,
                "time": datetime.now().strftime("%H:%M:%S %d/%m/%Y"),
                "image": img_name,
                "status": "VIOLATION"
            }
            
            # Sử dụng Threading để lưu không gây giật lag camera
            task = threading.Thread(target=save_log_worker, args=(data, process_frame.copy(), img_path))
            task.start()
            
            last_alert_time = current_time

    # Hiển thị cửa sổ giám sát
    cv2.imshow("DERMIFY AI - SAFETY MONITOR", process_frame)

    if cv2.waitKey(1) == 27: # Thoát bằng phím ESC
        break

cap.release()
cv2.destroyAllWindows()