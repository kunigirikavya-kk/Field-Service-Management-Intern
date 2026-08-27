import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getSchedules,
    getJobExecutions,
    getWorkOrdersByTechnician,
    startJob,
    completeJob,
    cancelJobExecution
} from "../services/api";

import "./JobExecution.css";


function JobExecution() {

    const navigate = useNavigate();

    // =====================================================
    // STATE
    // =====================================================

    const [schedules, setSchedules] = useState([]);
    const [jobExecutions, setJobExecutions] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [startingJob, setStartingJob] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);


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

            const storedUser = localStorage.getItem("fieldsyncUser");

            if (!storedUser) {
                throw new Error("User session not found.");
            }

            const user = JSON.parse(storedUser);

            console.log("👤 LOGGED-IN USER:", user);

            const role = String(user.role || "").toUpperCase();

            const technicianId = user.id;

            console.log("🔐 USER ROLE:", role);
            console.log("🔧 TECHNICIAN ID:", technicianId);


            // =================================================
            // LOAD SCHEDULES
            // =================================================

            const scheduleData = await getSchedules();

            console.log("📅 SCHEDULES:", scheduleData);

            setSchedules(
                Array.isArray(scheduleData)
                    ? scheduleData
                    : []
            );


            // =================================================
            // LOAD JOB EXECUTIONS
            // =================================================

            const executionData = await getJobExecutions();

            console.log("⚙️ JOB EXECUTIONS:", executionData);

            setJobExecutions(
                Array.isArray(executionData)
                    ? executionData
                    : []
            );


            // =================================================
            // LOAD WORK ORDERS
            // =================================================

            let workOrderData = [];

            if (role === "TECHNICIAN") {

                if (!technicianId) {
                    throw new Error(
                        "Technician ID is missing from the logged-in user."
                    );
                }

                console.log(
                    "🔧 Loading technician work orders..."
                );

                workOrderData =
                    await getWorkOrdersByTechnician(
                        technicianId
                    );

            } else {

                console.log(
                    "👨‍💼 Non-technician user detected."
                );

                workOrderData = [];

            }


            console.log(
                "📋 WORK ORDERS:",
                workOrderData
            );

            setWorkOrders(
                Array.isArray(workOrderData)
                    ? workOrderData
                    : []
            );


        } catch (err) {

            console.error(
                "❌ Job execution loading error:",
                err
            );

            if (
                err.message &&
                err.message.includes("HTTP 401")
            ) {

                logoutAndRedirect();

                return;
            }

            setError(
                err.message ||
                "Unable to load job execution data."
            );

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // LOGOUT / REDIRECT
    // =====================================================

    function logoutAndRedirect() {

        localStorage.removeItem("fieldsyncToken");
        localStorage.removeItem("fieldsyncAuthenticated");
        localStorage.removeItem("fieldsyncUser");

        navigate("/login");
    }


    // =====================================================
    // FIND WORK ORDER FOR SCHEDULE
    // =====================================================

    function getWorkOrderForSchedule(schedule) {

        if (!schedule) {
            return null;
        }

        const workOrderId = schedule.workOrderId;

        if (!workOrderId) {
            return null;
        }

        return workOrders.find(
            workOrder =>
                Number(workOrder.id) ===
                Number(workOrderId)
        );

    }


    // =====================================================
    // START JOB
    // =====================================================

    async function handleStartJob(schedule) {

        if (startingJob) {
            return;
        }

        try {

            setStartingJob(true);

            const storedUser =
                localStorage.getItem("fieldsyncUser");

            const user =
                storedUser
                    ? JSON.parse(storedUser)
                    : null;

            const technicianId = user?.id;

            if (!technicianId) {
                throw new Error(
                    "Technician ID is missing."
                );
            }

            const workOrder =
                getWorkOrderForSchedule(schedule);

            if (!workOrder) {
                throw new Error(
                    "No work order was found for this schedule."
                );
            }

            const requestData = {

                scheduleId: schedule.id,

                workOrderId: workOrder.id,

                technicianId: technicianId,

                status: "IN_PROGRESS"

            };

            console.log(
                "🚀 STARTING JOB:",
                requestData
            );

            const result =
                await startJob(requestData);

            console.log(
                "✅ JOB STARTED:",
                result
            );

            alert(
                "Job started successfully! 🚀"
            );

            await loadData();

        } catch (err) {

            console.error(
                "❌ Error starting job:",
                err
            );

            if (
                err.message?.includes("HTTP 401")
            ) {

                logoutAndRedirect();

                return;
            }

            alert(
                `Unable to start job.\n\n${err.message}`
            );

        } finally {

            setStartingJob(false);

        }

    }


    // =====================================================
    // COMPLETE JOB
    // =====================================================

    async function handleCompleteJob(execution) {

        try {

            const completionNotes =
                window.prompt(
                    "Enter completion notes:",
                    ""
                );

            if (completionNotes === null) {
                return;
            }

            const requestData = {

                completionNotes:
                    completionNotes,

                status:
                    "COMPLETED"

            };

            console.log(
                "🏁 COMPLETING JOB:",
                execution.id,
                requestData
            );

            await completeJob(
                execution.id,
                requestData
            );

            alert(
                "Job completed successfully! 🎉"
            );

            await loadData();

        } catch (err) {

            console.error(
                "❌ Error completing job:",
                err
            );

            if (
                err.message?.includes("HTTP 401")
            ) {

                logoutAndRedirect();

                return;
            }

            alert(
                `Unable to complete job.\n\n${err.message}`
            );

        }

    }


    // =====================================================
    // CANCEL JOB
    // =====================================================

    async function handleCancelJob(execution) {

        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this job?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await cancelJobExecution(
                execution.id
            );

            alert(
                "Job cancelled successfully."
            );

            await loadData();

        } catch (err) {

            console.error(
                "❌ Error cancelling job:",
                err
            );

            if (
                err.message?.includes("HTTP 401")
            ) {

                logoutAndRedirect();

                return;
            }

            alert(
                `Unable to cancel job.\n\n${err.message}`
            );

        }

    }


    // =====================================================
    // STATUS CLASS
    // =====================================================

    function getStatusClass(status) {

        const normalized =
            String(status || "")
                .toUpperCase();

        switch (normalized) {

            case "COMPLETED":
                return "completed";

            case "IN_PROGRESS":
                return "in-progress";

            case "CANCELLED":
                return "cancelled";

            case "NOT_STARTED":
                return "not-started";

            default:
                return "not-started";

        }

    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(date) {

        if (!date) {
            return "-";
        }

        const parsed =
            new Date(date);

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "-";

        }

        return parsed.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    // =====================================================
    // COUNT ACTIVE JOBS
    // =====================================================

    const activeJobs =
        jobExecutions.filter(
            execution =>
                String(
                    execution.status || ""
                ).toUpperCase() ===
                "IN_PROGRESS"
        ).length;


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="je-page">

                <div className="je-loading">

                    <div className="je-spinner"></div>

                    <h2>
                        Loading Service Execution
                    </h2>

                    <p>
                        Preparing technician jobs...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="je-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="je-header">

                <div>

                    <span className="je-eyebrow">
                        FIELDSYNC OPERATIONS
                    </span>

                    <h1>
                        Service Execution
                    </h1>

                    <p>
                        Start, manage and complete your
                        technician service jobs.
                    </p>

                </div>


                <div className="je-count-box">

                    <span className="je-count-number">
                        {activeJobs}
                    </span>

                    <span className="je-count-label">
                        ACTIVE JOBS
                    </span>

                </div>

            </header>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="je-error">

                    <span className="je-error-icon">
                        ⚠️
                    </span>

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={loadData}
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =================================================
                SCHEDULED JOBS
            ================================================= */}

            <section className="je-section">

                <div className="je-section-header">

                    <span className="je-section-label">
                        SCHEDULED JOBS
                    </span>

                    <h2>
                        Start a Scheduled Job
                    </h2>

                    <p>
                        Select a scheduled work order to
                        begin service execution.
                    </p>

                </div>


                {schedules.length === 0 ? (

                    <div className="je-empty">

                        <div className="je-empty-icon">
                            📅
                        </div>

                        <h3>
                            No scheduled jobs
                        </h3>

                        <p>
                            Create a schedule first to
                            start a service job.
                        </p>

                    </div>

                ) : (

                    <div className="je-schedule-list">

                        {schedules.map(
                            schedule => {

                                const workOrder =
                                    getWorkOrderForSchedule(
                                        schedule
                                    );

                                const priority =
                                    String(
                                        workOrder?.priority ||
                                        schedule.priority ||
                                        "MEDIUM"
                                    ).toLowerCase();


                                return (

                                    <div
                                        className="je-schedule-card"
                                        key={schedule.id}
                                    >

                                        <div className="je-schedule-icon">
                                            🔧
                                        </div>


                                        <div className="je-schedule-content">

                                            <div className="je-work-order">

                                                {workOrder?.orderNumber ||
                                                    `WORK ORDER #${schedule.workOrderId || "-"}`}

                                            </div>


                                            <h3 className="je-schedule-title">

                                                {schedule.title ||
                                                    schedule.description ||
                                                    workOrder?.description ||
                                                    "Scheduled Service"}

                                            </h3>


                                            <div className="je-schedule-meta">

                                                <span>
                                                    📅
                                                    {formatDate(
                                                        schedule.scheduledDate
                                                    )}
                                                </span>

                                                <span>
                                                    👤
                                                    Technician #{schedule.technicianId || "-"}
                                                </span>

                                                <span>
                                                    📍
                                                    {schedule.location ||
                                                        schedule.serviceLocation ||
                                                        "Service Location"}
                                                </span>

                                            </div>

                                        </div>


                                        <span
                                            className={`je-priority ${priority}`}
                                        >
                                            {priority}
                                        </span>


                                        <button
                                            className="je-start-btn"
                                            onClick={() =>
                                                handleStartJob(
                                                    schedule
                                                )
                                            }
                                            disabled={
                                                startingJob ||
                                                !workOrder
                                            }
                                        >

                                            {startingJob
                                                ? "Starting..."
                                                : workOrder
                                                    ? "Start Job"
                                                    : "Work Order Missing"}

                                        </button>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </section>


            {/* =================================================
                JOB EXECUTIONS
            ================================================= */}

            <section className="je-section">

                <div className="je-section-header">

                    <span className="je-section-label">
                        JOB EXECUTIONS
                    </span>

                    <h2>
                        Active & Completed Jobs
                    </h2>

                    <p>
                        Monitor service execution progress
                        and complete active jobs.
                    </p>

                </div>


                {jobExecutions.length === 0 ? (

                    <div className="je-empty">

                        <div className="je-empty-icon">
                            🔧
                        </div>

                        <h3>
                            No job executions
                        </h3>

                        <p>
                            Start a scheduled job to
                            begin execution.
                        </p>

                    </div>

                ) : (

                    <div className="je-execution-list">

                        {jobExecutions.map(
                            execution => {

                                const status =
                                    String(
                                        execution.status ||
                                        "UNKNOWN"
                                    ).toUpperCase();

                                const statusClass =
                                    getStatusClass(
                                        execution.status
                                    );


                                const cardClass =
                                    status === "IN_PROGRESS"
                                        ? "active"
                                        : status === "COMPLETED"
                                            ? "completed"
                                            : "";


                                return (

                                    <div
                                        className={`je-execution-card ${cardClass}`}
                                        key={execution.id}
                                    >

                                        {/* ==========================
                                            EXECUTION TOP
                                        =========================== */}

                                        <div className="je-execution-top">

                                            <div className="je-execution-title">

                                                <div className="je-execution-icon">
                                                    {status === "COMPLETED"
                                                        ? "✓"
                                                        : status === "CANCELLED"
                                                            ? "×"
                                                            : "🔧"}
                                                </div>


                                                <div>

                                                    <h3>
                                                        Job Execution #{execution.id}
                                                    </h3>

                                                    <p>
                                                        Work Order #{execution.workOrderId || "-"}
                                                    </p>

                                                </div>

                                            </div>


                                            <span
                                                className={`je-status ${statusClass}`}
                                            >
                                                {status.replace(
                                                    /_/g,
                                                    " "
                                                )}
                                            </span>

                                        </div>


                                        {/* ==========================
                                            EXECUTION DETAILS
                                        =========================== */}

                                        <div className="je-execution-details">

                                            <div className="je-detail-item">

                                                <span>
                                                    TECHNICIAN
                                                </span>

                                                <strong>
                                                    #{execution.technicianId || "-"}
                                                </strong>

                                            </div>


                                            <div className="je-detail-item">

                                                <span>
                                                    STARTED
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        execution.startedAt
                                                    )}
                                                </strong>

                                            </div>


                                            <div className="je-detail-item">

                                                <span>
                                                    COMPLETED
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        execution.completedAt
                                                    )}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* ==========================
                                            NOTES
                                        =========================== */}

                                        {execution.workNotes && (

                                            <div className="je-notes">

                                                <strong>
                                                    Work Notes
                                                </strong>

                                                <span>
                                                    {execution.workNotes}
                                                </span>

                                            </div>

                                        )}


                                        {execution.completionNotes && (

                                            <div className="je-notes je-completion-notes">

                                                <strong>
                                                    Completion Notes
                                                </strong>

                                                <span>
                                                    {execution.completionNotes}
                                                </span>

                                            </div>

                                        )}


                                        {/* ==========================
                                            ACTIONS
                                        =========================== */}

                                        {status === "IN_PROGRESS" && (

                                            <div className="je-actions">

                                                <button
                                                    className="je-cancel-btn"
                                                    onClick={() =>
                                                        handleCancelJob(
                                                            execution
                                                        )
                                                    }
                                                >
                                                    Cancel Job
                                                </button>


                                                <button
                                                    className="je-complete-btn"
                                                    onClick={() =>
                                                        handleCompleteJob(
                                                            execution
                                                        )
                                                    }
                                                >
                                                    Complete Job
                                                </button>

                                            </div>

                                        )}

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </section>

        </div>

    );

}


export default JobExecution;