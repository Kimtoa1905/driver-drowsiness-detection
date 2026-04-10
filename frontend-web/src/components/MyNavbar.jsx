import { useState, useEffect } from "react";
import { Navbar, Container, Nav, Badge } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import axiosClient from "@/api/axiosClient"; 
import { 
  Shield, 
  Activity, 
  HardDrive, 
  LayoutDashboard, 
  FileBarChart, 
  Settings
} from "lucide-react";

function MyNavbar() {
  const location = useLocation();
  const [isServerOnline, setIsServerOnline] = useState(false);

  // LOGIC GIỮ NGUYÊN: Kiểm tra trạng thái server
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axiosClient.get("/status");
        if (res.data.status === "online") setIsServerOnline(true);
      } catch (err) {
        setIsServerOnline(false);
      }
    };
    checkStatus();
    const timer = setInterval(checkStatus, 10000);
    return () => clearInterval(timer);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar 
      bg="dark" 
      variant="dark" 
      expand="lg" 
      className="py-2 sticky-top shadow-lg border-0" 
      style={{ zIndex: 1050 }}
    >
      <Container>
        {/* LOGO */}
        <Navbar.Brand 
          as={Link} 
          to="/" 
          className="fw-bold d-flex align-items-center text-uppercase"
          style={{ letterSpacing: '1.5px' }}
        >
          <Shield className="me-2 text-warning" size={24} /> 
          <span className="d-none d-sm-inline">PhoneGuard</span> 
          <span className="text-muted ms-1 small">AI</span>
        </Navbar.Brand>
        
        {/* Mobile Toggle */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none">
          <Activity size={20} className={isServerOnline ? "text-success" : "text-danger"} />
        </Navbar.Toggle>
        
        <Navbar.Collapse id="basic-navbar-nav">
          {/* MENU CHÍNH */}
          <Nav className="mx-auto py-3 py-lg-0">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`d-flex align-items-center px-lg-3 py-2 py-lg-0 ${isActive('/') ? 'active fw-bold text-warning' : 'text-white-50'}`}
            >
              <LayoutDashboard size={18} className="me-2" /> Giám sát
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/report" 
              className={`d-flex align-items-center px-lg-3 py-2 py-lg-0 ${isActive('/report') ? 'active fw-bold text-warning' : 'text-white-50'}`}
            >
              <FileBarChart size={18} className="me-2" /> Báo cáo
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/settings" 
              className={`d-flex align-items-center px-lg-3 py-2 py-lg-0 ${isActive('/settings') ? 'active fw-bold text-warning' : 'text-white-50'}`}
            >
              <Settings size={18} className="me-2" /> Cài đặt
            </Nav.Link>
          </Nav>

          {/* PHẦN TRẠNG THÁI & ADMIN (Đã xóa sạch đường kẻ) */}
          <Nav className="ms-auto align-items-center border-0 pt-3 pt-lg-0">
            
            {/* Server Status - Chỉ hiện trên Desktop */}
            <div className="d-none d-md-flex align-items-center me-3 pe-3 border-end border-secondary">
              <HardDrive size={16} className="text-muted me-2" />
              <span className="text-muted" style={{fontSize: '12px'}}>
                {isServerOnline ? 
                  <Badge bg="success" pill className="px-2" style={{fontSize: '9px', opacity: '0.9'}}>ONLINE</Badge> : 
                  <Badge bg="danger" pill className="px-2" style={{fontSize: '9px', opacity: '0.9'}}>OFFLINE</Badge>
                }
              </span>
            </div>
            
            {/* Admin Profile */}
            <div className="d-flex align-items-center ms-lg-2">
              <div className="position-relative me-2">
                {/* Avatar tinh tế hơn */}
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                  style={{
                    width: '36px', 
                    height: '36px', 
                    background: 'linear-gradient(135deg, #495057 0%, #212529 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffc107',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  A
                </div>
                
                {/* Online Dot */}
                <div 
                  className={`position-absolute bottom-0 end-0 border border-dark rounded-circle ${isServerOnline ? 'bg-success' : 'bg-danger'}`} 
                  style={{
                    width: '10px', 
                    height: '10px',
                    boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                  }}
                ></div>
              </div>

              <div className="text-light">
                <div className="fw-bold" style={{ fontSize: '13px', lineHeight: '1.2' }}>Quoc Tinh</div>
                <div style={{ fontSize: '10px', letterSpacing: '0.3px' }} className="text-warning text-uppercase opacity-75 fw-medium">
                  Administrator
                </div>
              </div>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;