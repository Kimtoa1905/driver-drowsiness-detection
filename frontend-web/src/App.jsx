import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import MyNavbar from "@/components/MyNavbar";
import Dashboard from "@/pages/Dashboard";
import Report from "@/pages/Report";
import Settings from "@/pages/Settings";

function App() {
  return (
    <Router>
      {/* THAY ĐỔI: Đổi overflow-hidden thành overflow-x-hidden để tránh mất Footer khi nội dung dài 
      */}
      <div className="bg-dark min-vh-100 d-flex flex-column text-white overflow-x-hidden">
        
        <MyNavbar />

        <main className="flex-grow-1 py-3 py-md-4">
          <Container fluid="lg"> 
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/*<Route path="/report" element={<Report />} />*/}
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Container>
        </main>
        
        {/* CHỈNH SỬA FOOTER: 
            - Tăng py-4 để tạo khoảng trống an toàn dưới cùng (đặc biệt quan trọng trên Mobile có thanh điều hướng hệ thống)
            - Chỉnh lại font size và độ mờ để thông tin hiện rõ nhưng không bị thô.
        */}
{/* 3. Footer: Tối ưu Tối giản & Sang trọng */}
    <footer
  className="mt-auto"
  style={{
    background: "linear-gradient(90deg, #020617, #1e3a8a)",
    borderTop: "1px solid rgba(59,130,246,0.2)",
    boxShadow: "0 -5px 20px rgba(59,130,246,0.15)"
  }}
>
  <Container className="py-3">

    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">

      {/* LEFT: SYSTEM */}
      <div className="text-center text-md-start">
        <div
          style={{
            color: "#3b82f6",
            fontWeight: "bold",
            fontSize: "13px",
            letterSpacing: "1px",
            textShadow: "0 0 8px rgba(59,130,246,0.5)"
          }}
        >
          AI DRIVER MONITOR
        </div>

        <div
          style={{
            fontSize: "10px",
            color: "#9ca3af"
          }}
        >
          Real-time Drowsiness Detection System
        </div>
      </div>

      {/* CENTER: STATUS */}
      <div className="d-none d-md-flex align-items-center gap-2">

        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 6px #22c55e"
          }}
        ></div>

        <span
          style={{
            fontSize: "11px",
            color: "#22c55e",
            letterSpacing: "1px"
          }}
        >
          SYSTEM ACTIVE
        </span>

      </div>

      {/* RIGHT: VERSION */}
      <div className="text-center text-md-end">
        <div
          style={{
            fontSize: "10px",
            color: "#3b82f6",
            opacity: 0.8,
            letterSpacing: "1px"
          }}
        >
          VERSION 1.0
        </div>

        <div
          style={{
            fontSize: "9px",
            color: "#6b7280"
          }}
        >
          Driver Monitoring System
        </div>
      </div>

    </div>

  </Container>
</footer>
      </div>

      <style>{`
        body {
          margin: 0;
          /* Chặn cuộn ngang (gây ra bởi animation hoặc container quá rộng) */
          overflow-x: hidden; 
          background-color: #212529;
        }
        
        .flex-grow-1 {
          animation: fadeIn 0.4s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Tinh chỉnh thanh cuộn cho PC mượt hơn */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #212529; }
        ::-webkit-scrollbar-thumb { 
            background: #3d4246; 
            border-radius: 10px;
            border: 2px solid #212529;
        }
        ::-webkit-scrollbar-thumb:hover { background: #495057; }
      `}</style>
    </Router>
  );
}

export default App;