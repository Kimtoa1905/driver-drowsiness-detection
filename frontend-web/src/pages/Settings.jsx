import { useState, useEffect } from "react";
import { Container, Card, Form, Button, Alert, Row, Col, Badge } from "react-bootstrap";
import { Settings as SettingsIcon, Save, Server, Bell, RefreshCw, ShieldCheck, Zap } from "lucide-react";

export default function Settings() {
  // 1. Khởi tạo state: Đảm bảo lấy đúng kiểu dữ liệu từ máy
  const [config, setConfig] = useState({
    backendUrl: localStorage.getItem("backendUrl") || "http://127.0.0.1:5000",
    refreshInterval: localStorage.getItem("refreshInterval") || "2", // Lưu dạng chuỗi
    enableSound: localStorage.getItem("enableSound") !== "false", // Chuyển về Boolean
  });

  const [saved, setSaved] = useState(false);

  // 2. Hàm lưu cấu hình
  const handleSave = (e) => {
    e.preventDefault();
    
    // Lưu các giá trị vào bộ nhớ máy (localStorage)
    localStorage.setItem("backendUrl", config.backendUrl);
    localStorage.setItem("refreshInterval", config.refreshInterval.toString());
    localStorage.setItem("enableSound", config.enableSound.toString());
    
    setSaved(true);

    // Hiển thị thông báo thành công trong 1.5 giây rồi F5 trang
    setTimeout(() => {
      setSaved(false);
      window.location.reload(); // Bắt buộc F5 để Dashboard đọc lại giây mới
    }, 1500);
  };

  return (
    /* THAY ĐỔI: Nền sáng (bg-light) và Font Inter đồng bộ toàn hệ thống */
    <Container className="mt-3 mt-md-5 pb-5 px-4 bg-light rounded-4 shadow-sm settings-page" style={{ minHeight: '85vh' }}>
      
      {/* 1. HEADER: Giống Dashboard & Report */}
      <div className="d-flex align-items-center mb-4 border-start border-4 border-warning ps-3 py-1 pt-4">
        <div>
          <h4 className="text-dark fw-bold text-uppercase mb-0 title-font">
            Cấu hình hệ thống
          </h4>
          <p className="text-muted small mb-0 fw-medium">
            Thiết lập các thông số vận hành cho Camera AI
          </p>
        </div>
      </div>

      {saved && (
        <Alert variant="success" className="border-0 shadow-sm mb-4 animate-fade-in">
          <ShieldCheck size={18} className="me-2" /> 
          Cấu hình đã được lưu! Hệ thống đang khởi động lại...
        </Alert>
      )}

      <Row className="g-4">
        {/* CỘT TRÁI: Form cài đặt */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <Card.Header className="bg-white border-bottom py-3">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-warning bg-opacity-10 p-2 rounded-3 text-warning">
                    <SettingsIcon size={20} />
                </div>
                <span className="fw-bold text-dark">Thông số kỹ thuật</span>
              </div>
            </Card.Header>
            
            <Card.Body className="p-4 bg-white">
              <Form onSubmit={handleSave}>
                {/* Khu vực 1: Kết nối (Dành cho Dev/Kỹ thuật) */}
                <div className="mb-4">
                    <Form.Label className="small text-uppercase fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                        <Server size={14} /> Đường truyền dữ liệu (Backend)
                    </Form.Label>
                    <Form.Control 
                        type="text" 
                        value={config.backendUrl}
                        onChange={(e) => setConfig({...config, backendUrl: e.target.value})}
                        className="bg-light border-0 py-3 px-3 rounded-3"
                        placeholder="http://127.0.0.1:5000"
                        style={{ fontSize: '0.9rem', fontWeight: '500' }}
                    />
                    <Form.Text className="text-muted mt-2 d-block">
                        Đây là địa chỉ nối phần mềm với Camera AI. Đừng sửa nếu bạn không thay đổi Server.
                    </Form.Text>
                </div>

                <Row>
                    {/* Khu vực 2: Tốc độ quét */}
                    <Col md={6} className="mb-4">
                        <Form.Label className="small text-uppercase fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                            <RefreshCw size={14} /> Tốc độ phản hồi (Giây)
                        </Form.Label>
                        <Form.Control 
                            type="number" 
                            value={config.refreshInterval}
                            onChange={(e) => setConfig({...config, refreshInterval: e.target.value})}
                            className="bg-light border-0 py-3 rounded-3"
                            style={{ fontWeight: '600' }}
                        />
                        <Form.Text className="text-muted small">Càng nhỏ quét càng nhanh nhưng tốn RAM.</Form.Text>
                    </Col>

                    {/* Khu vực 3: Thông báo */}
                    <Col md={6} className="mb-4">
                        <Form.Label className="small text-uppercase fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                            <Bell size={14} /> Cảnh báo âm thanh
                        </Form.Label>
                        <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                            <span className="fw-medium text-dark small">Phát âm khi phát hiện vi phạm</span>
                            <Form.Check 
                                type="switch"
                                id="sound-switch"
                                checked={config.enableSound}
                                onChange={(e) => setConfig({...config, enableSound: e.target.checked})}
                            />
                        </div>
                    </Col>
                </Row>

                <div className="d-grid mt-2">
                  <Button 
                    type="submit"
                    variant="dark" 
                    className="fw-bold py-3 rounded-3 shadow-sm border-0 btn-save"
                  >
                    <Save size={18} className="me-2" /> CẬP NHẬT CẤU HÌNH
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* CỘT PHẢI: Giải thích & Hướng dẫn */}
        <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 bg-white mb-4">
                <Card.Body className="p-4">
                    <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                        <Zap size={18} className="text-warning" /> Hướng dẫn nhanh
                    </h6>
                    <ul className="list-unstyled small text-muted lh-lg">
                        <li className="mb-2">🔹 <strong>Backend:</strong> Nơi xử lý AI. Nếu bạn cài Camera ở máy khác, hãy nhập IP máy đó vào đây.</li>
                        <li className="mb-2">🔹 <strong>Tần suất:</strong> Nên để từ 1-3 giây để đảm bảo máy không bị lag.</li>
                        <li className="mb-2">🔹 <strong>Âm thanh:</strong> Loa sẽ kêu khi có người dùng điện thoại trước camera.</li>
                    </ul>
                    <hr />
                    <div className="text-center py-2">
                        <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill opacity-75">
                            System Version 2.0.4
                        </Badge>
                    </div>
                </Card.Body>
            </Card>

            <div className="p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10 text-center">
                <p className="text-primary small fw-bold mb-0">
                    Sản phẩm phát triển bởi Quoc Tinh Dev
                </p>
            </div>
        </Col>
      </Row>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .settings-page { font-family: 'Inter', sans-serif !important; }
        .title-font { letter-spacing: -0.02em; }
        .bg-light { background-color: #f8f9fa !important; }
        
        .btn-save {
            background: linear-gradient(135deg, #212529 0%, #343a40 100%);
            transition: all 0.3s ease;
        }
        
        .btn-save:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2) !important;
        }

        .form-check-input:checked {
            background-color: #ffc107;
            border-color: #ffc107;
        }

        .animate-fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </Container>
  );
}