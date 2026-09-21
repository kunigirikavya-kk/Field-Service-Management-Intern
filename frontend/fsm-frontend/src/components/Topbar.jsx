import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Search, UserRound } from "lucide-react";
import "./Topbar.css";

function Topbar({ onLogout, onMenuToggle }) {

  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();

  const storedUser = localStorage.getItem("fieldsyncUser");
  let user = null;
  try { user = storedUser ? JSON.parse(storedUser) : null; } catch { user = null; }

  const userName = user?.fullName || "User";
  const userRole = user?.role || "USER";
  const userInitial = userName.charAt(0).toUpperCase();

  // Page titles
  const titles = {
    "/dashboard": "Dashboard",
    "/customers": "Customers",
    "/technicians": "Technicians",
    "/service-requests/new": "Service Requests",
    "/work-orders": "Work Orders",
    "/schedule": "Schedule",
    "/job-execution": "Job Execution",
    "/inventory": "Inventory",
    "/billing": "Billing",
    "/reports": "Reports & Analytics",
  };
  const pageTitle = titles[location.pathname] || "FieldSync";

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="topbar">

      <div className="topbar-left">
        <button className="hamburger" onClick={onMenuToggle} type="button">
          <Menu size={22} strokeWidth={1.8} aria-hidden />
        </button>
        <div>
          <h1 className="topbar-title">{pageTitle}</h1>
          <p className="topbar-subtitle">Manage your field operations efficiently</p>
        </div>
      </div>

      <div className="topbar-right">

        {/* Search */}
        <div className="topbar-search">
          <Search size={16} strokeWidth={1.8} aria-hidden />
          <input type="text" placeholder="Search..." />
        </div>

        {/* Notifications */}
        <div className="topbar-dropdown" ref={notifRef}>
          <button className="topbar-icon-btn" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }} type="button">
            <Bell size={20} strokeWidth={1.8} aria-hidden />
            <span className="notif-dot"></span>
          </button>
          {showNotif && (
            <div className="dropdown-menu dropdown-notif">
              <div className="dropdown-header">Notifications</div>
              <p className="dropdown-empty">No new notifications</p>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="topbar-dropdown" ref={profileRef}>
          <button className="topbar-profile-btn" onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }} type="button">
            <div className="topbar-avatar">{userInitial}</div>
            <div className="topbar-user-info">
              <strong>{userName}</strong>
              <small>{userRole}</small>
            </div>
            <ChevronDown size={16} strokeWidth={1.8} aria-hidden />
          </button>
          {showProfile && (
            <div className="dropdown-menu dropdown-profile">
              <div className="dropdown-header">
                <strong>{userName}</strong>
                <small>{user.email || userRole}</small>
              </div>
              <button className="dropdown-item" onClick={() => { alert("Profile page coming soon."); setShowProfile(false); }}>
                <UserRound size={16} strokeWidth={1.8} aria-hidden />
                Profile
              </button>
              <button className="dropdown-item danger" onClick={() => { setShowProfile(false); onLogout(); }}>
                <LogOut size={16} strokeWidth={1.8} aria-hidden />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Topbar;