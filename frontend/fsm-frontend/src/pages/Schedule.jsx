
import { useEffect, useState } from "react";

import {
    getSchedules,
    createSchedule,
    deleteSchedule,
    getWorkOrders,
    getWorkOrdersByTechnician,
    getTechnicians,
    getTechnicianByUserId
} from "../services/api";

import "./Schedule.css";


function Schedule() {

    // =====================================================
    // STATE
    // =====================================================

    const [schedules, setSchedules] = useState([]);

    const [workOrders, setWorkOrders] =
        useState([]);

    const [technicians, setTechnicians] =
        useState([]);

    const [user, setUser] =
        useState(null);

    const [currentTechnician, setCurrentTechnician] =
        useState(null);

    const [role, setRole] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    const [form, setForm] = useState({

        workOrderId: "",

        technicianId: "",

        scheduledDate: "",

        startTime: "",

        endTime: "",

        status: "SCHEDULED",

        notes: ""

    });


    // =====================================================
    // ROLE CHECKS
    // =====================================================

    const isTechnician =
        role === "TECHNICIAN";

    const isDispatcher =
        role === "DISPATCHER";

    const isManager =
        role === "MANAGER";

    const canManageSchedules =
        isDispatcher ||
        isManager;


    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {

        loadData();

    }, []);


    async function loadData() {

        try {

            setLoading(true);

            setError("");

            setSuccess("");


            // =================================================
            // GET LOGGED-IN USER
            // =================================================

            const storedUser =
                localStorage.getItem(
                    "fieldsyncUser"
                );


            if (!storedUser) {

                throw new Error(
                    "User session not found. Please login again."
                );

            }


            const loggedInUser =
                JSON.parse(
                    storedUser
                );


            const currentRole =
                String(
                    loggedInUser.role || ""
                ).toUpperCase();


            setUser(
                loggedInUser
            );

            setRole(
                currentRole
            );


            console.log(
                "👤 SCHEDULE USER:",
                loggedInUser
            );

            console.log(
                "🔐 SCHEDULE ROLE:",
                currentRole
            );


            // =================================================
            // TECHNICIAN
            // =================================================

            if (
                currentRole === "TECHNICIAN"
            ) {

                // -------------------------------------------------
                // FIND TECHNICIAN RECORD USING USER ID
                // -------------------------------------------------

                const userId =
                    loggedInUser.id;


                if (!userId) {

                    throw new Error(
                        "Logged-in user ID is missing."
                    );

                }


                console.log(
                    "🔎 Finding technician for user ID:",
                    userId
                );


                const technician =
                    await getTechnicianByUserId(
                        userId
                    );


                console.log(
                    "🔧 CURRENT TECHNICIAN:",
                    technician
                );


                if (!technician?.id) {

                    throw new Error(
                        "Technician profile could not be found for the logged-in user."
                    );

                }


                setCurrentTechnician(
                    technician
                );


                // -------------------------------------------------
                // LOAD ONLY THIS TECHNICIAN'S SCHEDULES
                // -------------------------------------------------

                const technicianSchedules =
                    await getSchedulesByTechnicianSafe(
                        technician.id
                    );


                console.log(
                    "📅 MY SCHEDULES:",
                    technicianSchedules
                );


                setSchedules(
                    Array.isArray(
                        technicianSchedules
                    )
                        ? technicianSchedules
                        : []
                );


                // -------------------------------------------------
                // LOAD ONLY THIS TECHNICIAN'S WORK ORDERS
                // -------------------------------------------------

                const technicianWorkOrders =
                    await getWorkOrdersByTechnician(
                        technician.id
                    );


                console.log(
                    "📋 MY WORK ORDERS:",
                    technicianWorkOrders
                );


                setWorkOrders(
                    Array.isArray(
                        technicianWorkOrders
                    )
                        ? technicianWorkOrders
                        : []
                );


                // -------------------------------------------------
                // DO NOT LOAD ALL TECHNICIANS
                // -------------------------------------------------

                setTechnicians([]);

                return;
            }


            // =================================================
            // DISPATCHER / MANAGER
            // =================================================

            if (
                currentRole === "DISPATCHER" ||
                currentRole === "MANAGER"
            ) {

                // -------------------------------------------------
                // LOAD ALL SCHEDULES
                // -------------------------------------------------

                const schedulesData =
                    await getSchedules();


                console.log(
                    "📅 ALL SCHEDULES:",
                    schedulesData
                );


                setSchedules(
                    Array.isArray(
                        schedulesData
                    )
                        ? schedulesData
                        : []
                );


                // -------------------------------------------------
                // LOAD ALL TECHNICIANS
                // -------------------------------------------------

                const techniciansData =
                    await getTechnicians();


                console.log(
                    "🔧 ALL TECHNICIANS:",
                    techniciansData
                );


                setTechnicians(
                    Array.isArray(
                        techniciansData
                    )
                        ? techniciansData
                        : []
                );


                // -------------------------------------------------
                // LOAD ALL WORK ORDERS
                // -------------------------------------------------

                const workOrdersData =
                    await getWorkOrders();


                console.log(
                    "📋 ALL WORK ORDERS:",
                    workOrdersData
                );


                setWorkOrders(
                    Array.isArray(
                        workOrdersData
                    )
                        ? workOrdersData
                        : []
                );

                return;
            }


            // =================================================
            // UNKNOWN ROLE
            // =================================================

            throw new Error(
                "Your account does not have a valid schedule role."
            );


        } catch (err) {

            console.error(
                "❌ Schedule loading error:",
                err
            );


            handleAuthenticationError(
                err
            );


        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // SAFE TECHNICIAN SCHEDULE LOAD
    // =====================================================

    async function getSchedulesByTechnicianSafe(
        technicianId
    ) {

        return await import(
            "../services/api"
        ).then(
            api =>
                api.getSchedulesByTechnician(
                    technicianId
                )
        );

    }


    // =====================================================
    // AUTH ERROR
    // =====================================================

    function handleAuthenticationError(
        err
    ) {

        if (
            err?.message?.includes(
                "HTTP 401"
            )
        ) {

            localStorage.removeItem(
                "fieldsyncToken"
            );

            localStorage.removeItem(
                "fieldsyncAuthenticated"
            );

            localStorage.removeItem(
                "fieldsyncUser"
            );

            window.location.href =
                "/login";

            return;

        }


        setError(
            err?.message ||
            "Failed to load schedule data."
        );

    }


    // =====================================================
    // FORM INPUT
    // =====================================================

    function handleChange(e) {

        const {
            name,
            value
        } = e.target;


        setForm(
            previousForm => ({

                ...previousForm,

                [name]: value

            })
        );

    }


    // =====================================================
    // CREATE SCHEDULE
    // =====================================================

    async function handleSubmit(e) {

        e.preventDefault();


        setError("");

        setSuccess("");


        if (!canManageSchedules) {

            setError(
                "You do not have permission to create schedules."
            );

            return;

        }


        // -------------------------------------------------
        // WORK ORDER
        // -------------------------------------------------

        if (!form.workOrderId) {

            setError(
                "Please select a work order."
            );

            return;

        }


        // -------------------------------------------------
        // TECHNICIAN
        // -------------------------------------------------

        if (!form.technicianId) {

            setError(
                "Please select a technician."
            );

            return;

        }


        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        if (!form.scheduledDate) {

            setError(
                "Please select a scheduled date."
            );

            return;

        }


        // -------------------------------------------------
        // TIME
        // -------------------------------------------------

        if (
            !form.startTime ||
            !form.endTime
        ) {

            setError(
                "Please select start and end time."
            );

            return;

        }


        if (
            form.startTime >=
            form.endTime
        ) {

            setError(
                "End time must be after start time."
            );

            return;

        }


        // -------------------------------------------------
        // CHECK SELECTED TECHNICIAN
        // -------------------------------------------------

        const selectedTechnician =
            technicians.find(
                technician =>
                    Number(
                        technician.id
                    ) ===
                    Number(
                        form.technicianId
                    )
            );


        if (!selectedTechnician) {

            setError(
                "Selected technician was not found."
            );

            return;

        }


        if (
            String(
                selectedTechnician.status ||
                ""
            ).toUpperCase() !==
            "AVAILABLE"
        ) {

            setError(
                "Selected technician is not available."
            );

            return;

        }


        try {

            setSaving(true);


            const scheduleData = {

                workOrderId:
                    Number(
                        form.workOrderId
                    ),

                technicianId:
                    Number(
                        form.technicianId
                    ),

                scheduledDate:
                    form.scheduledDate,

                startTime:
                    form.startTime,

                endTime:
                    form.endTime,

                status:
                    "SCHEDULED",

                notes:
                    form.notes

            };


            console.log(
                "🚀 CREATING SCHEDULE:",
                scheduleData
            );


            const newSchedule =
                await createSchedule(
                    scheduleData
                );


            console.log(
                "✅ CREATED SCHEDULE:",
                newSchedule
            );


            setSuccess(
                "Schedule created successfully!"
            );


            setForm({

                workOrderId: "",

                technicianId: "",

                scheduledDate: "",

                startTime: "",

                endTime: "",

                status: "SCHEDULED",

                notes: ""

            });


            await loadData();


        } catch (err) {

            console.error(
                "❌ Create schedule error:",
                err
            );


            handleAuthenticationError(
                err
            );

        } finally {

            setSaving(false);

        }

    }


    // =====================================================
    // DELETE SCHEDULE
    // =====================================================

    async function handleDelete(
        id
    ) {

        if (!canManageSchedules) {

            setError(
                "You do not have permission to delete schedules."
            );

            return;

        }


        const confirmed =
            window.confirm(
                "Are you sure you want to delete this schedule?"
            );


        if (!confirmed) {

            return;

        }


        try {

            setError("");

            setSuccess("");


            await deleteSchedule(
                id
            );


            setSuccess(
                "Schedule deleted successfully!"
            );


            await loadData();


        } catch (err) {

            console.error(
                "❌ Delete schedule error:",
                err
            );


            handleAuthenticationError(
                err
            );

        }

    }


    // =====================================================
    // FIND WORK ORDER
    // =====================================================

    function getWorkOrder(
        workOrderId
    ) {

        if (!workOrderId) {

            return null;

        }


        return workOrders.find(
            workOrder =>
                Number(
                    workOrder.id
                ) ===
                Number(
                    workOrderId
                )
        );

    }


    // =====================================================
    // FIND TECHNICIAN
    // =====================================================

    function getTechnician(
        technicianId
    ) {

        if (!technicianId) {

            return null;

        }


        return technicians.find(
            technician =>
                Number(
                    technician.id
                ) ===
                Number(
                    technicianId
                )
        );

    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(
        date
    ) {

        if (!date) {

            return "-";

        }


        const dateObject =
            new Date(
                `${date}T00:00:00`
            );


        if (
            Number.isNaN(
                dateObject.getTime()
            )
        ) {

            return "-";

        }


        return dateObject.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // =====================================================
    // FORMAT TIME
    // =====================================================

    function formatTime(
        time
    ) {

        if (!time) {

            return "-";

        }


        const [
            hours,
            minutes
        ] =
            time.split(":");


        const date =
            new Date();


        date.setHours(
            Number(hours),
            Number(minutes),
            0,
            0
        );


        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    // =====================================================
    // STATUS CLASS
    // =====================================================

    function getStatusClass(
        status
    ) {

        return String(
            status ||
            "SCHEDULED"
        )
            .toLowerCase()
            .replace(
                "_",
                "-"
            );

    }


    // =====================================================
    // PAGE DESCRIPTION
    // =====================================================

    function getPageDescription() {

        if (isTechnician) {

            return "View your assigned technician jobs";

        }


        if (isDispatcher) {

            return "Plan and assign technician jobs";

        }


        if (isManager) {

            return "Plan and manage technician jobs";

        }


        return "View scheduled technician jobs";

    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="schedule-page">

                <div className="schedule-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading schedules...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="schedule-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="schedule-header">

                <div>

                    <h1>
                        Schedule Management
                    </h1>

                    <p>
                        {getPageDescription()}
                    </p>

                </div>


                <div className="schedule-count">

                    <span>
                        {schedules.length}
                    </span>

                    <small>
                        Scheduled Jobs
                    </small>

                </div>

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (

                <div className="schedule-alert error">

                    ❌ {error}

                </div>

            )}


            {success && (

                <div className="schedule-alert success">

                    ✅ {success}

                </div>

            )}


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div
                className="schedule-layout"
                style={
                    isTechnician
                        ? {
                            gridTemplateColumns:
                                "1fr"
                        }
                        : undefined
                }
            >


                {/* =================================================
                    CREATE SCHEDULE
                    DISPATCHER / MANAGER ONLY
                ================================================= */}

                {canManageSchedules && (

                    <div className="schedule-card form-card">

                        <div className="card-title">

                            <div className="title-icon">
                                📅
                            </div>

                            <div>

                                <h2>
                                    Create Schedule
                                </h2>

                                <p>
                                    Assign a work order to a technician
                                </p>

                            </div>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="schedule-form"
                        >


                            {/* =================================================
                                WORK ORDER
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Work Order
                                </label>

                                <select
                                    name="workOrderId"
                                    value={
                                        form.workOrderId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Work Order
                                    </option>


                                    {workOrders.map(
                                        workOrder => (

                                            <option
                                                key={
                                                    workOrder.id
                                                }
                                                value={
                                                    workOrder.id
                                                }
                                            >

                                                {workOrder.orderNumber
                                                    ? `${workOrder.orderNumber} - ${
                                                        workOrder.title ||
                                                        workOrder.description ||
                                                        "Work Order"
                                                    }`
                                                    : `WO-${workOrder.id} - ${
                                                        workOrder.title ||
                                                        workOrder.description ||
                                                        "Work Order"
                                                    }`
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* =================================================
                                TECHNICIAN
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Technician
                                </label>

                                <select
                                    name="technicianId"
                                    value={
                                        form.technicianId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Available Technician
                                    </option>


                                    {technicians
                                        .filter(
                                            technician =>
                                                String(
                                                    technician.status ||
                                                    ""
                                                ).toUpperCase() ===
                                                "AVAILABLE"
                                        )
                                        .map(
                                            technician => (

                                                <option
                                                    key={
                                                        technician.id
                                                    }
                                                    value={
                                                        technician.id
                                                    }
                                                >

                                                    {
                                                        technician.fullName ||
                                                        technician.name ||
                                                        technician.employeeCode ||
                                                        `Technician ${technician.id}`
                                                    }

                                                    {" - "}

                                                    {
                                                        technician.employeeCode ||
                                                        `TECH-${technician.id}`
                                                    }

                                                </option>

                                            )
                                        )}

                                </select>

                            </div>


                            {/* =================================================
                                DATE
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Scheduled Date
                                </label>

                                <input
                                    type="date"
                                    name="scheduledDate"
                                    value={
                                        form.scheduledDate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* =================================================
                                TIME
                            ================================================= */}

                            <div className="time-row">

                                <div className="form-group">

                                    <label>
                                        Start Time
                                    </label>

                                    <input
                                        type="time"
                                        name="startTime"
                                        value={
                                            form.startTime
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        End Time
                                    </label>

                                    <input
                                        type="time"
                                        name="endTime"
                                        value={
                                            form.endTime
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                STATUS
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        form.status
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="SCHEDULED">
                                        Scheduled
                                    </option>

                                </select>

                            </div>


                            {/* =================================================
                                NOTES
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Notes
                                </label>

                                <textarea
                                    name="notes"
                                    value={
                                        form.notes
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Add any special instructions..."
                                    rows="4"
                                ></textarea>

                            </div>


                            {/* =================================================
                                CREATE BUTTON
                            ================================================= */}

                            <button
                                type="submit"
                                className="create-schedule-btn"
                                disabled={
                                    saving
                                }
                            >

                                {saving
                                    ? "Creating..."
                                    : "➕ Create Schedule"
                                }

                            </button>

                        </form>

                    </div>

                )}


                {/* =================================================
                    SCHEDULE LIST
                ================================================= */}

                <div className="schedule-card list-card">


                    <div className="card-title">

                        <div className="title-icon">
                            📋
                        </div>

                        <div>

                            <h2>

                                {isTechnician
                                    ? "My Scheduled Jobs"
                                    : "Scheduled Jobs"
                                }

                            </h2>

                            <p>

                                {isTechnician
                                    ? "View your assigned service jobs"
                                    : "View all assigned jobs"
                                }

                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        NO SCHEDULES
                    ================================================= */}

                    {schedules.length === 0 ? (

                        <div className="empty-schedules">

                            <div className="empty-icon">
                                📅
                            </div>

                            <h3>
                                No schedules yet
                            </h3>

                            <p>

                                {isTechnician
                                    ? "You currently have no assigned jobs."
                                    : "Create your first schedule using the form."
                                }

                            </p>

                        </div>

                    ) : (

                        <div className="schedule-table-container">

                            <table className="schedule-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Work Order
                                        </th>

                                        <th>
                                            Technician
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Time
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Notes
                                        </th>

                                        {canManageSchedules && (

                                            <th>
                                                Action
                                            </th>

                                        )}

                                    </tr>

                                </thead>


                                <tbody>

                                    {schedules.map(
                                        schedule => {

                                            const workOrder =
                                                getWorkOrder(
                                                    schedule.workOrderId
                                                );


                                            const technician =
                                                getTechnician(
                                                    schedule.technicianId
                                                );


                                            const workOrderNumber =
                                                workOrder?.orderNumber ||
                                                `WO-${schedule.workOrderId}`;


                                            const workOrderTitle =
                                                workOrder?.title ||
                                                workOrder?.description ||
                                                "Work Order";


                                            /*
                                             * For technician users,
                                             * currentTechnician contains
                                             * their actual technician record.
                                             */

                                            const technicianName =
                                                technician?.fullName ||
                                                technician?.name ||
                                                technician?.employeeCode ||
                                                (
                                                    currentTechnician &&
                                                    Number(
                                                        currentTechnician.id
                                                    ) ===
                                                    Number(
                                                        schedule.technicianId
                                                    )
                                                        ? (
                                                            currentTechnician.fullName ||
                                                            currentTechnician.name ||
                                                            currentTechnician.employeeCode
                                                        )
                                                        : null
                                                ) ||
                                                `Technician ${schedule.technicianId}`;


                                            const status =
                                                String(
                                                    schedule.status ||
                                                    "SCHEDULED"
                                                );


                                            return (

                                                <tr
                                                    key={
                                                        schedule.id
                                                    }
                                                >


                                                    {/* =================================================
                                                        WORK ORDER
                                                    ================================================= */}

                                                    <td>

                                                        <div className="work-order-info">

                                                            <strong>
                                                                {
                                                                    workOrderNumber
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    workOrderTitle
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* =================================================
                                                        TECHNICIAN
                                                    ================================================= */}

                                                    <td>

                                                        <div className="technician-info">

                                                            <div className="technician-avatar">

                                                                {
                                                                    technicianName
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        ?.toUpperCase()
                                                                }

                                                            </div>

                                                            <span>

                                                                {
                                                                    technicianName
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* =================================================
                                                        DATE
                                                    ================================================= */}

                                                    <td>

                                                        <span className="date-value">

                                                            📅{" "}

                                                            {
                                                                formatDate(
                                                                    schedule.scheduledDate
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* =================================================
                                                        TIME
                                                    ================================================= */}

                                                    <td>

                                                        <div className="time-info">

                                                            <span>

                                                                {
                                                                    formatTime(
                                                                        schedule.startTime
                                                                    )
                                                                }

                                                            </span>

                                                            <span className="time-arrow">
                                                                →
                                                            </span>

                                                            <span>

                                                                {
                                                                    formatTime(
                                                                        schedule.endTime
                                                                    )
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* =================================================
                                                        STATUS
                                                    ================================================= */}

                                                    <td>

                                                        <span
                                                            className={`status-badge ${getStatusClass(status)}`}
                                                        >

                                                            {
                                                                status.replace(
                                                                    "_",
                                                                    " "
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* =================================================
                                                        NOTES
                                                    ================================================= */}

                                                    <td>

                                                        <span className="notes-text">

                                                            {
                                                                schedule.notes ||
                                                                "—"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* =================================================
                                                        ACTION
                                                    ================================================= */}

                                                    {canManageSchedules && (

                                                        <td>

                                                            <button
                                                                className="delete-btn"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        schedule.id
                                                                    )
                                                                }
                                                                title="Delete schedule"
                                                            >

                                                                🗑️

                                                            </button>

                                                        </td>

                                                    )}

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}


export default Schedule;

