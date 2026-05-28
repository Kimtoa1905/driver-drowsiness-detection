import { useState, useEffect } from "react";
import { Container, Badge } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import axiosClient from "@/api/axiosClient";
import { Activity, Cpu, User } from "lucide-react";

function MyNavbar() {
  const [isServerOnline, setIsServerOnline] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axiosClient.get("/status");
        setIsServerOnline(res.data.status === "online");
      } catch {
        setIsServerOnline(false);
      }
    };

    checkStatus();
    const timer = setInterval(checkStatus, 10000);
    return () => clearInterval(timer);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #0f172a, #1e3a8a)",
        borderBottom: "1px solid rgba(59,130,246,0.3)",
        boxShadow: "0 0 20px rgba(59,130,246,0.2)"
      }}
    >
      <Container className="py-3 d-flex align-items-center justify-content-between">

        {/* LEFT: SYSTEM */}
        <div className="d-flex align-items-center gap-2">
          <Cpu size={22} style={{ color: "#3b82f6" }} />
          <div>
            <div className="text-light fw-bold" style={{ fontSize: "14px" }}>
              AI DRIVER SYSTEM
            </div>
            <div className="small" style={{ color: "#9ca3af" }}>
              Monitoring Engine
            </div>
          </div>
        </div>

        {/* CENTER: MENU */}
        <div className="d-none d-md-flex align-items-center gap-4">

          <Link
            to="/"
            style={{
              textDecoration: "none",
              fontSize: "13px",
              color: isActive("/") ? "#3b82f6" : "#9ca3af",
              fontWeight: isActive("/") ? "bold" : "normal"
            }}
          >
            Dashboard
          </Link>

          <Link
            to="/settings"
            style={{
              textDecoration: "none",
              fontSize: "13px",
              color: isActive("/settings") ? "#3b82f6" : "#9ca3af",
              fontWeight: isActive("/settings") ? "bold" : "normal"
            }}
          >
            Cài đặt
          </Link>

          {/* MODE */}
          <div className="d-flex align-items-center gap-2 ms-2">
            <Activity size={16} style={{ color: "#22c55e" }} />
            <Badge
              style={{
                background: "rgba(34,197,94,0.1)",
                color: "#22c55e",
                border: "1px solid rgba(34,197,94,0.4)",
                fontSize: "11px"
              }}
            >
              REAL-TIME
            </Badge>
          </div>

        </div>

        {/* RIGHT: USER + STATUS */}
        <div className="d-flex align-items-center gap-3">

          {/* SERVER */}
          <Badge
            style={{
              background: isServerOnline ? "#22c55e" : "#ef4444",
              fontSize: "10px",
              boxShadow: isServerOnline
                ? "0 0 6px #22c55e"
                : "0 0 6px #ef4444"
            }}
          >
            {isServerOnline ? "ONLINE" : "OFFLINE"}
          </Badge>

          {/* USER */}
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#1e3a8a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <User size={16} color="#fff" />
            </div>

            <div>
              <div className="text-light" style={{ fontSize: "12px" }}>
                Kim Toa
              </div>
              <div style={{ fontSize: "10px", color: "#3b82f6" }}>
                ADMIN
              </div>
            </div>
          </div>

        </div>

      </Container>
    </div>
  );
}

export default MyNavbar;