import { useNavigate } from "react-router-dom";

function Dashboard() {

    const navigate = useNavigate();

    const stats = [
        {
            title: "Total Customers",
            value: "248",
            change: "+12%",
            icon: "👥",
            path: "/customers"
        },
        {
            title: "Active Technicians",
            value: "32",
            change: "+4%",
            icon: "🔧",
            path: "/technicians"
        },
        {
            title: "Open Work Orders",
            value: "47",
            change: "-8%",
            icon: "📋",
            path: "/work-orders"
        },
        {
            title: "Monthly Revenue",
            value: "₹8.42L",
            change: "+18%",
            icon: "₹",
            path: "/billing"
        }
    ];

    return (

        <div>

            {/* PAGE HEADING */}

            <div className="page-heading">

                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Here's what's happening with your field operations today.
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={() => navigate("/service-requests/new")}
                >
                    + New Service Request
                </button>

            </div>


            {/* STAT CARDS */}

            <div className="stats-grid">

                {stats.map((stat) => (

                    <div
                        className="stat-card"
                        key={stat.title}
                        onClick={() => navigate(stat.path)}
                        style={{ cursor: "pointer" }}
                    >

                        <div className="stat-top">

                            <div className="stat-icon">
                                {stat.icon}
                            </div>

                            <span className="growth">
                                {stat.change}
                            </span>

                        </div>

                        <h2>
                            {stat.value}
                        </h2>

                        <p>
                            {stat.title}
                        </p>

                    </div>

                ))}

            </div>


            {/* DASHBOARD CONTENT */}

            <div className="dashboard-grid">


                {/* RECENT WORK ORDERS */}

                <div className="panel">

                    <div className="panel-header">

                        <div>

                            <h3>
                                Recent Work Orders
                            </h3>

                            <p>
                                Latest service activities
                            </p>

                        </div>

                        <button
                            onClick={() => navigate("/work-orders")}
                            style={{
                                cursor: "pointer",
                                border: "none",
                                background: "none",
                                color: "#4f46e5",
                                fontWeight: "600"
                            }}
                        >
                            View All
                        </button>

                    </div>


                    <div className="table-container">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Work Order
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Technician
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>


                                <tr
                                    onClick={() => navigate("/work-orders")}
                                    style={{ cursor: "pointer" }}
                                >

                                    <td>
                                        #WO-1024
                                    </td>

                                    <td>
                                        ABC Industries
                                    </td>

                                    <td>
                                        John Smith
                                    </td>

                                    <td>

                                        <span className="status progress">
                                            In Progress
                                        </span>

                                    </td>

                                </tr>


                                <tr
                                    onClick={() => navigate("/work-orders")}
                                    style={{ cursor: "pointer" }}
                                >

                                    <td>
                                        #WO-1023
                                    </td>

                                    <td>
                                        XYZ Technologies
                                    </td>

                                    <td>
                                        Sarah Wilson
                                    </td>

                                    <td>

                                        <span className="status completed">
                                            Completed
                                        </span>

                                    </td>

                                </tr>


                                <tr
                                    onClick={() => navigate("/work-orders")}
                                    style={{ cursor: "pointer" }}
                                >

                                    <td>
                                        #WO-1022
                                    </td>

                                    <td>
                                        Global Systems
                                    </td>

                                    <td>
                                        Mike Johnson
                                    </td>

                                    <td>

                                        <span className="status pending">
                                            Pending
                                        </span>

                                    </td>

                                </tr>


                            </tbody>

                        </table>

                    </div>

                </div>


                {/* TODAY'S SCHEDULE */}

                <div className="panel">

                    <div className="panel-header">

                        <div>

                            <h3>
                                Today's Schedule
                            </h3>

                            <p>
                                Upcoming appointments
                            </p>

                        </div>

                    </div>


                    <div className="schedule-list">


                        <div
                            className="schedule-item"
                            onClick={() => navigate("/schedule")}
                            style={{ cursor: "pointer" }}
                        >

                            <div className="time">
                                09:00
                            </div>

                            <div>

                                <strong>
                                    AC Maintenance
                                </strong>

                                <p>
                                    ABC Industries
                                </p>

                            </div>

                        </div>


                        <div
                            className="schedule-item"
                            onClick={() => navigate("/schedule")}
                            style={{ cursor: "pointer" }}
                        >

                            <div className="time">
                                11:30
                            </div>

                            <div>

                                <strong>
                                    Equipment Repair
                                </strong>

                                <p>
                                    XYZ Technologies
                                </p>

                            </div>

                        </div>


                        <div
                            className="schedule-item"
                            onClick={() => navigate("/schedule")}
                            style={{ cursor: "pointer" }}
                        >

                            <div className="time">
                                14:00
                            </div>

                            <div>

                                <strong>
                                    System Inspection
                                </strong>

                                <p>
                                    Global Systems
                                </p>

                            </div>

                        </div>


                    </div>

                </div>


            </div>

        </div>
    );
}

export default Dashboard;