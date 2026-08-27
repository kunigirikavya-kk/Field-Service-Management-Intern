import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getCustomers,
    getTechnicians,
    getServiceRequests,
    getWorkOrders,
    getSchedules,
    getInventoryParts,
    getInvoices
} from "../services/api";

import "./Dashboard.css";


function Dashboard() {

    const navigate = useNavigate();


    // =========================================
    // STATE
    // =========================================

    const [customers, setCustomers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [serviceRequests, setServiceRequests] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [inventoryParts, setInventoryParts] = useState([]);
    const [invoices, setInvoices] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");


    // =========================================
    // LOAD DASHBOARD DATA
    // =========================================

    useEffect(() => {
        loadDashboardData();
    }, []);


    async function loadDashboardData() {

        try {

            setError("");

            if (
                customers.length === 0 &&
                technicians.length === 0 &&
                workOrders.length === 0
            ) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }


            const [
                customerData,
                technicianData,
                serviceRequestData,
                workOrderData,
                scheduleData,
                inventoryData,
                invoiceData
            ] = await Promise.all([

                getCustomers(),
                getTechnicians(),
                getServiceRequests(),
                getWorkOrders(),
                getSchedules(),
                getInventoryParts(),
                getInvoices()

            ]);


            setCustomers(
                Array.isArray(customerData)
                    ? customerData
                    : []
            );

            setTechnicians(
                Array.isArray(technicianData)
                    ? technicianData
                    : []
            );

            setServiceRequests(
                Array.isArray(serviceRequestData)
                    ? serviceRequestData
                    : []
            );

            setWorkOrders(
                Array.isArray(workOrderData)
                    ? workOrderData
                    : []
            );

            setSchedules(
                Array.isArray(scheduleData)
                    ? scheduleData
                    : []
            );

            setInventoryParts(
                Array.isArray(inventoryData)
                    ? inventoryData
                    : []
            );

            setInvoices(
                Array.isArray(invoiceData)
                    ? invoiceData
                    : []
            );


        } catch (err) {

            console.error(
                "Dashboard loading error:",
                err
            );

            setError(
                "Unable to load dashboard data. Please try again."
            );


        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    }


    // =========================================
    // GENERAL STATISTICS
    // =========================================

    const totalCustomers =
        customers.length;


    const activeTechnicians =
        technicians.filter(technician => {

            const status =
                String(
                    technician.status || ""
                ).toUpperCase();

            return (
                status === "ACTIVE" ||
                status === ""
            );

        }).length;


    const openWorkOrders =
        workOrders.filter(workOrder => {

            const status =
                String(
                    workOrder.status || ""
                ).toUpperCase();

            return (
                status !== "COMPLETED" &&
                status !== "CANCELLED"
            );

        }).length;


    const paidInvoices =
        invoices.filter(invoice => {

            return String(
                invoice.status || ""
            ).toUpperCase() === "PAID";

        });


    const revenue =
        paidInvoices.reduce(
            (total, invoice) => {

                return (
                    total +
                    (
                        Number(
                            invoice.totalAmount || 0
                        ) || 0
                    )
                );

            },
            0
        );


    const unpaidInvoices =
        invoices.filter(invoice => {

            const status =
                String(
                    invoice.status || ""
                ).toUpperCase();

            return (
                status === "UNPAID" ||
                status === "OVERDUE"
            );

        });


    const lowStockItems =
        inventoryParts.filter(part => {

            const quantity =
                Number(
                    part.quantity ??
                    part.stockQuantity ??
                    part.currentStock ??
                    0
                );


            const reorderLevel =
                Number(
                    part.reorderLevel ??
                    part.minimumStock ??
                    0
                );


            return (
                reorderLevel > 0 &&
                quantity <= reorderLevel
            );

        });


    // =========================================
    // TODAY
    // =========================================

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todaysSchedules =
        schedules
            .filter(schedule => {

                const scheduleDate =
                    schedule.scheduledDate ||
                    schedule.date ||
                    schedule.startDate;

                if (!scheduleDate) {
                    return false;
                }

                return String(
                    scheduleDate
                ).startsWith(today);

            })
            .sort((a, b) => {

                const timeA =
                    a.startTime ||
                    a.scheduledTime ||
                    "";

                const timeB =
                    b.startTime ||
                    b.scheduledTime ||
                    "";

                return String(timeA)
                    .localeCompare(
                        String(timeB)
                    );

            });


    // =========================================
    // ACTION REQUIRED
    // =========================================

    const urgentWorkOrders =
        workOrders.filter(order => {

            const priority =
                String(
                    order.priority || ""
                ).toUpperCase();

            const status =
                String(
                    order.status || ""
                ).toUpperCase();

            return (
                (
                    priority === "URGENT" ||
                    priority === "HIGH"
                ) &&
                status !== "COMPLETED" &&
                status !== "CANCELLED"
            );

        });


    const unassignedRequests =
        serviceRequests.filter(request => {

            const technicianId =
                request.technicianId ??
                request.assignedTechnicianId ??
                request.technician?.id;

            return (
                technicianId === null ||
                technicianId === undefined
            );

        });


    // =========================================
    // TECHNICIAN AVAILABILITY
    // =========================================

    const availableTechnicians =
        technicians.filter(technician => {

            const status =
                String(
                    technician.status || ""
                ).toUpperCase();

            return (
                status === "AVAILABLE" ||
                status === "ACTIVE" ||
                status === ""
            );

        });


    const busyTechnicians =
        technicians.filter(technician => {

            const status =
                String(
                    technician.status || ""
                ).toUpperCase();

            return (
                status === "BUSY" ||
                status === "ON_JOB" ||
                status === "IN_PROGRESS"
            );

        });


    const offlineTechnicians =
        technicians.filter(technician => {

            const status =
                String(
                    technician.status || ""
                ).toUpperCase();

            return (
                status === "OFFLINE" ||
                status === "INACTIVE"
            );

        });


    const scheduledTechnicians =
        technicians.filter(technician => {

            const status =
                String(
                    technician.status || ""
                ).toUpperCase();

            return status === "SCHEDULED";

        });


    // =========================================
    // RECENT SERVICE ACTIVITY
    // =========================================

    const recentServiceRequests =
        [...serviceRequests]
            .sort((a, b) => {

                const dateA =
                    new Date(
                        a.createdAt ||
                        a.createdDate ||
                        0
                    );

                const dateB =
                    new Date(
                        b.createdAt ||
                        b.createdDate ||
                        0
                    );

                return dateB - dateA;

            })
            .slice(0, 5);


    // =========================================
    // RECENT WORK ORDERS
    // =========================================

    const recentWorkOrders =
        [...workOrders]
            .sort((a, b) => {

                const dateA =
                    new Date(
                        a.createdAt ||
                        a.createdDate ||
                        0
                    );

                const dateB =
                    new Date(
                        b.createdAt ||
                        b.createdDate ||
                        0
                    );

                return dateB - dateA;

            })
            .slice(0, 5);


    // =========================================
    // FORMAT MONEY
    // =========================================

    function formatMoney(amount) {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(
            Number(amount) || 0
        );

    }


    // =========================================
    // FORMAT DATE
    // =========================================

    function formatDate(date) {

        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "-";
        }

        return parsedDate.toLocaleDateString(
            "en-IN"
        );

    }


    // =========================================
    // STATUS CLASS
    // =========================================

    function getStatusClass(status) {

        const normalized =
            String(
                status || ""
            ).toUpperCase();


        switch (normalized) {

            case "COMPLETED":
                return "status-completed";

            case "IN_PROGRESS":
                return "status-progress";

            case "PENDING":
                return "status-pending";

            case "OPEN":
                return "status-open";

            case "CANCELLED":
                return "status-cancelled";

            case "NEW":
                return "status-new";

            case "ASSIGNED":
                return "status-assigned";

            default:
                return "status-default";

        }

    }


    // =========================================
    // TECHNICIAN NAME
    // =========================================

    function getTechnicianName(technician) {

        return (
            technician.fullName ||
            technician.name ||
            technician.username ||
            technician.email ||
            "Technician"
        );

    }


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <div className="dashboard-loading">

                <div className="dashboard-spinner"></div>

                <h2>
                    Loading FieldSync...
                </h2>

                <p>
                    Preparing your operations center.
                </p>

            </div>

        );

    }


    // =========================================
    // UI
    // =========================================

    return (

        <div className="dashboard-page">


            {/* =====================================
                HEADER
            ===================================== */}

            <div className="dashboard-header">

                <div>

                    <span className="dashboard-eyebrow">
                        FIELDSYNC OPERATIONS
                    </span>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Everything your field team needs
                        to stay on top of today's operations.
                    </p>

                </div>


                <div className="dashboard-header-actions">

                    <button
                        className="refresh-button"
                        onClick={loadDashboardData}
                        disabled={refreshing}
                    >

                        {refreshing
                            ? "Refreshing..."
                            : "↻ Refresh"}

                    </button>


                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                "/service-requests/new"
                            )
                        }
                    >
                        + New Service Request
                    </button>

                </div>

            </div>


            {/* =====================================
                ERROR
            ===================================== */}

            {error && (

                <div className="dashboard-error">

                    <span>
                        ⚠️
                    </span>

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={loadDashboardData}
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =====================================
                MAIN STAT CARDS
            ===================================== */}

            <div className="stats-grid">


                <div
                    className="stat-card"
                    onClick={() =>
                        navigate("/customers")
                    }
                >

                    <div className="stat-top">

                        <div className="stat-icon customers-icon">
                            👥
                        </div>

                        <span className="stat-arrow">
                            →
                        </span>

                    </div>

                    <h2>
                        {totalCustomers}
                    </h2>

                    <p>
                        Total Customers
                    </p>

                </div>


                <div
                    className="stat-card"
                    onClick={() =>
                        navigate("/technicians")
                    }
                >

                    <div className="stat-top">

                        <div className="stat-icon technicians-icon">
                            🔧
                        </div>

                        <span className="stat-arrow">
                            →
                        </span>

                    </div>

                    <h2>
                        {activeTechnicians}
                    </h2>

                    <p>
                        Active Technicians
                    </p>

                </div>


                <div
                    className="stat-card"
                    onClick={() =>
                        navigate("/work-orders")
                    }
                >

                    <div className="stat-top">

                        <div className="stat-icon workorders-icon">
                            📋
                        </div>

                        <span className="stat-arrow">
                            →
                        </span>

                    </div>

                    <h2>
                        {openWorkOrders}
                    </h2>

                    <p>
                        Open Work Orders
                    </p>

                </div>


                <div
                    className="stat-card"
                    onClick={() =>
                        navigate("/billing")
                    }
                >

                    <div className="stat-top">

                        <div className="stat-icon revenue-icon">
                            ₹
                        </div>

                        <span className="stat-arrow">
                            →
                        </span>

                    </div>

                    <h2>
                        {formatMoney(revenue)}
                    </h2>

                    <p>
                        Paid Invoice Revenue
                    </p>

                </div>

            </div>


            {/* =====================================
                ACTION REQUIRED
            ===================================== */}

            <section className="dashboard-section">


                <div className="section-title">

                    <div>

                        <span className="section-eyebrow">
                            ATTENTION NEEDED
                        </span>

                        <h2>
                            Action Required
                        </h2>

                        <p>
                            Items that may need your attention.
                        </p>

                    </div>

                </div>


                <div className="action-grid">


                    <div
                        className="action-card urgent"
                        onClick={() =>
                            navigate("/work-orders")
                        }
                    >

                        <div className="action-icon">
                            🚨
                        </div>

                        <div className="action-content">

                            <strong>
                                {urgentWorkOrders.length}
                            </strong>

                            <span>
                                High Priority Jobs
                            </span>

                            <small>
                                Require attention
                            </small>

                        </div>

                        <span className="action-arrow">
                            →
                        </span>

                    </div>


                    <div
                        className="action-card unpaid"
                        onClick={() =>
                            navigate("/billing")
                        }
                    >

                        <div className="action-icon">
                            💰
                        </div>

                        <div className="action-content">

                            <strong>
                                {unpaidInvoices.length}
                            </strong>

                            <span>
                                Unpaid Invoices
                            </span>

                            <small>
                                Payment follow-up
                            </small>

                        </div>

                        <span className="action-arrow">
                            →
                        </span>

                    </div>


                    <div
                        className="action-card stock"
                        onClick={() =>
                            navigate("/inventory")
                        }
                    >

                        <div className="action-icon">
                            📦
                        </div>

                        <div className="action-content">

                            <strong>
                                {lowStockItems.length}
                            </strong>

                            <span>
                                Low Stock Parts
                            </span>

                            <small>
                                Check inventory
                            </small>

                        </div>

                        <span className="action-arrow">
                            →
                        </span>

                    </div>


                    <div
                        className="action-card requests"
                        onClick={() =>
                            navigate(
                                "/service-requests"
                            )
                        }
                    >

                        <div className="action-icon">
                            📥
                        </div>

                        <div className="action-content">

                            <strong>
                                {unassignedRequests.length}
                            </strong>

                            <span>
                                Unassigned Requests
                            </span>

                            <small>
                                Assign a technician
                            </small>

                        </div>

                        <span className="action-arrow">
                            →
                        </span>

                    </div>

                </div>

            </section>


            {/* =====================================
                TODAY'S FIELD ACTIVITY
            ===================================== */}

            <div className="dashboard-two-column">


                <section className="dashboard-panel">

                    <div className="panel-header">

                        <div>

                            <span className="panel-eyebrow">
                                TODAY
                            </span>

                            <h3>
                                Today's Field Activity
                            </h3>

                            <p>
                                Scheduled jobs and appointments.
                            </p>

                        </div>


                        <button
                            className="view-all-button"
                            onClick={() =>
                                navigate("/schedule")
                            }
                        >
                            View Schedule →
                        </button>

                    </div>


                    {todaysSchedules.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                📅
                            </div>

                            <strong>
                                No jobs scheduled today
                            </strong>

                            <p>
                                Your field team has no
                                appointments scheduled.
                            </p>

                        </div>

                    ) : (

                        <div className="activity-list">

                            {todaysSchedules
                                .slice(0, 6)
                                .map(schedule => (

                                    <div
                                        className="activity-item"
                                        key={schedule.id}
                                        onClick={() =>
                                            navigate(
                                                "/schedule"
                                            )
                                        }
                                    >

                                        <div className="activity-time">

                                            {schedule.startTime ||
                                                schedule.scheduledTime ||
                                                "--:--"}

                                        </div>


                                        <div className="activity-line"></div>


                                        <div className="activity-details">

                                            <strong>

                                                {schedule.title ||
                                                    schedule.description ||
                                                    "Scheduled Service"}

                                            </strong>


                                            <p>

                                                {schedule.customerName ||
                                                    schedule.customer?.name ||
                                                    `Work Order #${
                                                        schedule.workOrderId ||
                                                        "-"
                                                    }`}

                                            </p>

                                        </div>


                                        <span className="activity-arrow">
                                            →
                                        </span>

                                    </div>

                                ))}

                        </div>

                    )}

                </section>


                {/* =====================================
                    TECHNICIAN AVAILABILITY
                ===================================== */}

                <section className="dashboard-panel">

                    <div className="panel-header">

                        <div>

                            <span className="panel-eyebrow">
                                FIELD TEAM
                            </span>

                            <h3>
                                Technician Availability
                            </h3>

                            <p>
                                Current technician status.
                            </p>

                        </div>


                        <button
                            className="view-all-button"
                            onClick={() =>
                                navigate("/technicians")
                            }
                        >
                            View Team →
                        </button>

                    </div>


                    <div className="technician-summary">

                        <div className="tech-summary-item">

                            <span className="tech-status-dot available"></span>

                            <div>
                                <strong>
                                    {availableTechnicians.length}
                                </strong>

                                <span>
                                    Available
                                </span>
                            </div>

                        </div>


                        <div className="tech-summary-item">

                            <span className="tech-status-dot busy"></span>

                            <div>
                                <strong>
                                    {busyTechnicians.length}
                                </strong>

                                <span>
                                    On Job
                                </span>
                            </div>

                        </div>


                        <div className="tech-summary-item">

                            <span className="tech-status-dot scheduled"></span>

                            <div>
                                <strong>
                                    {scheduledTechnicians.length}
                                </strong>

                                <span>
                                    Scheduled
                                </span>
                            </div>

                        </div>


                        <div className="tech-summary-item">

                            <span className="tech-status-dot offline"></span>

                            <div>
                                <strong>
                                    {offlineTechnicians.length}
                                </strong>

                                <span>
                                    Offline
                                </span>
                            </div>

                        </div>

                    </div>


                    <div className="technician-list">

                        {technicians.length === 0 ? (

                            <div className="small-empty">
                                No technicians available.
                            </div>

                        ) : (

                            technicians
                                .slice(0, 5)
                                .map(technician => {

                                    const status =
                                        String(
                                            technician.status || "ACTIVE"
                                        ).toUpperCase();


                                    let statusClass =
                                        "available";


                                    if (
                                        status === "BUSY" ||
                                        status === "ON_JOB" ||
                                        status === "IN_PROGRESS"
                                    ) {
                                        statusClass = "busy";
                                    }

                                    if (
                                        status === "SCHEDULED"
                                    ) {
                                        statusClass = "scheduled";
                                    }

                                    if (
                                        status === "OFFLINE" ||
                                        status === "INACTIVE"
                                    ) {
                                        statusClass = "offline";
                                    }


                                    return (

                                        <div
                                            className="technician-item"
                                            key={technician.id}
                                        >

                                            <div className="technician-avatar">

                                                {String(
                                                    getTechnicianName(
                                                        technician
                                                    )
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}

                                            </div>


                                            <div className="technician-info">

                                                <strong>
                                                    {getTechnicianName(
                                                        technician
                                                    )}
                                                </strong>

                                                <span>
                                                    {technician.specialization ||
                                                        technician.skill ||
                                                        "Field Technician"}
                                                </span>

                                            </div>


                                            <span
                                                className={`technician-status ${statusClass}`}
                                            >

                                                {status === "ON_JOB"
                                                    ? "On Job"
                                                    : status === "IN_PROGRESS"
                                                        ? "On Job"
                                                        : status === "ACTIVE"
                                                            ? "Available"
                                                            : status.replace(
                                                                /_/g,
                                                                " "
                                                            )}

                                            </span>

                                        </div>

                                    );

                                })

                        )}

                    </div>

                </section>

            </div>


            {/* =====================================
                RECENT SERVICE ACTIVITY
            ===================================== */}

            <section className="dashboard-section recent-section">


                <div className="section-title">

                    <div>

                        <span className="section-eyebrow">
                            LATEST ACTIVITY
                        </span>

                        <h2>
                            Recent Service Activity
                        </h2>

                        <p>
                            Latest requests and work orders
                            flowing through FieldSync.
                        </p>

                    </div>


                    <div className="recent-actions">

                        <button
                            className="view-all-button"
                            onClick={() =>
                                navigate(
                                    "/service-requests"
                                )
                            }
                        >
                            Service Requests →
                        </button>

                        <button
                            className="view-all-button"
                            onClick={() =>
                                navigate(
                                    "/work-orders"
                                )
                            }
                        >
                            Work Orders →
                        </button>

                    </div>

                </div>


                <div className="recent-grid">


                    {/* SERVICE REQUESTS */}

                    <div className="recent-card">

                        <div className="recent-card-header">

                            <div className="recent-card-icon request-icon">
                                📥
                            </div>

                            <div>

                                <h4>
                                    Latest Requests
                                </h4>

                                <span>
                                    {serviceRequests.length}
                                    {" "}
                                    total requests
                                </span>

                            </div>

                        </div>


                        {recentServiceRequests.length === 0 ? (

                            <div className="small-empty">
                                No service requests available.
                            </div>

                        ) : (

                            <div className="recent-list">

                                {recentServiceRequests.map(
                                    request => (

                                        <div
                                            className="recent-list-item"
                                            key={request.id}
                                            onClick={() =>
                                                navigate(
                                                    "/service-requests"
                                                )
                                            }
                                        >

                                            <div>

                                                <strong>

                                                    {request.requestNumber ||
                                                        request.serviceRequestNumber ||
                                                        `SR-${String(
                                                            request.id
                                                        ).padStart(
                                                            4,
                                                            "0"
                                                        )}`}

                                                </strong>

                                                <span>

                                                    {request.description ||
                                                        request.title ||
                                                        "Service Request"}

                                                </span>

                                            </div>


                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    request.status
                                                )}`}
                                            >

                                                {String(
                                                    request.status ||
                                                    "NEW"
                                                ).replace(
                                                    /_/g,
                                                    " "
                                                )}

                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>


                    {/* WORK ORDERS */}

                    <div className="recent-card">

                        <div className="recent-card-header">

                            <div className="recent-card-icon work-icon">
                                📋
                            </div>

                            <div>

                                <h4>
                                    Latest Work Orders
                                </h4>

                                <span>
                                    {workOrders.length}
                                    {" "}
                                    total orders
                                </span>

                            </div>

                        </div>


                        {recentWorkOrders.length === 0 ? (

                            <div className="small-empty">
                                No work orders available.
                            </div>

                        ) : (

                            <div className="recent-list">

                                {recentWorkOrders.map(
                                    order => (

                                        <div
                                            className="recent-list-item"
                                            key={order.id}
                                            onClick={() =>
                                                navigate(
                                                    "/work-orders"
                                                )
                                            }
                                        >

                                            <div>

                                                <strong>

                                                    {order.orderNumber ||
                                                        `WO-${String(
                                                            order.id
                                                        ).padStart(
                                                            4,
                                                            "0"
                                                        )}`}

                                                </strong>

                                                <span>

                                                    {order.description ||
                                                        "Service Work Order"}

                                                </span>

                                            </div>


                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    order.status
                                                )}`}
                                            >

                                                {String(
                                                    order.status ||
                                                    "UNKNOWN"
                                                ).replace(
                                                    /_/g,
                                                    " "
                                                )}

                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </div>

            </section>


            {/* =====================================
                QUICK ACTIONS
            ===================================== */}

            <section className="quick-actions-section">

                <div>

                    <span className="section-eyebrow">
                        QUICK ACTIONS
                    </span>

                    <h3>
                        What would you like to do?
                    </h3>

                </div>


                <div className="quick-actions">

                    <button
                        onClick={() =>
                            navigate(
                                "/service-requests/new"
                            )
                        }
                    >
                        <span>＋</span>
                        New Service Request
                    </button>


                    <button
                        onClick={() =>
                            navigate("/work-orders")
                        }
                    >
                        <span>📋</span>
                        Manage Work Orders
                    </button>


                    <button
                        onClick={() =>
                            navigate("/schedule")
                        }
                    >
                        <span>📅</span>
                        Manage Schedule
                    </button>


                    <button
                        onClick={() =>
                            navigate("/inventory")
                        }
                    >
                        <span>📦</span>
                        Check Inventory
                    </button>

                </div>

            </section>


        </div>

    );

}


export default Dashboard;