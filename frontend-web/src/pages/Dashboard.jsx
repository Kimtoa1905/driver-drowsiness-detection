import { useState, useEffect, useCallback, useRef } from "react";
import { Row, Col, Card, Badge, Container, Button, ProgressBar } from "react-bootstrap";
import axiosClient from "@/api/axiosClient"; 
import ToastNotification from "@/components/ToastNotification";
import { Clock, Trash2, ExternalLink, Activity, AlertTriangle, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [newestLog, setNewestLog] = useState(null);

  // 🔊 AUDIO
  const audioRef = useRef(null);

  const API_ROOT = axiosClient.defaults.baseURL.replace('/api', '');

  // load audio 1 lần
  useEffect(() => {
    audioRef.current = new Audio("/alert.mp3");
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axiosClient.get("/logs");
      const data = res.data;

      if (data.length > 0) {
        setLogs(prev => {

          // 🔥 detect log mới
          if (prev.length > 0 && data[0].id !== prev[0].id) {
            setNewestLog(data[0]);

            // 🔊 phát âm thanh
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {
                console.log("Browser chặn âm thanh");
              });
            }

            setShowToast(true);
          }

          return data.slice(0, 9);
        });

      } else {
        setLogs([]);
      }

    } catch {
      console.log("AI server error");
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const timer = setInterval(fetchLogs, 2000);
    return () => clearInterval(timer);
  }, [fetchLogs]);

  const handleDelete = async (id) => {
    await axiosClient.delete(`/logs/${id}`);
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  // fake AI metrics
  const EAR = 0.21;
  const fatigueLevel = logs.length > 3 ? 70 : 30;

  return (
    <Container className="mt-4 pb-5">

      <ToastNotification 
        show={showToast} 
        newLog={newestLog} 
        onClose={() => setShowToast(false)} 
      />

      {/* HEADER */}
      <div className="mb-4">
        <h4 style={{ color: "#3b82f6" }}>
          AI DRIVER ANALYTICS SYSTEM
        </h4>
        <div className="text-secondary small">
          Real-time drowsiness detection using Eye Aspect Ratio (EAR)
        </div>
      </div>

      {/* METRICS */}
      <Row className="g-3 mb-4">

        <Col md={3}>
          <Card style={{ background: "#111827", color: "#fff" }}>
            <Card.Body>
              <div className="text-secondary small">System Status</div>
              <div style={{ color: "#22c55e" }}>
                <Activity size={16}/> ACTIVE
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card style={{ background: "#111827", color: "#fff" }}>
            <Card.Body>
              <div className="text-secondary small">Total Alerts</div>
              <div style={{ color: "#ef4444" }}>
                {logs.length}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card style={{ background: "#111827", color: "#fff" }}>
            <Card.Body>
              <div className="text-secondary small">EAR Value</div>
              <div style={{ color: "#3b82f6" }}>
                {EAR}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card style={{ background: "#111827", color: "#fff" }}>
            <Card.Body>
              <div className="text-secondary small">Fatigue Level</div>
              <div style={{ color: "#f59e0b" }}>
                {fatigueLevel}%
              </div>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* INSIGHT */}
      <Card className="mb-4" style={{ background: "#111827", color: "#fff" }}>
        <Card.Body>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <TrendingUp size={16}/> Driver Fatigue Analysis
            </div>
            <Badge bg="dark" className="border border-primary">
              REAL-TIME
            </Badge>
          </div>

          <ProgressBar 
            now={fatigueLevel} 
            variant={fatigueLevel > 60 ? "danger" : "info"} 
            style={{ height: "10px" }}
          />

          <div className="text-secondary small mt-2">
            Estimated fatigue level based on blink rate & EAR threshold
          </div>

        </Card.Body>
      </Card>

      {/* LOGS */}
      <Row className="g-3">
        {logs.map((log) => (
          <Col md={4} key={log.id}>
            <Card style={{ background: "#111827", color: "#fff" }}>

              <Card.Img 
                src={`${API_ROOT}/api/images/${log.image}`} 
                style={{ height: "180px", objectFit: "cover" }}
              />

              <Card.Body>

                <div style={{ color: "#ef4444" }}>
                  <AlertTriangle size={14}/> DROWSINESS DETECTED
                </div>

                <div className="text-secondary small mb-2">
                  <Clock size={12}/> {log.time}
                </div>

                <div className="d-flex gap-2">

                  <Button size="sm" variant="outline-danger"
                    onClick={() => handleDelete(log.id)}
                  >
                    <Trash2 size={14}/>
                  </Button>

                  <Button size="sm" variant="primary"
                    onClick={() => window.open(`${API_ROOT}/api/images/${log.image}`)}
                  >
                    <ExternalLink size={14}/>
                  </Button>

                </div>

              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

    </Container>
  );
}