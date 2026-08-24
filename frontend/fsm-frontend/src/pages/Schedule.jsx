import { useEffect, useState } from "react";

import {
    getSchedules,
    createSchedule,
    deleteSchedule,
    getWorkOrders,
    getTechnicians
} from "../services/api";

import "./Schedule.css";


function Schedule() {

    const [schedules, setSchedules] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [technicians, setTechnicians] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const [form, setForm] = useState({
        workOrderId: "",
        technicianId: "",
        scheduledDate: "",
        startTime: "",
        endTime: "",
        status: "SCHEDULED",
        notes: ""
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
                schedulesData,
                workOrdersData,
                techniciansData
            ] = await Promise.all([
                getSchedules(),
                getWorkOrders(),
                getTechnicians()
            ]);


            setSchedules(schedulesData || []);
            setWorkOrders(workOrdersData || []);
            setTechnicians(techniciansData || []);

        } catch (err) {

            console.error("Schedule loading error:", err);

            setError(
                err.message || "Failed to load schedule data"
            );

        } finally {

            setLoading(false);
        }
    }


    // --------------------------------
    // FORM INPUT
    // --------------------------------

    function handleChange(e) {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });
    }


    // --------------------------------
    // CREATE SCHEDULE
    // --------------------------------

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");
        setSuccess("");


        if (!form.workOrderId) {

            setError("Please select a work order.");
            return;
        }


        if (!form.technicianId) {

            setError("Please select a technician.");
            return;
        }


        if (!form.scheduledDate) {

            setError("Please select a scheduled date.");
            return;
        }


        if (!form.startTime || !form.endTime) {

            setError("Please select start and end time.");
            return;
        }


        if (form.startTime >= form.endTime) {

            setError("End time must be after start time.");
            return;
        }


        try {

            setSaving(true);


            const scheduleData = {

                workOrderId: Number(form.workOrderId),

                technicianId: Number(form.technicianId),

                scheduledDate: form.scheduledDate,

                startTime: form.startTime,

                endTime: form.endTime,

                status: form.status,

                notes: form.notes
            };


            console.log(
                "Creating schedule:",
                scheduleData
            );


            const newSchedule =
                await createSchedule(scheduleData);


            setSchedules([
                ...schedules,
                newSchedule
            ]);


            setSuccess(
                "Schedule created successfully!"
            );


            // Reset form
            setForm({
                workOrderId: "",
                technicianId: "",
                scheduledDate: "",
                startTime: "",
                endTime: "",
                status: "SCHEDULED",
                notes: ""
            });


        } catch (err) {

            console.error(
                "Create schedule error:",
                err
            );

            setError(
                err.message ||
                "Failed to create schedule."
            );

        } finally {

            setSaving(false);
        }
    }


    // --------------------------------
    // DELETE SCHEDULE
    // --------------------------------

    async function handleDelete(id) {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this schedule?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteSchedule(id);


            setSchedules(
                schedules.filter(
                    schedule => schedule.id !== id
                )
            );


            setSuccess(
                "Schedule deleted successfully!"
            );


        } catch (err) {

            console.error(
                "Delete schedule error:",
                err
            );

            setError(
                err.message ||
                "Failed to delete schedule."
            );
        }
    }


    // --------------------------------
    // FIND WORK ORDER
    // --------------------------------

    function getWorkOrder(workOrderId) {

        return workOrders.find(
            workOrder =>
                workOrder.id === Number(workOrderId)
        );
    }


    // --------------------------------
    // FIND TECHNICIAN
    // --------------------------------

    function getTechnician(technicianId) {

        return technicians.find(
            technician =>
                technician.id === Number(technicianId)
        );
    }


    // --------------------------------
    // FORMAT DATE
    // --------------------------------

    function formatDate(date) {

        if (!date) {
            return "-";
        }


        const dateObject =
            new Date(`${date}T00:00:00`);


        return dateObject.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    // --------------------------------
    // FORMAT TIME
    // --------------------------------

    function formatTime(time) {

        if (!time) {
            return "-";
        }


        const [hours, minutes] =
            time.split(":");


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


    // --------------------------------
    // LOADING
    // --------------------------------

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


    // --------------------------------
    // UI
    // --------------------------------

    return (

        <div className="schedule-page">


            {/* HEADER */}

            <div className="schedule-header">

                <div>

                    <h1>
                        Schedule Management
                    </h1>

                    <p>
                        Plan and manage technician jobs
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


            {/* ALERTS */}

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


            {/* MAIN CONTENT */}

            <div className="schedule-layout">


                {/* CREATE SCHEDULE */}

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
                        onSubmit={handleSubmit}
                        className="schedule-form"
                    >


                        {/* WORK ORDER */}

                        <div className="form-group">

                            <label>
                                Work Order
                            </label>

                            <select
                                name="workOrderId"
                                value={form.workOrderId}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select Work Order
                                </option>


                                {workOrders.map(
                                    workOrder => (

                                        <option
                                            key={workOrder.id}
                                            value={workOrder.id}
                                        >

                                            {workOrder.orderNumber
                                                ? `${workOrder.orderNumber} - ${workOrder.title || "Work Order"}`
                                                : `WO-${workOrder.id} - ${workOrder.title || "Work Order"}`
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* TECHNICIAN */}

                        <div className="form-group">

                            <label>
                                Technician
                            </label>

                            <select
                                name="technicianId"
                                value={form.technicianId}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select Technician
                                </option>


                                {technicians.map(
                                    technician => (

                                        <option
                                            key={technician.id}
                                            value={technician.id}
                                        >

                                            {technician.fullName ||
                                                technician.name ||
                                                technician.employeeCode ||
                                                `Technician ${technician.id}`
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* DATE */}

                        <div className="form-group">

                            <label>
                                Scheduled Date
                            </label>

                            <input
                                type="date"
                                name="scheduledDate"
                                value={form.scheduledDate}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* TIME */}

                        <div className="time-row">


                            <div className="form-group">

                                <label>
                                    Start Time
                                </label>

                                <input
                                    type="time"
                                    name="startTime"
                                    value={form.startTime}
                                    onChange={handleChange}
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
                                    value={form.endTime}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                        </div>


                        {/* STATUS */}

                        <div className="form-group">

                            <label>
                                Status
                            </label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >

                                <option value="SCHEDULED">
                                    Scheduled
                                </option>

                                <option value="IN_PROGRESS">
                                    In Progress
                                </option>

                                <option value="COMPLETED">
                                    Completed
                                </option>

                                <option value="CANCELLED">
                                    Cancelled
                                </option>

                            </select>

                        </div>


                        {/* NOTES */}

                        <div className="form-group">

                            <label>
                                Notes
                            </label>

                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Add any special instructions..."
                                rows="4"
                            ></textarea>

                        </div>


                        {/* BUTTON */}

                        <button
                            type="submit"
                            className="create-schedule-btn"
                            disabled={saving}
                        >

                            {saving
                                ? "Creating..."
                                : "➕ Create Schedule"
                            }

                        </button>


                    </form>

                </div>


                {/* SCHEDULE LIST */}

                <div className="schedule-card list-card">


                    <div className="card-title">

                        <div className="title-icon">
                            📋
                        </div>

                        <div>

                            <h2>
                                Scheduled Jobs
                            </h2>

                            <p>
                                View all assigned jobs
                            </p>

                        </div>

                    </div>


                    {schedules.length === 0 ? (

                        <div className="empty-schedules">

                            <div className="empty-icon">
                                📅
                            </div>

                            <h3>
                                No schedules yet
                            </h3>

                            <p>
                                Create your first schedule using the form.
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

                                        <th>
                                            Action
                                        </th>

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


                                            return (

                                                <tr
                                                    key={schedule.id}
                                                >

                                                    <td>

                                                        <div className="work-order-info">

                                                            <strong>

                                                                {workOrder?.orderNumber ||
                                                                    `WO-${schedule.workOrderId}`
                                                                }

                                                            </strong>

                                                            <span>

                                                                {workOrder?.title ||
                                                                    "Work Order"
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="technician-info">

                                                            <div className="technician-avatar">

                                                                {(
                                                                    technician?.fullName ||
                                                                    technician?.name ||
                                                                    "T"
                                                                )
                                                                    .charAt(0)
                                                                    .toUpperCase()
                                                                }

                                                            </div>

                                                            <span>

                                                                {technician?.fullName ||
                                                                    technician?.name ||
                                                                    technician?.employeeCode ||
                                                                    `Technician ${schedule.technicianId}`
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span className="date-value">

                                                            📅{" "}

                                                            {formatDate(
                                                                schedule.scheduledDate
                                                            )}

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="time-info">

                                                            <span>
                                                                {formatTime(
                                                                    schedule.startTime
                                                                )}
                                                            </span>

                                                            <span className="time-arrow">
                                                                →
                                                            </span>

                                                            <span>
                                                                {formatTime(
                                                                    schedule.endTime
                                                                )}
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`status-badge ${
                                                                schedule.status
                                                                    ?.toLowerCase()
                                                            }`}
                                                        >

                                                            {schedule.status
                                                                ?.replace(
                                                                    "_",
                                                                    " "
                                                                )
                                                                || "SCHEDULED"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="notes-text">

                                                            {schedule.notes ||
                                                                "—"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <button
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    schedule.id
                                                                )
                                                            }
                                                        >

                                                            🗑️

                                                        </button>

                                                    </td>

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