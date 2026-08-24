import { useEffect, useState } from "react";
import {
    getWorkOrders,
    createWorkOrder,
    updateWorkOrder
} from "../services/api";
import "./WorkOrders.css";

function WorkOrders() {

    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        serviceRequestId: "",
        technicianId: "",
        customerId: 1,
        siteId: 1,
        orderNumber: "",
        title: "",
        priority: "MEDIUM",
        description: "",
        status: "PENDING",
        scheduledDate: "",
        completedDate: "",
        totalCost: ""
    });

    const loadWorkOrders = async () => {
        try {
            const data = await getWorkOrders();

            setWorkOrders(
                Array.isArray(data) ? data : [data]
            );

        } catch (error) {
            console.error("Failed to load work orders:", error);
            alert("Failed to load work orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkOrders();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const resetForm = () => {
        setForm({
            serviceRequestId: "",
            technicianId: "",
            customerId: 1,
            siteId: 1,
            orderNumber: "",
            title: "",
            priority: "MEDIUM",
            description: "",
            status: "PENDING",
            scheduledDate: "",
            completedDate: "",
            totalCost: ""
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);

        try {

            const workOrder = {
                serviceRequestId:
                    form.serviceRequestId
                        ? Number(form.serviceRequestId)
                        : null,

                technicianId:
                    form.technicianId
                        ? Number(form.technicianId)
                        : null,

                customerId: Number(form.customerId),

                siteId: Number(form.siteId),

                orderNumber: form.orderNumber,

                title: form.title,

                priority: form.priority,

                description: form.description,

                status: form.status,

                scheduledDate:
                    form.scheduledDate
                        ? form.scheduledDate
                        : null,

                completedDate:
                    form.completedDate
                        ? form.completedDate
                        : null,

                totalCost:
                    form.totalCost
                        ? Number(form.totalCost)
                        : 0
            };

            await createWorkOrder(workOrder);

            alert("Work order created successfully!");

            resetForm();

            await loadWorkOrders();

        } catch (error) {

            console.error(
                "Failed to create work order:",
                error
            );

            alert(
                "Failed to create work order.\n\n" +
                error.message
            );

        } finally {
            setSaving(false);
        }
    };

    const statusClass = (status) => {

        switch (status) {

            case "COMPLETED":
                return "status-completed";

            case "IN_PROGRESS":
                return "status-progress";

            case "ASSIGNED":
                return "status-assigned";

            case "CANCELLED":
                return "status-cancelled";

            default:
                return "status-pending";
        }
    };

    const priorityClass = (priority) => {

        switch (priority) {

            case "URGENT":
                return "priority-urgent";

            case "HIGH":
                return "priority-high";

            case "LOW":
                return "priority-low";

            default:
                return "priority-medium";
        }
    };

    return (
        <div className="work-order-page">

            <div className="work-order-header">

                <div>
                    <h1>Work Orders</h1>

                    <p>
                        Create and manage field service work orders
                    </p>
                </div>

                <div className="work-order-count">
                    {workOrders.length} Work Orders
                </div>

            </div>


            {/* CREATE WORK ORDER */}

            <div className="work-order-card">

                <div className="card-title">

                    <h2>Create Work Order</h2>

                    <p>
                        Enter the work order details below
                    </p>

                </div>


                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        <div className="form-group">

                            <label>Customer ID</label>

                            <input
                                type="number"
                                name="customerId"
                                value={form.customerId}
                                onChange={handleChange}
                                min="1"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>Site ID</label>

                            <input
                                type="number"
                                name="siteId"
                                value={form.siteId}
                                onChange={handleChange}
                                min="1"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>Order Number</label>

                            <input
                                name="orderNumber"
                                placeholder="WO-1002"
                                value={form.orderNumber}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>Title</label>

                            <input
                                name="title"
                                placeholder="AC Maintenance"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>Priority</label>

                            <select
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                            >

                                <option value="LOW">
                                    LOW
                                </option>

                                <option value="MEDIUM">
                                    MEDIUM
                                </option>

                                <option value="HIGH">
                                    HIGH
                                </option>

                                <option value="URGENT">
                                    URGENT
                                </option>

                            </select>

                        </div>


                        <div className="form-group">

                            <label>Status</label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >

                                <option value="PENDING">
                                    PENDING
                                </option>

                                <option value="ASSIGNED">
                                    ASSIGNED
                                </option>

                                <option value="IN_PROGRESS">
                                    IN PROGRESS
                                </option>

                                <option value="COMPLETED">
                                    COMPLETED
                                </option>

                                <option value="CANCELLED">
                                    CANCELLED
                                </option>

                            </select>

                        </div>


                        <div className="form-group">

                            <label>Scheduled Date</label>

                            <input
                                type="datetime-local"
                                name="scheduledDate"
                                value={form.scheduledDate}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>Total Cost</label>

                            <input
                                type="number"
                                name="totalCost"
                                placeholder="2500"
                                min="0"
                                step="0.01"
                                value={form.totalCost}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group full-width">

                            <label>Description</label>

                            <textarea
                                name="description"
                                placeholder="Describe the work required..."
                                value={form.description}
                                onChange={handleChange}
                                rows="4"
                            />

                        </div>

                    </div>


                    <div className="form-actions">

                        <button
                            type="submit"
                            className="add-work-order-btn"
                            disabled={saving}
                        >

                            {saving
                                ? "Creating..."
                                : "+ Create Work Order"}

                        </button>

                    </div>

                </form>

            </div>


            {/* WORK ORDER LIST */}

            <div className="work-order-list-section">

                <div className="list-header">

                    <div>

                        <h2>Work Orders</h2>

                        <p>
                            View and manage all work orders
                        </p>

                    </div>

                </div>


                {loading ? (

                    <div className="loading">
                        Loading work orders...
                    </div>

                ) : workOrders.length === 0 ? (

                    <div className="empty-state">

                        <h3>No Work Orders Found</h3>

                        <p>
                            Create your first work order above.
                        </p>

                    </div>

                ) : (

                    <div className="work-order-grid">

                        {workOrders.map((order) => (

                            <div
                                className="work-order-item"
                                key={order.id}
                            >

                                <div className="work-order-top">

                                    <div>

                                        <span className="order-number">
                                            {order.orderNumber}
                                        </span>

                                        <h3>
                                            {order.title}
                                        </h3>

                                    </div>

                                    <span
                                        className={`status-badge ${statusClass(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>

                                </div>


                                <div className="work-order-details">

                                    <p>
                                        <strong>
                                            Customer:
                                        </strong>{" "}
                                        {order.customerId}
                                    </p>

                                    <p>
                                        <strong>
                                            Site:
                                        </strong>{" "}
                                        {order.siteId}
                                    </p>

                                    <p>
                                        <strong>
                                            Priority:
                                        </strong>{" "}

                                        <span
                                            className={`priority-badge ${priorityClass(
                                                order.priority
                                            )}`}
                                        >
                                            {order.priority}
                                        </span>

                                    </p>

                                    <p>
                                        <strong>
                                            Scheduled:
                                        </strong>{" "}
                                        {order.scheduledDate
                                            ? new Date(
                                                order.scheduledDate
                                            ).toLocaleString()
                                            : "Not scheduled"}
                                    </p>

                                    <p>
                                        <strong>
                                            Cost:
                                        </strong>{" "}
                                        ₹
                                        {Number(
                                            order.totalCost || 0
                                        ).toFixed(2)}
                                    </p>

                                    {order.description && (

                                        <p className="description">

                                            <strong>
                                                Description:
                                            </strong>{" "}

                                            {order.description}

                                        </p>

                                    )}

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default WorkOrders;