import { NavLink } from "react-router-dom";

function Sidebar() {

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: "▦"
        },
        {
            name: "Customers",
            path: "/customers",
            icon: "👥"
        },
        {
            name: "Technicians",
            path: "/technicians",
            icon: "🔧"
        },
        {
            name: "Work Orders",
            path: "/work-orders",
            icon: "📋"
        },
        {
            name: "Schedule",
            path: "/schedule",
            icon: "📅"
        },
        {
            name: "Job Execution",
            path: "/job-execution",
            icon: "⚙️"
        },
        {
            name: "Inventory",
            path: "/inventory",
            icon: "📦"
        },
        {
            name: "Billing",
            path: "/billing",
            icon: "💳"
        },
        {
            name: "Reports",
            path: "/reports",
            icon: "📊"
        }
    ];


    const handleSupport = () => {

        alert(
            "Need Help?\n\n" +
            "For support, please contact the FieldSync administrator."
        );

    };


    return (

        <aside className="sidebar">


            {/* LOGO */}

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


            {/* MENU TITLE */}

            <div className="menu-title">
                MAIN MENU
            </div>


            {/* NAVIGATION */}

            <nav>

                {menuItems.map((item) => (

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


            {/* SUPPORT */}

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