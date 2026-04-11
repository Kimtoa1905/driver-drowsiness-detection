# AI Phone Detection System (Dermify AI)

Hệ thống AI thông minh giúp phát hiện và cảnh báo hành vi sử dụng điện thoại trong môi trường lớp học hoặc văn phòng, sử dụng công nghệ YOLOv8, Flask và React.

---

## Tổng quan dự án (Overview)

Dự án được thiết kế theo kiến trúc **Decoupled Architecture (Tách biệt hệ thống)** gồm 3 thành phần chính:

- **AI Engine**: Xử lý hình ảnh từ camera và nhận diện đối tượng bằng YOLOv8  
- **Backend API**: Trung gian xử lý dữ liệu và lưu trữ  
- **Frontend Dashboard**: Giao diện giám sát thời gian thực  

Hệ thống hoạt động theo mô hình **Real-time Monitoring**, giúp phát hiện nhanh và lưu lại bằng chứng vi phạm.

---

## Tính năng nổi bật (Features)

- **Phát hiện Real-time**
  - Nhận diện người (*person*)
  - Nhận diện điện thoại (*cell phone*)

- **Tự động lưu bằng chứng**
  - Chụp ảnh khi phát hiện vi phạm
  - Lưu trữ ảnh và log

- **Dashboard hiện đại**
  - Tự động cập nhật mỗi 2 giây
  - Không cần reload (F5)

- **Responsive Design**
  - Hỗ trợ PC, Tablet, Mobile

- **Kiến trúc tách biệt**
  - Dễ bảo trì
  - Dễ mở rộng

---
## Công nghệ sử dụng (Tech Stack)

### AI Engine
- Python 3.10+
- YOLOv8 (Ultralytics)
- OpenCV

### Backend
- Flask
- Flask-CORS

### Frontend
- React (Vite)
- Bootstrap
- Axios
- Lucide Icons
- 
```
ai-phone-detection-system/
├── ai_engine/               # * Bộ máy xử lý AI *
│   ├── detect/              #   - Logic xử lý (test.py)
│   └── model/               #   - File model (best.pt)
├── backend_api/             # * API và Server *
│   ├── data/                #   - Nhật ký JSON
│   ├── static/alerts/       #   - Lưu ảnh vi phạm
│   └── app.py               #   - Flask server chính
├── frontend-web/            # * Giao diện người dùng *
│   ├── src/                 #   - Source code React
│   └── package.json
└── venv/                    # * Môi trường ảo (Python) *
```

## Cài đặt & Khởi chạy (Installation & Setup)

### Terminal 1: AI Engine
cd ai_engine
.\venv\Scripts\activate
python detect/test.py

### Terminal 2: Backend API
cd backend_api
.\venv\Scripts\activate
python app.py

### Terminal 3: Frontend Dashboard
cd frontend-web
npm install
npm run dev

Sau khi chạy xong, truy cập:
http://localhost:5173

---

## Hướng dẫn sử dụng (User Guide)

### 1. Cách hoạt động hệ thống

1. AI Engine mở camera và quét liên tục  
2. Phát hiện:
   - Người (person)
   - Điện thoại (cell phone)

3. Nếu vi phạm:
   - Chụp ảnh
   - Lưu vào /backend_api/static/alerts
   - Ghi log JSON

4. Backend cung cấp API  
5. Frontend hiển thị Dashboard  

---

### 2. Giao diện Dashboard

- Dữ liệu real-time (auto refresh mỗi 2 giây)
- Ảnh vi phạm
- Thời gian ghi nhận
- Trạng thái cảnh báo

---

### 3. Kiểm tra dữ liệu

- Ảnh vi phạm:
backend_api/static/alerts/

- File log:
backend_api/data/

---

### 4. Test hệ thống

- Cầm điện thoại trước camera → hệ thống phát hiện  
- Nhiều người → kiểm tra độ chính xác  
- Không có điện thoại → không ghi nhận  

---

## Lưu ý quan trọng

- Python >= 3.10
- File best.pt không push lên GitHub (.gitignore)
- Kiểm tra CORS nếu frontend không gọi được API
- Kiểm tra IP trong axiosClient.js khi chạy máy khác

---

## Kiến trúc hệ thống (System Architecture)

Camera → AI Engine → Backend API → Frontend Dashboard

---

## Hướng phát triển (Future Improvements)

- Cảnh báo âm thanh (Sound Alert)
- Lưu trữ cloud (Firebase / AWS)
- Tăng độ chính xác AI
- Dashboard thống kê (Analytics)
- Xác thực người dùng (Authentication)

---

## Tác giả

Nguyễn Quốc Tịnh

- Email: quoctinhstudy1911@gmail.com  
- GitHub: https://github.com/quoctinhstudy1911-crypto  

---
