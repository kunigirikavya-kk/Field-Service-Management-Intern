import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./DashboardLayout.css";

function DashboardLayout() {

  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("fieldsyncToken");
    localStorage.removeItem("fieldsyncAuthenticated");
    localStorage.removeItem("fieldsyncUser");
    navigate("/login", { replace: true });
  };

  return (
    <div className="app">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="main">
        <Topbar
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="content">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default DashboardLayout;
