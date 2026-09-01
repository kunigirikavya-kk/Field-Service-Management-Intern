
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isOpen, onClose }) {

  const storedUser = localStorage.getItem("fieldsyncUser");

  let currentUser = null;

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    currentUser = null;
  }

  const userRole = currentUser?.role
    ? String(currentUser.role).toUpperCase()
    : "CUSTOMER";


  // =====================================================
  // ROLE BASED MENU ACCESS
  // =====================================================

  const menuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "grid",
      roles: [
        "CUSTOMER",
        "DISPATCHER",
        "TECHNICIAN",
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Customers",
      path: "/customers",
      icon: "users",
      roles: [
        "DISPATCHER",
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Technicians",
      path: "/technicians",
      icon: "tool",
      roles: [
        "DISPATCHER",
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Service Requests",
      path: "/service-requests/new",
      icon: "file",
      roles: [
        "CUSTOMER",
        "DISPATCHER",
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Work Orders",
      path: "/work-orders",
      icon: "clipboard",
      roles: [
        "CUSTOMER",
        "DISPATCHER",
        "TECHNICIAN",
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Schedule",
      path: "/schedule",
      icon: "calendar",
      roles: [
        "DISPATCHER",
        "TECHNICIAN",
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Job Execution",
      path: "/job-execution",
      icon: "play",
      roles: [
        "TECHNICIAN",
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Inventory",
      path: "/inventory",
      icon: "box",
      roles: [
        "TECHNICIAN",
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Billing",
      path: "/billing",
      icon: "credit",
      roles: [
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Reports",
      path: "/reports",
      icon: "chart",
      roles: [
        "MANAGER",
        "ADMIN"
      ]
    }
  ];


  // =====================================================
  // ICONS
  // =====================================================

  const icons = {

    grid: (
      <svg width="20" height="20" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),

    users: (
      <svg width="20" height="20" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),

    tool: (
      <svg width="20" height="20" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),

    file: (
      <svg width="20" height="20" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),

    clipboard: (
      <svg width="20" height="20" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
      </svg>
    ),

    calendar: (
      <svg width="20" height="20" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),

    play: (
      <svg width="20" height="20" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),

    box: (
      <svg width="20" height="20" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),

    credit: (
      <svg width="20" height="20" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),

    chart: (
      <svg width="20" height="20" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),

    help: (
      <svg width="20" height="20" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),

    close: (
      <svg width="20" height="20" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),

    lock: (
      <svg width="16" height="16" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    )
  };


  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>

      {/* HEADER */}

      <div className="sidebar-header">

        <div className="sidebar-logo">

          <div className="logo-icon">
            FS
          </div>

          <div className="logo-text">
            <h2>FieldSync</h2>
            <span>Service Management</span>
          </div>

        </div>

        <button
          className="sidebar-close"
          onClick={onClose}
          type="button"
        >
          {icons.close}
        </button>

      </div>


      {/* CURRENT ROLE */}

      <div className="sidebar-user-role">

        <span className="role-label">
          CURRENT ROLE
        </span>

        <span className="role-value">
          {userRole}
        </span>

      </div>


      {/* MENU LABEL */}

      <div className="sidebar-label">
        MAIN MENU
      </div>


      {/* NAVIGATION */}

      <nav className="sidebar-nav">

        {menuItems.map(item => {

          const hasAccess =
            item.roles.includes(userRole);


          if (hasAccess) {

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >

                <span className="sidebar-icon">
                  {icons[item.icon]}
                </span>

                <span className="sidebar-link-name">
                  {item.name}
                </span>

              </NavLink>
            );

          }


          return (
            <div
              key={item.path}
              className="sidebar-link sidebar-link-locked"
              title={`Access restricted for ${userRole}`}
              aria-disabled="true"
            >

              <span className="sidebar-icon">
                {icons[item.icon]}
              </span>

              <span className="sidebar-link-name">
                {item.name}
              </span>

              <span className="sidebar-lock">
                {icons.lock}
              </span>

            </div>
          );

        })}

      </nav>


      {/* FOOTER */}

      <div className="sidebar-footer">

        <button
          className="sidebar-help"
          onClick={() =>
            alert(
              "Contact your FieldSync administrator for support."
            )
          }
          type="button"
        >

          <span className="sidebar-icon">
            {icons.help}
          </span>

          <div>
            <strong>Need Help?</strong>
            <small>Contact support</small>
          </div>

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;

