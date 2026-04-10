import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { AlertCircle, Clock } from 'lucide-react';

const ToastNotification = ({ show, newLog, onClose }) => {
  // Logic lấy URL ảnh giống như Dashboard và App.py
  const BASE_URL = "http://127.0.0.1:5000";

  return (
    // Sử dụng class của Bootstrap để điều chỉnh vị trí linh hoạt:
    // Trên Mobile (nhỏ hơn 576px) sẽ ở top-center, trên Desktop sẽ ở top-end
    <ToastContainer 
      position={window.innerWidth < 576 ? "top-center" : "top-end"} 
      className="p-2 p-md-3" 
      style={{ zIndex: 9999, width: window.innerWidth < 576 ? '90%' : 'auto' }}
    >
      <Toast 
        show={show} 
        onClose={onClose} 
        delay={5000} 
        autohide 
        className="border-0 shadow-lg overflow-hidden"
        style={{ 
          backgroundColor: '#2d3436', 
          color: 'white', 
          minWidth: window.innerWidth < 576 ? '100%' : '320px',
          borderRadius: '10px'
        }}
      >
        {/* Header với tông màu đỏ cam cảnh báo */}
        <Toast.Header 
          closeVariant="white" 
          style={{ 
            backgroundColor: '#e17055', 
            color: 'white',
            borderBottom: 'none' 
          }}
          className="d-flex align-items-center"
        >
          <AlertCircle size={18} className="me-2 animate-pulse" />
          <strong className="me-auto" style={{ fontSize: '13px' }}>CẢNH BÁO VI PHẠM</strong>
          <small className="text-white-50">Vừa xong</small>
        </Toast.Header>

        <Toast.Body className="p-2 p-md-3">
          {newLog ? (
            <div className="d-flex align-items-center">
              {/* Ảnh vi phạm thu nhỏ để preview nhanh */}
              <div className="flex-shrink-0">
                <img 
                  src={`${BASE_URL}/api/images/${newLog.image}`} 
                  alt="Violation Preview" 
                  className="rounded border border-warning"
                  style={{ 
                    width: '55px', 
                    height: '55px', 
                    objectFit: 'cover'
                  }}
                  // Chống lỗi vỡ ảnh nếu backend chưa kịp load
                  onError={(e) => { e.target.src = "https://via.placeholder.com/60?text=AI"; }}
                />
              </div>

              {/* Thông tin chi tiết */}
              <div className="ms-3 flex-grow-1">
                <div className="fw-bold text-warning mb-1" style={{ fontSize: '14px' }}>
                  Phát hiện vật thể lạ!
                </div>
                <div className="text-light opacity-75 d-flex align-items-center" style={{ fontSize: '11px' }}>
                  <Clock size={12} className="me-1" /> {newLog.time}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center small">Đang tải dữ liệu...</div>
          )}
        </Toast.Body>
        
        {/* Thanh tiến trình nhỏ bên dưới (Tùy chọn cho chuyên nghiệp) */}
        <div 
          className="bg-warning" 
          style={{ 
            height: '3px', 
            width: '100%', 
            animation: show ? 'progress-bar 5s linear' : 'none' 
          }} 
        />
      </Toast>

      {/* Thêm CSS thủ công cho hiệu ứng nhấp nháy */}
      <style>{`
        @keyframes progress-bar {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </ToastContainer>
  );
};

export default ToastNotification;