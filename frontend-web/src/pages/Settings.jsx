import { useState } from "react";
import { Container, Card, Form, Button, Alert, Row, Col, Badge } from "react-bootstrap";
import { Settings as SettingsIcon, Save, Server, Bell, RefreshCw, ShieldCheck, Zap } from "lucide-react";

export default function Settings() {

  const [config, setConfig] = useState({
    backendUrl: localStorage.getItem("backendUrl") || "http://127.0.0.1:5000",
    refreshInterval: localStorage.getItem("refreshInterval") || "2",
    enableSound: localStorage.getItem("enableSound") !== "false",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();

    localStorage.setItem("backendUrl", config.backendUrl);
    localStorage.setItem("refreshInterval", config.refreshInterval.toString());
    localStorage.setItem("enableSound", config.enableSound.toString());

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <Container className="mt-4 pb-5 px-4 text-light rounded-4 shadow-sm"
      style={{
        background: "#0b1220"
      }}
    >

      {/* HEADER */}
      <div 
        className="mb-4 ps-3 py-2"
        style={{ borderLeft: "4px solid #3b82f6" }}
      >
        <h4 className="fw-bold mb-0" style={{ color: "#3b82f6" }}>
          CẤU HÌNH GIÁM SÁT TÀI XẾ
        </h4>
        <small className="text-secondary">
          Điều chỉnh hoạt động của hệ thống AI
        </small>
      </div>

      {saved && (
        <Alert 
          className="border-0 shadow-sm text-light"
          style={{
            background: "#1e293b",
            border: "1px solid rgba(59,130,246,0.3)"
          }}
        >
          <ShieldCheck size={18} className="me-2 text-success" />
          Đã lưu cấu hình!
        </Alert>
      )}

      <Row className="g-4">

        {/* LEFT */}
        <Col lg={8}>
          <Card 
            className="border-0 text-light rounded-4"
            style={{
              background: "#111827",
              border: "1px solid rgba(59,130,246,0.2)"
            }}
          >
            <Card.Body>

              <div className="mb-3 d-flex align-items-center gap-2">
                <SettingsIcon size={18} style={{ color: "#3b82f6" }} />
                <span className="fw-bold">Thiết lập hệ thống</span>
              </div>

              <Form onSubmit={handleSave}>

                {/* BACKEND */}
                <div className="mb-4">
                  <Form.Label className="fw-bold small" style={{ color: "#3b82f6" }}>
                    <Server size={14} /> AI Server
                  </Form.Label>

                  <Form.Control
                    type="text"
                    value={config.backendUrl}
                    onChange={(e) =>
                      setConfig({ ...config, backendUrl: e.target.value })
                    }
                    style={{
                      background: "#0b1220",
                      color: "#e5e7eb",
                      border: "1px solid rgba(59,130,246,0.3)"
                    }}
                  />

                  <small className="text-secondary">
                    Địa chỉ kết nối đến hệ thống AI
                  </small>
                </div>

                <Row>

                  {/* REFRESH */}
                  <Col md={6} className="mb-4">
                    <Form.Label className="fw-bold small" style={{ color: "#3b82f6" }}>
                      <RefreshCw size={14} /> Tần suất quét (giây)
                    </Form.Label>

                    <Form.Control
                      type="number"
                      value={config.refreshInterval}
                      onChange={(e) =>
                        setConfig({ ...config, refreshInterval: e.target.value })
                      }
                      style={{
                        background: "#0b1220",
                        color: "#e5e7eb",
                        border: "1px solid rgba(59,130,246,0.3)"
                      }}
                    />

                    <small className="text-secondary">
                      Nên để từ 1–3 giây
                    </small>
                  </Col>

                  {/* SOUND */}
                  <Col md={6} className="mb-4">
                    <Form.Label className="fw-bold small" style={{ color: "#3b82f6" }}>
                      <Bell size={14} /> Cảnh báo âm thanh
                    </Form.Label>

                    <div 
                      className="d-flex justify-content-between align-items-center p-2 rounded"
                      style={{
                        background: "#0b1220",
                        border: "1px solid rgba(59,130,246,0.3)"
                      }}
                    >
                      <span className="small">
                        Phát âm khi phát hiện buồn ngủ
                      </span>

                      <Form.Check
                        type="switch"
                        checked={config.enableSound}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            enableSound: e.target.checked,
                          })
                        }
                      />
                    </div>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  className="w-100 fw-bold"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    border: "none",
                    boxShadow: "0 0 10px rgba(59,130,246,0.4)"
                  }}
                >
                  <Save size={16} className="me-2" />
                  LƯU CẤU HÌNH
                </Button>

              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT */}
        <Col lg={4}>
          <Card 
            className="border-0 text-light rounded-4"
            style={{
              background: "#111827",
              border: "1px solid rgba(59,130,246,0.2)"
            }}
          >
            <Card.Body>

              <div className="mb-3 d-flex align-items-center gap-2">
                <Zap size={18} style={{ color: "#3b82f6" }} />
                <span className="fw-bold">Hướng dẫn</span>
              </div>

              <ul className="small text-light ps-3">
                <li className="mb-2">AI Server: xử lý nhận diện tài xế</li>
                <li className="mb-2">Tần suất: nên để 1–3 giây</li>
                <li className="mb-2">Âm thanh: cảnh báo khi buồn ngủ</li>
              </ul>

              <hr style={{ borderColor: "rgba(59,130,246,0.2)" }} />

              <div className="text-center">
                <Badge 
                  style={{
                    background: "#1d4ed8",
                    boxShadow: "0 0 10px rgba(59,130,246,0.4)"
                  }}
                >
                  Driver Monitor v1.0
                </Badge>
              </div>

            </Card.Body>
          </Card>
        </Col>

      </Row>

    </Container>
  );
}