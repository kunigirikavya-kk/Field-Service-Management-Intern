import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div>
          <h1 className="topbar-title">{pageTitle}</h1>
          <p className="topbar-subtitle">Manage your field operations efficiently</p>
        </div>
      </div>

      <div className="topbar-right">

        {/* Search */}
        <div className="topbar-search">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search..." />
        </div>

        {/* Notifications */}
        <div className="topbar-dropdown" ref={notifRef}>
          <button className="topbar-icon-btn" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }} type="button">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
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
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {showProfile && (
            <div className="dropdown-menu dropdown-profile">
              <div className="dropdown-header">
                <strong>{userName}</strong>
                <small>{user.email || userRole}</small>
              </div>
              <button className="dropdown-item" onClick={() => { alert("Profile page coming soon."); setShowProfile(false); }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
              </button>
              <button className="dropdown-item danger" onClick={() => { setShowProfile(false); onLogout(); }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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