
import { NavLink } from "react-router-dom";
import {
  CalendarClock,
  ChartNoAxesCombined,
  ClipboardCheck,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  Lock,
  LogOut,
  Package,
  PlayCircle,
  Receipt,
  UsersRound,
  Wrench,
  X
} from "lucide-react";
import "./Sidebar.css";

function Sidebar({ isOpen, onClose, onLogout }) {

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
      icon: "dashboard",
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
      icon: "customers",
      roles: [
        "DISPATCHER",
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Technicians",
      path: "/technicians",
      icon: "technicians",
      roles: [
        "DISPATCHER",
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Service Requests",
      path: "/service-requests/new",
      icon: "requests",
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
      icon: "workOrders",
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
      icon: "schedule",
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
      icon: "execution",
      roles: [
        "TECHNICIAN",
        "ADMIN"
      ]
    },

    {
      name: "Inventory",
      path: "/inventory",
      icon: "inventory",
      roles: [
        "TECHNICIAN",
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Billing",
      path: "/billing",
      icon: "billing",
      roles: [
        "MANAGER",
        "ADMIN"
      ]
    },

    {
      name: "Reports",
      path: "/reports",
      icon: "reports",
      roles: [
        "MANAGER",
        "ADMIN"
      ]
    }
  ];


  // =====================================================
  // ICONS
  // =====================================================

  const iconProps = { size: 20, strokeWidth: 1.8, 'aria-hidden': true };
  const icons = {
    dashboard: <LayoutDashboard {...iconProps} />,
    customers: <UsersRound {...iconProps} />,
    technicians: <Wrench {...iconProps} />,
    requests: <ClipboardList {...iconProps} />,
    workOrders: <ClipboardCheck {...iconProps} />,
    schedule: <CalendarClock {...iconProps} />,
    execution: <PlayCircle {...iconProps} />,
    inventory: <Package {...iconProps} />,
    billing: <Receipt {...iconProps} />,
    reports: <ChartNoAxesCombined {...iconProps} />,
    help: <HelpCircle {...iconProps} />,
    close: <X {...iconProps} />,
    lock: <Lock {...iconProps} />,
    logout: <LogOut size={18} strokeWidth={1.8} aria-hidden />
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

        <button
          className="sidebar-logout"
          onClick={onLogout}
          type="button"
        >
          {icons.logout}
          Sign out
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;

