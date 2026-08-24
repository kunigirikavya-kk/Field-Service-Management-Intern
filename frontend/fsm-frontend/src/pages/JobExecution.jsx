import { useEffect, useState } from "react";

import {
    getJobExecutions,
    getSchedules,
    getWorkOrders,
    getTechnicians,
    startJob,
    updateJobExecution,
    completeJob,
    cancelJobExecution
} from "../services/api";

import "./JobExecution.css";


function JobExecution() {

    const [executions, setExecutions] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [technicians, setTechnicians] = useState([]);

    const [selectedJob, setSelectedJob] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const [form, setForm] = useState({
        workNotes: "",
        partsUsed: "",
        completionNotes: ""
    });


    // --------------------------------
    // LOAD DATA
    // --------------------------------

    useEffect(() => {

        loadData();

    }, []);


    async function loadData() {

        try {

            setLoading(true);
            setError("");

            const [
                executionsData,
                schedulesData,
                workOrdersData,
                techniciansData
            ] = await Promise.all([

                getJobExecutions(),
                getSchedules(),
                getWorkOrders(),
                getTechnicians()

            ]);


            setExecutions(
                executionsData || []
            );

            setSchedules(
                schedulesData || []
            );

            setWorkOrders(
                workOrdersData || []
            );

            setTechnicians(
                techniciansData || []
            );


        } catch (err) {

            console.error(
                "Job execution loading error:",
                err
            );

            setError(
                err.message ||
                "Failed to load job execution data."
            );


        } finally {

            setLoading(false);
        }
    }


    // --------------------------------
    // SELECT JOB
    // --------------------------------

    function selectJob(execution) {

        setSelectedJob(execution);

        setForm({

            workNotes:
                execution.workNotes || "",

            partsUsed:
                execution.partsUsed || "",

            completionNotes:
                execution.completionNotes || ""

        });

        setError("");
        setSuccess("");
    }


    // --------------------------------
    // START SCHEDULED JOB
    // --------------------------------

    async function handleStartJob(schedule) {

        try {

            setSaving(true);
            setError("");
            setSuccess("");


            const existingExecution =
                executions.find(
                    execution =>
                        execution.scheduleId === schedule.id
                );


            if (existingExecution) {

                selectJob(existingExecution);

                setSuccess(
                    "This job has already been started."
                );

                return;
            }


            const newExecution = {

                scheduleId: schedule.id,

                workOrderId:
                    schedule.workOrderId,

                technicianId:
                    schedule.technicianId,

                status: "IN_PROGRESS",

                workNotes: "",

                partsUsed: "",

                completionNotes: ""
            };


            const createdExecution =
                await startJob(newExecution);


            setExecutions([
                ...executions,
                createdExecution
            ]);


            setSelectedJob(
                createdExecution
            );


            setForm({
                workNotes: "",
                partsUsed: "",
                completionNotes: ""
            });


            setSuccess(
                "Job started successfully!"
            );


        } catch (err) {

            console.error(
                "Start job error:",
                err
            );

            setError(
                err.message ||
                "Failed to start job."
            );


        } finally {

            setSaving(false);
        }
    }


    // --------------------------------
    // UPDATE NOTES
    // --------------------------------

    function handleChange(e) {

        const {
            name,
            value
        } = e.target;


        setForm({

            ...form,

            [name]: value

        });
    }


    // --------------------------------
    // SAVE PROGRESS
    // --------------------------------

    async function handleSaveProgress() {

        if (!selectedJob) {
            return;
        }


        try {

            setSaving(true);
            setError("");
            setSuccess("");


            const updated =
                await updateJobExecution(
                    selectedJob.id,
                    {

                        workNotes:
                            form.workNotes,

                        partsUsed:
                            form.partsUsed,

                        completionNotes:
                            form.completionNotes

                    }
                );


            setExecutions(
                executions.map(
                    execution =>
                        execution.id === updated.id
                            ? updated
                            : execution
                )
            );


            setSelectedJob(updated);


            setSuccess(
                "Job progress saved successfully!"
            );


        } catch (err) {

            console.error(
                "Save progress error:",
                err
            );

            setError(
                err.message ||
                "Failed to save job progress."
            );


        } finally {

            setSaving(false);
        }
    }


    // --------------------------------
    // COMPLETE JOB
    // --------------------------------

    async function handleCompleteJob() {

        if (!selectedJob) {
            return;
        }


        if (!form.workNotes.trim()) {

            setError(
                "Please enter work notes before completing the job."
            );

            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to complete this job?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setSaving(true);
            setError("");
            setSuccess("");


            const completed =
                await completeJob(
                    selectedJob.id,
                    {

                        workNotes:
                            form.workNotes,

                        partsUsed:
                            form.partsUsed,

                        completionNotes:
                            form.completionNotes

                    }
                );


            setExecutions(
                executions.map(
                    execution =>
                        execution.id === completed.id
                            ? completed
                            : execution
                )
            );


            setSelectedJob(
                completed
            );


            setSuccess(
                "Job completed successfully! 🎉"
            );


        } catch (err) {

            console.error(
                "Complete job error:",
                err
            );

            setError(
                err.message ||
                "Failed to complete job."
            );


        } finally {

            setSaving(false);
        }
    }


    // --------------------------------
    // CANCEL JOB
    // --------------------------------

    async function handleCancelJob() {

        if (!selectedJob) {
            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this job?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setSaving(true);
            setError("");
            setSuccess("");


            const cancelled =
                await cancelJobExecution(
                    selectedJob.id
                );


            setExecutions(
                executions.map(
                    execution =>
                        execution.id === cancelled.id
                            ? cancelled
                            : execution
                )
            );


            setSelectedJob(
                cancelled
            );


            setSuccess(
                "Job cancelled."
            );


        } catch (err) {

            console.error(
                "Cancel job error:",
                err
            );

            setError(
                err.message ||
                "Failed to cancel job."
            );


        } finally {

            setSaving(false);
        }
    }


    // --------------------------------
    // HELPERS
    // --------------------------------

    function getWorkOrder(id) {

        return workOrders.find(
            workOrder =>
                workOrder.id === Number(id)
        );
    }


    function getTechnician(id) {

        return technicians.find(
            technician =>
                technician.id === Number(id)
        );
    }


    function getScheduleForExecution(
        execution
    ) {

        return schedules.find(
            schedule =>
                schedule.id ===
                execution.scheduleId
        );
    }


    function formatDate(date) {

        if (!date) {
            return "-";
        }


        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    function formatTime(time) {

        if (!time) {
            return "-";
        }


        const [
            hours,
            minutes
        ] = time.split(":");


        const date =
            new Date();


        date.setHours(
            Number(hours),
            Number(minutes)
        );


        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    function formatDateTime(dateTime) {

        if (!dateTime) {
            return "-";
        }


        return new Date(
            dateTime
        ).toLocaleString(
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


    // --------------------------------
    // LOADING
    // --------------------------------

    if (loading) {

        return (

            <div className="job-execution-page">

                <div className="job-loading">

                    <div className="job-spinner"></div>

                    <p>
                        Loading jobs...
                    </p>

                </div>

            </div>
        );
    }


    // --------------------------------
    // UI
    // --------------------------------

    return (

        <div className="job-execution-page">


            {/* HEADER */}

            <div className="job-header">

                <div>

                    <h1>
                        Service Execution
                    </h1>

                    <p>
                        Start, manage and complete technician jobs
                    </p>

                </div>


                <div className="job-count">

                    <span>
                        {executions.length}
                    </span>

                    <small>
                        Job Executions
                    </small>

                </div>

            </div>


            {/* ALERTS */}

            {error && (

                <div className="job-alert error">

                    ❌ {error}

                </div>

            )}


            {success && (

                <div className="job-alert success">

                    ✅ {success}

                </div>

            )}


            {/* AVAILABLE SCHEDULES */}

            <div className="execution-card">

                <div className="execution-card-header">

                    <div>

                        <h2>
                            📅 Scheduled Jobs
                        </h2>

                        <p>
                            Start a scheduled job to begin service execution
                        </p>

                    </div>

                </div>


                {schedules.length === 0 ? (

                    <div className="empty-jobs">

                        <div className="empty-job-icon">
                            📅
                        </div>

                        <h3>
                            No scheduled jobs
                        </h3>

                        <p>
                            Create a schedule first.
                        </p>

                    </div>

                ) : (

                    <div className="scheduled-job-grid">

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


                                const execution =
                                    executions.find(
                                        item =>
                                            item.scheduleId ===
                                            schedule.id
                                    );


                                return (

                                    <div
                                        className="scheduled-job-card"
                                        key={schedule.id}
                                    >

                                        <div className="job-card-top">

                                            <span className="job-order-number">

                                                {workOrder?.orderNumber ||
                                                    `WO-${schedule.workOrderId}`
                                                }

                                            </span>


                                            <span
                                                className={`execution-status ${
                                                    execution?.status?.toLowerCase() ||
                                                    "not_started"
                                                }`}
                                            >

                                                {execution?.status
                                                    ? execution.status.replace(
                                                        "_",
                                                        " "
                                                    )
                                                    : "NOT STARTED"
                                                }

                                            </span>

                                        </div>


                                        <h3>

                                            {workOrder?.title ||
                                                "Work Order"
                                            }

                                        </h3>


                                        <div className="job-detail">

                                            👨‍🔧

                                            <span>

                                                {technician?.fullName ||
                                                    technician?.name ||
                                                    technician?.employeeCode ||
                                                    `Technician ${schedule.technicianId}`
                                                }

                                            </span>

                                        </div>


                                        <div className="job-detail">

                                            📅

                                            <span>

                                                {formatDate(
                                                    schedule.scheduledDate
                                                )}

                                            </span>

                                        </div>


                                        <div className="job-detail">

                                            🕐

                                            <span>

                                                {formatTime(
                                                    schedule.startTime
                                                )}

                                                {" → "}

                                                {formatTime(
                                                    schedule.endTime
                                                )}

                                            </span>

                                        </div>


                                        {execution?.status ===
                                            "COMPLETED" ? (

                                            <button
                                                className="view-job-btn"
                                                onClick={() =>
                                                    selectJob(
                                                        execution
                                                    )
                                                }
                                            >

                                                👁️ View Completed Job

                                            </button>

                                        ) : execution ? (

                                            <button
                                                className="continue-job-btn"
                                                onClick={() =>
                                                    selectJob(
                                                        execution
                                                    )
                                                }
                                            >

                                                📝 Continue Job

                                            </button>

                                        ) : (

                                            <button
                                                className="start-job-btn"
                                                onClick={() =>
                                                    handleStartJob(
                                                        schedule
                                                    )
                                                }
                                                disabled={saving}
                                            >

                                                ▶ Start Job

                                            </button>

                                        )}

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>


            {/* JOB EXECUTION FORM */}

            {selectedJob && (

                <div className="execution-card">

                    <div className="execution-card-header">

                        <div>

                            <h2>
                                🛠️ Job Execution
                            </h2>

                            <p>

                                {getWorkOrder(
                                    selectedJob.workOrderId
                                )?.title ||
                                    "Work Order"
                                }

                            </p>

                        </div>


                        <span
                            className={`large-status ${
                                selectedJob.status.toLowerCase()
                            }`}
                        >

                            {selectedJob.status.replace(
                                "_",
                                " "
                            )}

                        </span>

                    </div>


                    <div className="execution-info-grid">

                        <div>

                            <label>
                                Work Order
                            </label>

                            <strong>

                                {getWorkOrder(
                                    selectedJob.workOrderId
                                )?.orderNumber ||
                                    `WO-${selectedJob.workOrderId}`
                                }

                            </strong>

                        </div>


                        <div>

                            <label>
                                Technician
                            </label>

                            <strong>

                                {getTechnician(
                                    selectedJob.technicianId
                                )?.fullName ||
                                    getTechnician(
                                        selectedJob.technicianId
                                    )?.name ||
                                    `Technician ${selectedJob.technicianId}`
                                }

                            </strong>

                        </div>


                        <div>

                            <label>
                                Scheduled
                            </label>

                            <strong>

                                {(() => {

                                    const schedule =
                                        getScheduleForExecution(
                                            selectedJob
                                        );

                                    return schedule
                                        ? `${formatDate(
                                            schedule.scheduledDate
                                        )} ${formatTime(
                                            schedule.startTime
                                        )}`
                                        : "-";

                                })()}

                            </strong>

                        </div>


                        <div>

                            <label>
                                Started At
                            </label>

                            <strong>

                                {formatDateTime(
                                    selectedJob.startedAt
                                )}

                            </strong>

                        </div>

                    </div>


                    <div className="execution-form">


                        <div className="execution-form-group">

                            <label>
                                📝 Work Performed
                            </label>

                            <textarea
                                name="workNotes"
                                value={
                                    form.workNotes
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Describe the work performed..."
                                rows="5"
                                disabled={
                                    selectedJob.status ===
                                    "COMPLETED"
                                }
                            ></textarea>

                        </div>


                        <div className="execution-form-group">

                            <label>
                                🔧 Parts / Materials Used
                            </label>

                            <textarea
                                name="partsUsed"
                                value={
                                    form.partsUsed
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="List parts or materials used..."
                                rows="4"
                                disabled={
                                    selectedJob.status ===
                                    "COMPLETED"
                                }
                            ></textarea>

                        </div>


                        <div className="execution-form-group">

                            <label>
                                📋 Completion Notes
                            </label>

                            <textarea
                                name="completionNotes"
                                value={
                                    form.completionNotes
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Add final completion notes..."
                                rows="4"
                                disabled={
                                    selectedJob.status ===
                                    "COMPLETED"
                                }
                            ></textarea>

                        </div>


                        <div className="execution-actions">

                            {selectedJob.status !==
                                "COMPLETED" &&
                                selectedJob.status !==
                                "CANCELLED" && (

                                    <>

                                        <button
                                            className="save-job-btn"
                                            onClick={
                                                handleSaveProgress
                                            }
                                            disabled={
                                                saving
                                            }
                                        >

                                            💾 Save Progress

                                        </button>


                                        <button
                                            className="complete-job-btn"
                                            onClick={
                                                handleCompleteJob
                                            }
                                            disabled={
                                                saving
                                            }
                                        >

                                            ✅ Complete Job

                                        </button>


                                        <button
                                            className="cancel-job-btn"
                                            onClick={
                                                handleCancelJob
                                            }
                                            disabled={
                                                saving
                                            }
                                        >

                                            ✕ Cancel

                                        </button>

                                    </>

                                )}

                        </div>


                        {selectedJob.completedAt && (

                            <div className="completed-info">

                                ✅ Completed at{" "}

                                {formatDateTime(
                                    selectedJob.completedAt
                                )}

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}


export default JobExecution;