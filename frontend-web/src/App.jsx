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
              <Route path="/report" element={<Report />} />
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
        <footer className="py-3 border-top border-secondary mt-auto bg-dark">
          <Container>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center opacity-75">
              
              {/* Bên trái: Copyright */}
              <div className="text-center text-sm-start mb-2 mb-sm-0">
                <small className="text-muted">
                  © 2026 <span className="text-warning fw-bold">PhoneGuard AI</span>
                </small>
              </div>
              
              {/* Bên phải: Dev Info (Đã xóa bản thử nghiệm) */}
              <div className="text-center text-sm-end">
                <span 
                  style={{fontSize: '10px', letterSpacing: '1px'}} 
                  className="text-uppercase fw-medium text-secondary"
                >
                  Phát triển bởi Quoc Tinh Dev
                </span>
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