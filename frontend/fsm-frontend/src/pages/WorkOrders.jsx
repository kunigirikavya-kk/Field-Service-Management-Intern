

import { useEffect, useState } from "react";

import {
    getWorkOrders,
    getWorkOrdersByTechnician,
    getWorkOrdersByCustomer,
    createWorkOrder,
    getServiceRequests,
    getTechnicians,
    getTechnicianByUserId,
    getSites,
    assignTechnician
} from "../services/api";

import "./WorkOrders.css";


function WorkOrders() {

    // =====================================================
    // LOGGED-IN USER
    // =====================================================

    let currentUser = null;

    try {

        const storedUser =
            localStorage.getItem("fieldsyncUser");

        currentUser =
            storedUser
                ? JSON.parse(storedUser)
                : null;

    } catch (error) {

        console.error(
            "Unable to read logged-in user:",
            error
        );

    }


    const userRole =
        String(
            currentUser?.role || ""
        ).toUpperCase();


    const userId =
        currentUser?.id;


    const isTechnician =
        userRole === "TECHNICIAN";


    const isCustomer =
        userRole === "CUSTOMER";


    const canManageWorkOrders =
        userRole === "DISPATCHER" ||
        userRole === "MANAGER";


    // =====================================================
    // STATE
    // =====================================================

    const [workOrders, setWorkOrders] =
        useState([]);

    const [serviceRequests, setServiceRequests] =
        useState([]);

    const [technicians, setTechnicians] =
        useState([]);

    const [sites, setSites] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [assigningId, setAssigningId] =
        useState(null);

    const [selectedTechnicians, setSelectedTechnicians] =
        useState({});


    // =====================================================
    // FORM
    // =====================================================

    const [form, setForm] = useState({

        serviceRequestId: "",
        technicianId: "",
        customerId: "",
        siteId: "",
        orderNumber: "",
        title: "",
        priority: "MEDIUM",
        description: "",
        status: "PENDING",
        scheduledDate: "",
        completedDate: "",
        totalCost: "",
        serviceLocation: ""

    });


    // =====================================================
    // LOAD WORK ORDERS
    // =====================================================

    const loadWorkOrders = async () => {

        try {

            let data;


            // ---------------------------------------------
            // TECHNICIAN
            // ---------------------------------------------

            if (isTechnician) {

                if (!userId) {

                    throw new Error(
                        "Logged-in technician user ID not found."
                    );

                }


                const technician =
                    await getTechnicianByUserId(
                        userId
                    );


                console.log(
                    "👨‍🔧 LOGGED-IN TECHNICIAN:",
                    technician
                );


                const technicianId =
                    technician?.id;


                if (!technicianId) {

                    throw new Error(
                        "Technician record not found."
                    );

                }


                console.log(
                    "👨‍🔧 TECHNICIAN ID:",
                    technicianId
                );


                data =
                    await getWorkOrdersByTechnician(
                        technicianId
                    );

            }

            // ---------------------------------------------
            // CUSTOMER
            // ---------------------------------------------

            else if (isCustomer) {

                if (!userId) {

                    throw new Error(
                        "Logged-in customer user ID not found."
                    );

                }


                data =
                    await getWorkOrdersByCustomer(
                        userId
                    );

            }

            // ---------------------------------------------
            // DISPATCHER / MANAGER
            // ---------------------------------------------

            else {

                data =
                    await getWorkOrders();

            }


            setWorkOrders(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load work orders:",
                error
            );

            alert(
                "Failed to load work orders.\n\n" +
                error.message
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // LOAD SERVICE REQUESTS
    // =====================================================

    const loadServiceRequests = async () => {

        // Technicians and customers must not load
        // the global service-request list.

        if (
            isTechnician ||
            isCustomer
        ) {

            setServiceRequests([]);

            return;

        }


        try {

            const data =
                await getServiceRequests();


            console.log(
                "Service Requests:",
                data
            );


            setServiceRequests(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load service requests:",
                error
            );

            setServiceRequests([]);

        }

    };


    // =====================================================
    // LOAD TECHNICIANS
    // =====================================================

    const loadTechnicians = async () => {

        // Technicians and customers must not load
        // the global technician list.

        if (
            isTechnician ||
            isCustomer
        ) {

            setTechnicians([]);

            return;

        }


        try {

            const data =
                await getTechnicians();


            console.log(
                "Technicians:",
                data
            );


            setTechnicians(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load technicians:",
                error
            );

            setTechnicians([]);

        }

    };


    // =====================================================
    // LOAD SITES
    // =====================================================

    const loadSites = async (customerId) => {

        if (!customerId) {

            setSites([]);

            return;

        }


        try {

            const data =
                await getSites(customerId);


            console.log(
                "Sites:",
                data
            );


            setSites(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load sites:",
                error
            );

            setSites([]);

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadWorkOrders();
        loadServiceRequests();
        loadTechnicians();

    }, []);


    // =====================================================
    // HANDLE SERVICE REQUEST
    // =====================================================

    const handleServiceRequestChange =
        async (event) => {

            const serviceRequestId =
                event.target.value;


            if (!serviceRequestId) {

                setForm({

                    serviceRequestId: "",
                    technicianId: "",
                    customerId: "",
                    siteId: "",
                    orderNumber: "",
                    title: "",
                    priority: "MEDIUM",
                    description: "",
                    status: "PENDING",
                    scheduledDate: "",
                    completedDate: "",
                    totalCost: "",
                    serviceLocation: ""

                });

                setSites([]);

                return;

            }


            const selectedRequest =
                serviceRequests.find(
                    request =>
                        String(request.id) ===
                        String(serviceRequestId)
                );


            if (!selectedRequest) {

                return;

            }


            let scheduledDate = "";


            if (selectedRequest.preferredDate) {

                scheduledDate =
                    `${selectedRequest.preferredDate}T09:00`;

            }


            setForm({

                serviceRequestId:
                    selectedRequest.id,

                technicianId: "",

                customerId:
                    selectedRequest.customerId || "",

                siteId: "",

                orderNumber: "",

                title:
                    selectedRequest.title ||
                    selectedRequest.serviceType ||
                    "",

                priority:
                    selectedRequest.priority ||
                    "MEDIUM",

                description:
                    selectedRequest.description ||
                    "",

                status: "PENDING",

                scheduledDate,

                completedDate: "",

                totalCost: "",

                serviceLocation:
                    selectedRequest.serviceLocation ||
                    ""

            });


            if (selectedRequest.customerId) {

                await loadSites(
                    selectedRequest.customerId
                );

            }

        };


    // =====================================================
    // HANDLE NORMAL INPUT
    // =====================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setForm(previous => ({

            ...previous,
            [name]: value

        }));

    };


    // =====================================================
    // RESET FORM
    // =====================================================

    const resetForm = () => {

        setForm({

            serviceRequestId: "",
            technicianId: "",
            customerId: "",
            siteId: "",
            orderNumber: "",
            title: "",
            priority: "MEDIUM",
            description: "",
            status: "PENDING",
            scheduledDate: "",
            completedDate: "",
            totalCost: "",
            serviceLocation: ""

        });

        setSites([]);

    };


    // =====================================================
    // CREATE WORK ORDER
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        if (!canManageWorkOrders) {

            alert(
                "You do not have permission to create work orders."
            );

            return;

        }


        if (!form.serviceRequestId) {

            alert(
                "Please select a Service Request."
            );

            return;

        }


        if (!form.customerId) {

            alert(
                "Customer information is missing."
            );

            return;

        }


        if (!form.siteId) {

            alert(
                "Please select a site."
            );

            return;

        }


        setSaving(true);


        try {

            const workOrder = {

                serviceRequestId:
                    Number(form.serviceRequestId),

                technicianId:
                    form.technicianId
                        ? Number(form.technicianId)
                        : null,

                customerId:
                    Number(form.customerId),

                siteId:
                    Number(form.siteId),

                orderNumber:
                    form.orderNumber,

                title:
                    form.title,

                priority:
                    form.priority,

                description:
                    form.description,

                status:
                    form.status,

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


            console.log(
                "Creating Work Order:",
                workOrder
            );


            await createWorkOrder(
                workOrder
            );


            alert(
                "Work order created successfully! 🎉"
            );


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


    // =====================================================
    // ASSIGN TECHNICIAN
    // =====================================================

    const handleAssignTechnician = async (
        workOrderId
    ) => {

        if (!canManageWorkOrders) {

            alert(
                "You do not have permission to assign technicians."
            );

            return;

        }


        const technicianId =
            selectedTechnicians[workOrderId];


        if (!technicianId) {

            alert(
                "Please select a technician first."
            );

            return;

        }


        setAssigningId(workOrderId);


        try {

            console.log(
                "Assigning technician:",
                {
                    workOrderId,
                    technicianId
                }
            );


            await assignTechnician(
                workOrderId,
                Number(technicianId)
            );


            alert(
                "Technician assigned successfully! 🎉"
            );


            await loadWorkOrders();


            setSelectedTechnicians(
                previous => ({

                    ...previous,

                    [workOrderId]: ""

                })
            );


        } catch (error) {

            console.error(
                "Failed to assign technician:",
                error
            );


            alert(
                "Failed to assign technician.\n\n" +
                error.message
            );

        } finally {

            setAssigningId(null);

        }

    };


    // =====================================================
    // TECHNICIAN NAME
    // =====================================================

    const getTechnicianName = (
        technicianId
    ) => {

        if (!technicianId) {

            return "Unassigned";

        }


        const technician =
            technicians.find(
                item =>
                    String(item.id) ===
                    String(technicianId)
            );


        if (!technician) {

            return `Technician ${technicianId}`;

        }


        return (
            technician.name ||
            technician.fullName ||
            technician.username ||
            `Technician ${technician.id}`
        );

    };


    // =====================================================
    // STATUS CLASS
    // =====================================================

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


    // =====================================================
    // PRIORITY CLASS
    // =====================================================

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


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {

            return "Not scheduled";

        }


        return new Date(
            date
        ).toLocaleString(
            "en-IN"
        );

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="work-order-page">


            {/* HEADER */}

            <div className="work-order-header">

                <div>

                    <h1>
                        Work Orders
                    </h1>

                    <p>

                        {isTechnician
                            ? "View work orders assigned to you"
                            : isCustomer
                                ? "View your work orders"
                                : "Create and manage field service work orders"}

                    </p>

                </div>


                <div className="work-order-count">

                    {workOrders.length} Work Orders

                </div>

            </div>


            {/* CREATE WORK ORDER */}

            {canManageWorkOrders && (

                <div className="work-order-card">

                    <div className="card-title">

                        <h2>
                            Create Work Order
                        </h2>

                        <p>
                            Create a work order from a service request
                        </p>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">


                            {/* SERVICE REQUEST */}

                            <div className="form-group full-width">

                                <label>
                                    Service Request
                                </label>

                                <select
                                    name="serviceRequestId"
                                    value={
                                        form.serviceRequestId
                                    }
                                    onChange={
                                        handleServiceRequestChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Service Request
                                    </option>

                                    {serviceRequests.map(
                                        request => (

                                            <option
                                                key={
                                                    request.id
                                                }
                                                value={
                                                    request.id
                                                }
                                            >

                                                #{request.id} -{" "}

                                                {
                                                    request.title ||
                                                    request.serviceType
                                                }

                                                {" - Customer "}

                                                {
                                                    request.customerId
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* CUSTOMER */}

                            <div className="form-group">

                                <label>
                                    Customer ID
                                </label>

                                <input
                                    type="number"
                                    name="customerId"
                                    value={
                                        form.customerId
                                    }
                                    readOnly
                                />

                            </div>


                            {/* SITE */}

                            <div className="form-group">

                                <label>
                                    Site
                                </label>

                                <select
                                    name="siteId"
                                    value={
                                        form.siteId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={
                                        !form.customerId
                                    }
                                >

                                    <option value="">
                                        Select Site
                                    </option>

                                    {sites.map(
                                        site => (

                                            <option
                                                key={
                                                    site.id
                                                }
                                                value={
                                                    site.id
                                                }
                                            >

                                                {
                                                    site.siteName ||
                                                    site.name ||
                                                    `Site ${site.id}`
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
                                    value={
                                        form.technicianId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">
                                        Unassigned
                                    </option>

                                    {technicians.map(
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
                                                    technician.name ||
                                                    technician.fullName ||
                                                    technician.username ||
                                                    `Technician ${technician.id}`
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* ORDER NUMBER */}

                            <div className="form-group">

                                <label>
                                    Order Number
                                </label>

                                <input
                                    name="orderNumber"
                                    placeholder="WO-1004"
                                    value={
                                        form.orderNumber
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* TITLE */}

                            <div className="form-group">

                                <label>
                                    Title
                                </label>

                                <input
                                    name="title"
                                    value={
                                        form.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* SERVICE LOCATION */}

                            <div className="form-group">

                                <label>
                                    Service Location
                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.serviceLocation
                                    }
                                    readOnly
                                />

                            </div>


                            {/* PRIORITY */}

                            <div className="form-group">

                                <label>
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={
                                        form.priority
                                    }
                                    onChange={
                                        handleChange
                                    }
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


                            {/* STATUS */}

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


                            {/* SCHEDULED DATE */}

                            <div className="form-group">

                                <label>
                                    Scheduled Date
                                </label>

                                <input
                                    type="datetime-local"
                                    name="scheduledDate"
                                    value={
                                        form.scheduledDate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* TOTAL COST */}

                            <div className="form-group">

                                <label>
                                    Total Cost
                                </label>

                                <input
                                    type="number"
                                    name="totalCost"
                                    placeholder="2500"
                                    min="0"
                                    step="0.01"
                                    value={
                                        form.totalCost
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group full-width">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="4"
                                    placeholder="Describe the work required..."
                                />

                            </div>

                        </div>


                        <div className="form-actions">

                            <button
                                type="submit"
                                className="add-work-order-btn"
                                disabled={
                                    saving
                                }
                            >

                                {saving
                                    ? "Creating..."
                                    : "+ Create Work Order"}

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* WORK ORDER LIST */}

            <div className="work-order-list-section">

                <div className="list-header">

                    <div>

                        <h2>
                            {isTechnician
                                ? "My Assigned Work Orders"
                                : isCustomer
                                    ? "My Work Orders"
                                    : "Work Orders"}
                        </h2>

                        <p>

                            {isTechnician
                                ? "Work orders currently assigned to you"
                                : isCustomer
                                    ? "Work orders associated with your account"
                                    : "View and manage all work orders"}

                        </p>

                    </div>

                </div>


                {loading ? (

                    <div className="loading">
                        Loading work orders...
                    </div>

                ) : workOrders.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No Work Orders Found
                        </h3>

                        <p>

                            {isTechnician
                                ? "You currently have no assigned work orders."
                                : isCustomer
                                    ? "You currently have no work orders."
                                    : "Create your first work order above."}

                        </p>

                    </div>

                ) : (

                    <div className="work-order-grid">

                        {workOrders.map(
                            order => {

                                const isAssigned =
                                    Boolean(
                                        order.technicianId
                                    );


                                return (

                                    <div
                                        className="work-order-item"
                                        key={
                                            order.id
                                        }
                                    >

                                        <div className="work-order-top">

                                            <div>

                                                <span className="order-number">

                                                    {
                                                        order.orderNumber
                                                    }

                                                </span>

                                                <h3>

                                                    {
                                                        order.title ||
                                                        "Work Order"
                                                    }

                                                </h3>

                                            </div>


                                            <span
                                                className={`status-badge ${statusClass(
                                                    order.status
                                                )}`}
                                            >

                                                {
                                                    order.status
                                                }

                                            </span>

                                        </div>


                                        <div className="work-order-details">


                                            <p>

                                                <strong>
                                                    Service Request:
                                                </strong>{" "}

                                                {order.serviceRequestId
                                                    ? `#${order.serviceRequestId}`
                                                    : "N/A"}

                                            </p>


                                            <p>

                                                <strong>
                                                    Customer:
                                                </strong>{" "}

                                                {
                                                    order.customerId
                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Site:
                                                </strong>{" "}

                                                {
                                                    order.siteId
                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Technician:
                                                </strong>{" "}

                                                {
                                                    getTechnicianName(
                                                        order.technicianId
                                                    )
                                                }

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

                                                    {
                                                        order.priority
                                                    }

                                                </span>

                                            </p>


                                            <p>

                                                <strong>
                                                    Scheduled:
                                                </strong>{" "}

                                                {
                                                    formatDate(
                                                        order.scheduledDate
                                                    )
                                                }

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

                                                    {
                                                        order.description
                                                    }

                                                </p>

                                            )}


                                            {/* ASSIGN TECHNICIAN */}

                                            {canManageWorkOrders && (

                                                <div className="assign-technician-section">

                                                    <label>

                                                        {isAssigned
                                                            ? "Change Technician"
                                                            : "Assign Technician"}

                                                    </label>


                                                    <div className="assign-technician-controls">

                                                        <select
                                                            value={
                                                                selectedTechnicians[
                                                                    order.id
                                                                ] || ""
                                                            }
                                                            onChange={
                                                                event =>
                                                                    setSelectedTechnicians(
                                                                        previous => ({

                                                                            ...previous,

                                                                            [order.id]:
                                                                                event.target.value

                                                                        })
                                                                    )
                                                            }
                                                            disabled={
                                                                assigningId ===
                                                                order.id
                                                            }
                                                        >

                                                            <option value="">
                                                                Select Technician
                                                            </option>


                                                            {technicians.map(
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
                                                                            technician.name ||
                                                                            technician.fullName ||
                                                                            technician.username ||
                                                                            `Technician ${technician.id}`
                                                                        }

                                                                    </option>

                                                                )
                                                            )}

                                                        </select>


                                                        <button
                                                            type="button"
                                                            className="assign-technician-btn"
                                                            onClick={() =>
                                                                handleAssignTechnician(
                                                                    order.id
                                                                )
                                                            }
                                                            disabled={
                                                                assigningId ===
                                                                order.id
                                                            }
                                                        >

                                                            {assigningId ===
                                                            order.id

                                                                ? "Assigning..."

                                                                : isAssigned

                                                                    ? "Reassign"

                                                                    : "Assign"}

                                                        </button>

                                                    </div>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>

        </div>

    );

}


export default WorkOrders;

