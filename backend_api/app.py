from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import json
import os
import time
import socket

app = Flask(__name__)

# [QUAN TRỌNG 1] Khớp với React: 
# Cho phép React (thường chạy port 5173) truy cập lấy dữ liệu mà không bị trình duyệt chặn (CORS).
CORS(app)

# ===== CẤU HÌNH ĐƯỜNG DẪN =====
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, "data", "alerts.json")
IMAGE_DIR = os.path.join(BASE_DIR, "static", "alerts")

def read_logs_safe():
    """Đọc dữ liệu vi phạm từ file JSON"""
    if not os.path.exists(LOG_FILE):
        return []
    for _ in range(5):
        try:
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            time.sleep(0.1)
    return []

def save_logs_safe(logs):
    """Ghi dữ liệu vi phạm vào file JSON"""
    try:
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=4, ensure_ascii=False)
        return True
    except:
        return False

# [QUAN TRỌNG 2] Khớp với axiosClient: 
# Trong React bạn gọi axiosClient.get("/logs"), Flask sẽ nhận ở đây nhờ tiền tố /api/
@app.route('/api/logs', methods=['GET'])
def get_logs():
    logs = read_logs_safe()
    return jsonify(logs)

# [QUAN TRỌNG 3] Khớp với hiển thị Ảnh:
# Khi React dùng thẻ <img src="http://127.0.0.1:5000/api/images/abc.jpg">
# Flask sẽ nhảy vào hàm này để lấy file ảnh thực tế gửi cho trình duyệt.
@app.route('/api/images/<filename>')
def get_image(filename):
    if os.path.exists(os.path.join(IMAGE_DIR, filename)):
        return send_from_directory(IMAGE_DIR, filename)
    return jsonify({"error": "Không tìm thấy ảnh"}), 404

# API xóa bản ghi
@app.route('/api/logs/<log_id>', methods=['DELETE'])
def delete_log(log_id):
    logs = read_logs_safe()
    new_logs = [l for l in logs if l['id'] != log_id]
    
    log_to_delete = next((l for l in logs if l['id'] == log_id), None)
    if log_to_delete:
        img_path = os.path.join(IMAGE_DIR, log_to_delete['image'])
        if os.path.exists(img_path):
            os.remove(img_path)
            
    if save_logs_safe(new_logs):
        return jsonify({"message": "Đã xóa thành công"}), 200
    return jsonify({"error": "Lỗi khi ghi file"}), 500

# API Kiểm tra trạng thái (Dùng cho icon Online/Offline trên Navbar)
@app.route('/api/status')
def status():
    return jsonify({"status": "online"})

def get_ip():
    """Tự động tìm địa chỉ IP của máy tính này trong mạng nội bộ"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == "__main__":
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    os.makedirs(IMAGE_DIR, exist_ok=True)
    
    my_ip = get_ip()
    
    print("\n" + "="*50)
    print("🛡️  PHONEGUARD AI BACKEND - ĐÃ SẴN SÀNG")
    print("="*50)
    # [QUAN TRỌNG 4] Khớp với trang Settings: 
    # Bạn copy 1 trong 2 dòng dưới đây dán vào ô "Địa chỉ Backend" trong React.
    print(f"👉 Dùng trên máy này: http://127.0.0.1:5000")
    print(f"👉 Dùng trong mạng Wi-Fi: http://{my_ip}:5000")
    print("-" * 50)
    print("="*50 + "\n")
    
    # host="0.0.0.0" để máy khác (như điện thoại) có thể truy cập được thông qua IP.
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)