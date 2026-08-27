import { NavLink } from "react-router-dom";

function Sidebar() {

    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    const storedUser =
        localStorage.getItem("fieldsyncUser");

    let currentUser = null;

    try {

        currentUser =
            storedUser
                ? JSON.parse(storedUser)
                : null;

    } catch (error) {

        console.error(
            "Unable to read FieldSync user:",
            error
        );

        currentUser = null;
    }


    // =====================================================
    // GET USER ROLE
    // =====================================================

    const userRole =
        currentUser?.role
            ? currentUser.role.toUpperCase()
            : "CUSTOMER";


    // =====================================================
    // ALL MENU ITEMS
    // =====================================================

    const menuItems = [

        {
            name: "Dashboard",
            path: "/dashboard",
            icon: "▦",
            roles: [
                "CUSTOMER",
                "DISPATCHER",
                "TECHNICIAN",
                "MANAGER"
            ]
        },

        {
            name: "Customers",
            path: "/customers",
            icon: "👥",
            roles: [
                "DISPATCHER",
                "MANAGER"
            ]
        },

        {
            name: "Technicians",
            path: "/technicians",
            icon: "🔧",
            roles: [
                "DISPATCHER",
                "MANAGER"
            ]
        },

        {
            name: "Service Requests",
            path: "/service-requests/new",
            icon: "📝",
            roles: [
                "CUSTOMER",
                "DISPATCHER",
                "MANAGER"
            ]
        },

        {
            name: "Work Orders",
            path: "/work-orders",
            icon: "📋",
            roles: [
                "CUSTOMER",
                "DISPATCHER",
                "TECHNICIAN",
                "MANAGER"
            ]
        },

        {
            name: "Schedule",
            path: "/schedule",
            icon: "📅",
            roles: [
                "DISPATCHER",
                "TECHNICIAN",
                "MANAGER"
            ]
        },

        {
            name: "Job Execution",
            path: "/job-execution",
            icon: "⚙️",
            roles: [
                "DISPATCHER",
                "TECHNICIAN",
                "MANAGER"
            ]
        },

        {
            name: "Inventory",
            path: "/inventory",
            icon: "📦",
            roles: [
                "TECHNICIAN",
                "MANAGER"
            ]
        },

        {
            name: "Billing",
            path: "/billing",
            icon: "💳",
            roles: [
                "MANAGER"
            ]
        },

        {
            name: "Reports",
            path: "/reports",
            icon: "📊",
            roles: [
                "MANAGER"
            ]
        }
    ];


    // =====================================================
    // FILTER MENU BY ROLE
    // =====================================================

    const visibleMenuItems =
        menuItems.filter(
            (item) =>
                item.roles.includes(userRole)
        );


    // =====================================================
    // SUPPORT
    // =====================================================

    const handleSupport = () => {

        alert(
            "Need Help?\n\n" +
            "For support, please contact the FieldSync administrator."
        );

    };


    // =====================================================
    // SIDEBAR
    // =====================================================

    return (

        <aside className="sidebar">


            {/* =================================================
                LOGO
            ================================================= */}

            <div className="logo">

                <div className="logo-icon">
                    FS
                </div>

                <div>

                    <h2>
                        FieldSync
                    </h2>

                    <span>
                        Service Management
                    </span>

                </div>

            </div>


            {/* =================================================
                MENU TITLE
            ================================================= */}

            <div className="menu-title">
                MAIN MENU
            </div>


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav>

                {visibleMenuItems.map((item) => (

                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive
                                ? "menu-item active"
                                : "menu-item"
                        }
                    >

                        <span className="menu-icon">
                            {item.icon}
                        </span>

                        <span>
                            {item.name}
                        </span>

                    </NavLink>

                ))}

            </nav>


            {/* =================================================
                SUPPORT
            ================================================= */}

            <div className="sidebar-bottom">

                <button
                    className="support-box"
                    onClick={handleSupport}
                    type="button"
                    style={{
                        width: "100%",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer"
                    }}
                >

                    <div className="support-icon">
                        ?
                    </div>

                    <div>

                        <strong>
                            Need Help?
                        </strong>

                        <p>
                            Contact support
                        </p>

                    </div>

                </button>

            </div>


        </aside>
    );
}

export default Sidebar;