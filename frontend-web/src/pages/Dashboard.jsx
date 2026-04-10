import { useState, useEffect, useCallback } from "react";
import { Row, Col, Card, Badge, Container, Button } from "react-bootstrap";
import axiosClient from "@/api/axiosClient"; 
import ToastNotification from "@/components/ToastNotification";
import { 
  Clock, Monitor, FileText, Database, Trash2, 
  ExternalLink, ShieldAlert, Activity 
} from "lucide-react";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [newestLog, setNewestLog] = useState(null);
  
  // Lấy API Root từ axiosClient để hiển thị ảnh động
  const API_ROOT = axiosClient.defaults.baseURL.replace('/api', '');

  // 1. Dùng useCallback để tránh re-render vô tận và tối ưu bộ nhớ
  const fetchLogs = useCallback(async () => {
    try {
      const res = await axiosClient.get("/logs");
      const freshData = res.data;

      if (freshData.length > 0) {
        setLogs(prevLogs => {
          // Chỉ bắn Toast nếu có ID thực sự mới (Tránh bắn trùng khi fetch lại)
          if (prevLogs.length > 0 && freshData[0].id !== prevLogs[0].id) {
            setNewestLog(freshData[0]);
            setShowToast(true);
            // Kích hoạt âm thanh thông báo
          const isSoundEnabled = localStorage.getItem("enableSound") !== "false"; 
           if (isSoundEnabled) {
        const audio = new Audio('/alert.mp3');
        audio.play().catch(() => console.log("Chặn tự động phát âm thanh"));
    }
          }
          return freshData;
        });
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Mất kết nối server AI...");
    }
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Xóa bằng chứng vi phạm này?")) {
      try {
        await axiosClient.delete(`/logs/${id}`);
        setLogs(prev => prev.filter(log => log.id !== id));
      } catch (err) {
        alert("Lỗi khi xóa dữ liệu");
      }
    }
  };

  // 2. Fix lỗi Infinite Loop bằng cách để mảng dependency rỗng
useEffect(() => {
  // 1. Gọi lần đầu tiên ngay khi mở trang
  fetchLogs();

  // 2. Lấy con số bạn đã lưu ở Settings (mặc định là 2 nếu chưa lưu)
  const savedInterval = localStorage.getItem("refreshInterval") || "2";
  
  // 3. Chuyển từ Giây sang Mili giây (VD: 4 giây -> 4000ms)
  const intervalMs = parseInt(savedInterval) * 1000;

  // 4. Thiết lập đồng hồ quét tự động theo đúng ý bạn
  const timer = setInterval(fetchLogs, intervalMs);

  // Dọn dẹp bộ nhớ khi tắt trang
  return () => clearInterval(timer);
}, [fetchLogs]);

  return (
    <Container className="mt-3 mt-md-4 pb-5">
      <ToastNotification 
        show={showToast} 
        newLog={newestLog} 
        onClose={() => setShowToast(false)} 
      />

      {/* Header: Responsive linh hoạt */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center mb-4 border-start border-4 border-warning ps-3 py-1 gap-2">
        <div>
          <h4 className="mb-0 text-light text-uppercase fw-bold" style={{ fontSize: 'calc(1.1rem + 0.3vw)' }}>
            Giám Sát Trực Tuyến
          </h4>
          <p className="text-muted small mb-0 d-flex align-items-center">
            <Activity size={12} className="text-success me-1 animate-pulse" /> 
            AI Mode: <span className="ms-1 text-info">Production Test</span>
          </p>
        </div>
        <div className="ms-sm-auto">
          <Badge bg="dark" className="p-2 border border-secondary shadow-sm">
            <Database size={14} className="me-1 text-info" /> 
            Bộ nhớ: {logs.length}/12
          </Badge>
        </div>
      </div>

      {/* 3. Grid System: Tối ưu cho 3 loại thiết bị */}
      <Row className="g-3 g-md-4">
        {logs.map((log) => (
          /* xs={12}: 1 cột trên Điện thoại 
             sm={6}: 2 cột trên Máy tính bảng nhỏ
             md={4}: 3 cột trên Máy tính bảng lớn
             lg={3}: 4 cột trên Máy tính (PC)
          */
          <Col xs={12} sm={6} md={4} lg={3} key={log.id}>
            <Card className="border-0 shadow-sm h-100 bg-white overflow-hidden card-violation">
              <div className="position-relative">
                <Card.Img 
                  variant="top" 
                  src={`${API_ROOT}/api/images/${log.image}`} 
                  style={{ height: "180px", objectFit: "cover" }}
                  loading="lazy" // Tối ưu tốc độ load ảnh
                />
                <div className="position-absolute top-0 end-0 p-2">
                  <Badge bg="danger" className="shadow d-flex align-items-center gap-1">
                    <ShieldAlert size={10} /> CẢNH BÁO
                  </Badge>
                </div>
              </div>

              <Card.Body className="p-3 d-flex flex-column">
                <div className="fw-bold text-danger mb-1 d-flex align-items-center gap-1" style={{fontSize: '0.9rem'}}>
                  <FileText size={14} /> VI PHẠM SỬ DỤNG ĐT
                </div>
                
                <div className="text-muted d-flex align-items-center mb-3" style={{ fontSize: '0.75rem' }}>
                  <Clock size={12} className="me-1 text-primary" /> {log.time}
                </div>

                <div className="d-flex gap-2 mt-auto pt-2 border-top">
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="flex-grow-1 d-flex align-items-center justify-content-center"
                    onClick={() => handleDelete(log.id)}
                  >
                    <Trash2 size={14} className="me-1" /> Xóa
                  </Button>
                  <Button 
                    variant="dark" 
                    size="sm" 
                    onClick={() => window.open(`${API_ROOT}/api/images/${log.image}`, '_blank')}
                  >
                    <ExternalLink size={14} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Trạng thái trống */}
      {logs.length === 0 && (
        <div className="text-center py-5">
          <Monitor size={60} className="text-secondary opacity-25" />
          <h6 className="text-muted mt-3">Đang đợi tín hiệu từ Camera AI...</h6>
        </div>
      )}
    </Container>
  );
}