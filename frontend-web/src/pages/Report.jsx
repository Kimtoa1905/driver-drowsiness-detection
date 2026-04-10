import { useState, useEffect, useCallback, useMemo } from "react";
import { Container, Table, Button, Badge, Form, InputGroup, Card, Row, Col } from "react-bootstrap";
import { FileDown, Search, RefreshCw, Trash2, Eye, FileWarning, RotateCcw } from "lucide-react";
import axiosClient from "@/api/axiosClient";
import { exportToExcel } from "@/utils/excelExport";

export default function Report() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const API_ROOT = axiosClient.defaults.baseURL.replace('/api', '');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/logs");
      setLogs(res.data);
    } catch (err) {
      console.error("Lỗi tải báo cáo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // HÀM RESET: Vừa xóa filter vừa tải lại dữ liệu mới nhất
  const handleResetAll = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    fetchLogs(); // Cập nhật dữ liệu từ server
  };

  const convertToDate = (dateStr) => {
    if (!dateStr) return null;
    const dmyRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
    const matchDmy = dateStr.match(dmyRegex);
    if (matchDmy) {
      return new Date(parseInt(matchDmy[3]), parseInt(matchDmy[2]) - 1, parseInt(matchDmy[1]));
    }
    const ymdRegex = /(\d{4})-(\d{1,2})-(\d{1,2})/;
    const matchYmd = dateStr.match(ymdRegex);
    if (matchYmd) {
      return new Date(parseInt(matchYmd[1]), parseInt(matchYmd[2]) - 1, parseInt(matchYmd[3]));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = log.id.toLowerCase().includes(search) || 
                            log.time.toLowerCase().includes(search);

      let matchesRange = true;
      const logDate = convertToDate(log.time);
      if (logDate) {
        logDate.setHours(0, 0, 0, 0);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (logDate < start) matchesRange = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          if (logDate > end) matchesRange = false;
        }
      }
      return matchesSearch && matchesRange;
    });
  }, [logs, searchTerm, startDate, endDate]);

  const handleDelete = async (id) => {
    if (window.confirm(`Xóa vĩnh viễn báo cáo #${id}?`)) {
      try {
        await axiosClient.delete(`/logs/${id}`);
        setLogs(prev => prev.filter(l => l.id !== id));
      } catch (err) { alert("Không thể xóa"); }
    }
  };

  return (
    <Container className="mt-3 mt-md-5 pb-5 px-4 bg-light rounded-4 shadow-sm report-page" style={{ minHeight: '85vh' }}>
      
      {/* HEADER: Đã bỏ nút Refresh lẻ loi */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 pt-4">
        <div className="border-start border-4 border-warning ps-3 py-1">
          <h4 className="text-dark fw-bold text-uppercase mb-0 title-font">Lịch sử vi phạm</h4>
          <p className="text-muted small mb-0 fw-medium">
            Hiển thị <span className="text-danger fw-bold">{filteredLogs.length}</span> / {logs.length} bản ghi
          </p>
        </div>
        
        <Button 
          variant="dark" 
          onClick={() => exportToExcel(filteredLogs)} 
          className="d-flex align-items-center justify-content-center gap-2 shadow-sm px-4 py-2 rounded-3 fw-semibold border-0 btn-export"
        >
          <FileDown size={18} /> <span>Xuất Excel</span>
        </Button>
      </div>

      {/* FILTER BOX: Tối ưu nút Làm mới */}
      <Card className="border-0 shadow-sm mb-4 rounded-3 overflow-hidden">
        <Card.Body className="p-3 bg-white">
          <Row className="g-3">
            <Col lg={4}>
              <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Tìm kiếm nhanh</Form.Label>
              <InputGroup className="bg-light rounded-3 overflow-hidden border">
                <InputGroup.Text className="bg-transparent border-0 text-muted"><Search size={16} /></InputGroup.Text>
                <Form.Control
                  placeholder="Nhập mã ID hoặc thời gian..."
                  className="bg-transparent border-0 shadow-none py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col lg={3} xs={6}>
              <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Từ ngày</Form.Label>
              <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-light border shadow-none py-2 rounded-3" />
            </Col>
            <Col lg={3} xs={6}>
              <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Đến ngày</Form.Label>
              <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-light border shadow-none py-2 rounded-3" />
            </Col>
            <Col lg={2} className="d-flex align-items-end">
              {/* NÚT LÀM MỚI TỔNG HỢP */}
              <Button 
                variant="outline-warning" 
                className={`w-100 py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 border-2 ${loading ? 'disabled' : ''}`}
                onClick={handleResetAll}
              >
                <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
                Làm mới
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* TABLE */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden border-top border-4 border-warning">
        <div className="table-responsive">
          <Table hover className="mb-0 custom-table">
            <thead className="bg-white text-muted border-bottom">
              <tr style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <th className="py-3 px-4 text-uppercase fw-bold text-start">Dòng thời gian</th>
                <th className="py-3 d-none d-md-table-cell text-uppercase fw-bold text-center">Mã ID</th>
                <th className="py-3 text-uppercase fw-bold text-center">Trạng thái</th>
                <th className="py-3 text-end px-4 text-uppercase fw-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="align-middle border-bottom border-light-subtle transition-row">
                  <td className="py-3 px-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 rounded-3 bg-danger bg-opacity-10 text-danger"><FileWarning size={18} /></div>
                      <div className="d-flex flex-column text-start">
                        <span className="fw-bold text-dark time-text">{log.time}</span>
                        <span className="text-muted d-md-none" style={{ fontSize: '11px' }}>ID: #{log.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="d-none d-md-table-cell text-center"><code className="text-secondary small">#{log.id}</code></td>
                  <td className="text-center">
                    <Badge className="rounded-pill px-3 py-1 bg-danger bg-opacity-75 status-badge shadow-sm">DETECTED</Badge>
                  </td>
                  <td className="text-end px-4">
                    <div className="d-flex justify-content-end gap-1">
                      <Button variant="link" className="text-primary p-2 action-btn" onClick={() => window.open(`${API_ROOT}/api/images/${log.image}`, '_blank')}><Eye size={18} /></Button>
                      <Button variant="link" className="text-danger p-2 action-btn" onClick={() => handleDelete(log.id)}><Trash2 size={18} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-5 bg-white">
            <Search size={48} className="text-muted opacity-25 mb-3" />
            <h6 className="text-muted fw-normal">Không tìm thấy dữ liệu phù hợp</h6>
          </div>
        )}
      </Card>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .report-page { font-family: 'Inter', sans-serif !important; }
        .title-font { letter-spacing: -0.02em; font-size: 1.25rem; }
        .time-text { font-size: 0.95rem; }
        .status-badge { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.03em; }
        .action-btn { transition: all 0.2s; }
        .action-btn:hover { background-color: #f8f9fa; border-radius: 50%; transform: scale(1.1); }
        .btn-export { background: linear-gradient(135deg, #212529 0%, #343a40 100%); transition: transform 0.2s; }
        .btn-export:hover { transform: translateY(-2px); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .transition-row:hover { background-color: #fcfcfc !important; }
      `}</style>
    </Container>
  );
}