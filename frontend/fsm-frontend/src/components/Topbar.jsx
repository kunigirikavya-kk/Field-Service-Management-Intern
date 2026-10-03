import { useState, useRef, useEffect, useCallback } from "react";
import { getNotifications, markNotificationRead } from "../services/api";
import { useLocation } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Search, UserRound, Sun, Moon, CheckCheck, ClipboardList, Wrench, CheckCircle2, Info, Clock } from "lucide-react";
import "./Topbar.css";

function Topbar({ onLogout, onMenuToggle }) {

  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const unreadCount = notifications.filter(item => !item.read).length;
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("fieldsyncTheme") === "dark");
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();

  const storedUser = localStorage.getItem("fieldsyncUser");
  let user = null;
  try { user = storedUser ? JSON.parse(storedUser) : null; } catch { user = null; }

  const userName = user?.fullName || "User";
  const userRole = user?.role || "USER";
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("fieldsyncTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const loadNotifications = useCallback(async () => {
    if (!localStorage.getItem("fieldsyncToken")) return;
    setNotificationsLoading(true);
    try {
      const items = await getNotifications();
      setNotifications(Array.isArray(items) ? items : []);
      setNotificationError("");
    } catch (error) {
      setNotificationError(error.message || "Could not load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 30000);
    const onFocus = () => loadNotifications();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadNotifications]);

  async function openNotification(item) {
    if (!item.read) {
      try {
        await markNotificationRead(item.id);
        setNotifications(current => current.map(n => n.id === item.id ? { ...n, read: true } : n));
      } catch (error) {
        setNotificationError(error.message || "Could not mark notification as read.");
      }
    }
    setShowNotif(false);
  }

  async function markAllNotificationsRead() {
    const unread = notifications.filter(item => !item.read);
    for (const item of unread) {
      try { await markNotificationRead(item.id); } catch { /* keep remaining notifications usable */ }
    }
    await loadNotifications();
  }

  function notificationIcon(type) {
    const value = String(type || "INFO").toUpperCase();
    if (value.includes("WORK") || value.includes("ASSIGN")) return <Wrench size={17} />;
    if (value.includes("COMPLETE") || value.includes("SUCCESS")) return <CheckCircle2 size={17} />;
    if (value.includes("SCHEDULE") || value.includes("SLA")) return <Clock size={17} />;
    if (value.includes("REQUEST")) return <ClipboardList size={17} />;
    return <Info size={17} />;
  }

  function notificationTime(value) {
    if (!value) return "Just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
    return date.toLocaleDateString();
  }

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

        {/* Theme */}
        <button
          className="topbar-icon-btn theme-toggle"
          onClick={() => setDarkMode(value => !value)}
          type="button"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? <Sun size={20} strokeWidth={1.8} aria-hidden /> : <Moon size={20} strokeWidth={1.8} aria-hidden />}
        </button>

        {/* Notifications */}
        <div className="topbar-dropdown" ref={notifRef}>
          <button className="topbar-icon-btn notification-trigger" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); if (!showNotif) loadNotifications(); }} type="button" aria-label={`Notifications, ${unreadCount} unread`}>
            <Bell size={20} strokeWidth={1.8} aria-hidden />
            {unreadCount > 0 && <span className="notif-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </button>
          {showNotif && (
            <div className="dropdown-menu dropdown-notif">
              <div className="notification-panel-header">
                <div><strong>Notifications</strong><small>{unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You're all caught up"}</small></div>
                {unreadCount > 0 && <button type="button" className="notification-mark-all" onClick={markAllNotificationsRead}><CheckCheck size={14} /> Mark all read</button>}
              </div>
              <div className="notification-list">
                {notificationsLoading && notifications.length === 0 ? <p className="dropdown-empty">Loading notifications…</p> :
                  notificationError && notifications.length === 0 ? <p className="dropdown-empty notification-error">{notificationError}</p> :
                  notifications.length === 0 ? <div className="notification-empty"><span><Bell size={22} /></span><strong>No notifications yet</strong><p>Updates about requests, assignments and job progress will appear here.</p></div> :
                  notifications.slice(0, 30).map(item => (
                    <button type="button" key={item.id} className={`notification-item ${item.read ? "is-read" : "is-unread"}`} onClick={() => openNotification(item)}>
                      <span className={`notification-item-icon notification-type-${String(item.type || "info").toLowerCase().replace(/[^a-z0-9_-]/g, "")}`}>{notificationIcon(item.type)}</span>
                      <span className="notification-item-copy"><strong>{item.title}</strong><span>{item.message}</span><small>{notificationTime(item.createdAt)}</small></span>
                      {!item.read && <span className="notification-unread-dot" />}
                    </button>
                  ))}
              </div>
              {notifications.length > 30 && <div className="notification-footer">Showing the 30 most recent notifications</div>}
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