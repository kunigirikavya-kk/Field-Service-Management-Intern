import { useEffect, useState } from "react";

import {
    getInvoices,
    getWorkOrders,
    createInvoice,
    updateInvoice,
    markInvoiceAsPaid,
    cancelInvoice,
    deleteInvoice
} from "../services/api";

import "./Billing.css";


function Billing() {

    // ================================
    // STATE
    // ================================

    const [invoices, setInvoices] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Invoice details modal
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const [form, setForm] = useState({
        workOrderId: "",
        customerId: "",
        dueDate: "",
        serviceAmount: "",
        taxAmount: "",
        notes: ""
    });


    // ================================
    // LOAD DATA
    // ================================

    useEffect(() => {
        loadBillingData();
    }, []);


    async function loadBillingData() {

        try {

            setLoading(true);

            const [invoiceData, workOrderData] =
                await Promise.all([
                    getInvoices(),
                    getWorkOrders()
                ]);

            setInvoices(
                Array.isArray(invoiceData)
                    ? invoiceData
                    : []
            );

            setWorkOrders(
                Array.isArray(workOrderData)
                    ? workOrderData
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load billing data:",
                error
            );

            alert("Failed to load billing data");

        } finally {

            setLoading(false);
        }
    }


    // ================================
    // FORM CHANGE
    // ================================

    function handleChange(e) {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }


    // ================================
    // WORK ORDER SELECT
    // ================================

    function handleWorkOrderChange(e) {

        const workOrderId = e.target.value;

        const selectedWorkOrder =
            workOrders.find(
                wo =>
                    String(wo.id) ===
                    String(workOrderId)
            );

        setForm(prev => ({
            ...prev,

            workOrderId,

            customerId:
                selectedWorkOrder?.customerId
                    ? String(selectedWorkOrder.customerId)
                    : "",

            serviceAmount:
                selectedWorkOrder?.totalCost != null
                    ? String(selectedWorkOrder.totalCost)
                    : ""
        }));
    }


    // ================================
    // CALCULATE TOTAL
    // ================================

    const serviceAmount =
        Number(form.serviceAmount) || 0;

    const taxAmount =
        Number(form.taxAmount) || 0;

    const totalAmount =
        serviceAmount + taxAmount;


    // ================================
    // CREATE INVOICE
    // ================================

    async function handleSubmit(e) {

        e.preventDefault();

        if (!form.workOrderId) {

            alert("Please select a work order");
            return;
        }

        if (!form.customerId) {

            alert("Please enter Customer ID");
            return;
        }

        if (serviceAmount <= 0) {

            alert("Please enter a valid service amount");
            return;
        }

        try {

            setCreating(true);

            let dueDate = null;

            if (form.dueDate) {

                dueDate =
                    `${form.dueDate}T23:59:59`;
            }


            const invoice = {

                invoiceNumber:
                    `INV-${Date.now()}`,

                workOrderId:
                    Number(form.workOrderId),

                customerId:
                    Number(form.customerId),

                dueDate,

                serviceAmount:
                    serviceAmount,

                taxAmount:
                    taxAmount,

                notes:
                    form.notes,

                status:
                    "UNPAID"
            };


            console.log(
                "Creating invoice:",
                invoice
            );


            const createdInvoice =
                await createInvoice(invoice);


            console.log(
                "Invoice created:",
                createdInvoice
            );


            alert(
                "Invoice created successfully!"
            );


            clearForm();

            await loadBillingData();

        } catch (error) {

            console.error(
                "Invoice creation error:",
                error
            );

            alert(
                `Failed to create invoice: ${
                    error.message
                }`
            );

        } finally {

            setCreating(false);
        }
    }


    // ================================
    // CLEAR FORM
    // ================================

    function clearForm() {

        setForm({
            workOrderId: "",
            customerId: "",
            dueDate: "",
            serviceAmount: "",
            taxAmount: "",
            notes: ""
        });
    }


    // ================================
    // VIEW INVOICE
    // ================================

    function handleViewInvoice(invoice) {

        setSelectedInvoice(invoice);
    }


    // ================================
    // CLOSE INVOICE DETAILS
    // ================================

    function closeInvoiceDetails() {

        setSelectedInvoice(null);
    }


    // ================================
    // MARK AS PAID
    // ================================

    async function handleMarkPaid(id) {

        const confirmed =
            window.confirm(
                "Are you sure you want to mark this invoice as PAID?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await markInvoiceAsPaid(id);

            alert(
                "Invoice marked as PAID successfully!"
            );

            await loadBillingData();

            // Update currently opened invoice
            if (
                selectedInvoice &&
                selectedInvoice.id === id
            ) {

                const updatedInvoice =
                    invoices.find(
                        invoice =>
                            invoice.id === id
                    );

                if (updatedInvoice) {

                    setSelectedInvoice({
                        ...updatedInvoice,
                        status: "PAID"
                    });
                }
            }

        } catch (error) {

            console.error(
                "Failed to mark invoice as paid:",
                error
            );

            alert(
                `Failed to mark invoice as paid: ${
                    error.message
                }`
            );
        }
    }


    // ================================
    // CANCEL INVOICE
    // ================================

    async function handleCancel(id) {

        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this invoice?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await cancelInvoice(id);

            alert(
                "Invoice cancelled successfully!"
            );

            await loadBillingData();

            // Update currently opened invoice
            if (
                selectedInvoice &&
                selectedInvoice.id === id
            ) {

                const updatedInvoice =
                    invoices.find(
                        invoice =>
                            invoice.id === id
                    );

                if (updatedInvoice) {

                    setSelectedInvoice({
                        ...updatedInvoice,
                        status: "CANCELLED"
                    });
                }
            }

        } catch (error) {

            console.error(
                "Failed to cancel invoice:",
                error
            );

            alert(
                `Failed to cancel invoice: ${
                    error.message
                }`
            );
        }
    }


    // ================================
    // DELETE INVOICE
    // ================================

    async function handleDelete(id) {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this invoice?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await deleteInvoice(id);

            alert(
                "Invoice deleted successfully!"
            );

            if (
                selectedInvoice &&
                selectedInvoice.id === id
            ) {

                setSelectedInvoice(null);
            }

            await loadBillingData();

        } catch (error) {

            console.error(
                "Failed to delete invoice:",
                error
            );

            alert(
                `Failed to delete invoice: ${
                    error.message
                }`
            );
        }
    }


    // ================================
    // FORMAT DATE
    // ================================

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
            "en-GB"
        );
    }


    // ================================
    // FORMAT DATE + TIME
    // ================================

    function formatDateTime(date) {

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

        return parsedDate.toLocaleString(
            "en-GB",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    // ================================
    // FORMAT MONEY
    // ================================

    function formatMoney(amount) {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2
            }
        ).format(
            Number(amount) || 0
        );
    }


    // ================================
    // STATUS CLASS
    // ================================

    function getStatusClass(status) {

        switch (status) {

            case "PAID":
                return "status-paid";

            case "UNPAID":
                return "status-unpaid";

            case "OVERDUE":
                return "status-overdue";

            case "CANCELLED":
                return "status-cancelled";

            default:
                return "";
        }
    }


    // ================================
    // STATISTICS
    // ================================

    const totalInvoices =
        invoices.length;

    const paidInvoices =
        invoices.filter(
            invoice =>
                invoice.status === "PAID"
        ).length;

    const unpaidInvoices =
        invoices.filter(
            invoice =>
                invoice.status === "UNPAID" ||
                invoice.status === "OVERDUE"
        ).length;

    const revenue =
        invoices
            .filter(
                invoice =>
                    invoice.status === "PAID"
            )
            .reduce(
                (total, invoice) =>
                    total +
                    (
                        Number(
                            invoice.totalAmount
                        ) || 0
                    ),
                0
            );


    // ================================
    // LOADING
    // ================================

    if (loading) {

        return (
            <div className="billing-page">

                <div className="billing-loading">
                    Loading billing data...
                </div>

            </div>
        );
    }


    // ================================
    // UI
    // ================================

    return (

        <div className="billing-page">

            {/* =====================================
                PAGE HEADER
            ====================================== */}

            <div className="billing-header">

                <div>

                    <h1>
                        Billing Management
                    </h1>

                    <p>
                        Create invoices and manage payments
                    </p>

                </div>

            </div>


            {/* =====================================
                STATISTICS
            ====================================== */}

            <div className="billing-stats">

                {/* TOTAL */}

                <div className="billing-stat-card">

                    <div className="stat-icon invoice-icon">
                        📄
                    </div>

                    <div>

                        <h3>
                            {totalInvoices}
                        </h3>

                        <p>
                            Total Invoices
                        </p>

                    </div>

                </div>


                {/* PAID */}

                <div className="billing-stat-card">

                    <div className="stat-icon paid-icon">
                        ✓
                    </div>

                    <div>

                        <h3>
                            {paidInvoices}
                        </h3>

                        <p>
                            Paid Invoices
                        </p>

                    </div>

                </div>


                {/* UNPAID */}

                <div className="billing-stat-card">

                    <div className="stat-icon unpaid-icon">
                        ⏳
                    </div>

                    <div>

                        <h3>
                            {unpaidInvoices}
                        </h3>

                        <p>
                            Unpaid Invoices
                        </p>

                    </div>

                </div>


                {/* REVENUE */}

                <div className="billing-stat-card">

                    <div className="stat-icon revenue-icon">
                        ₹
                    </div>

                    <div>

                        <h3>
                            {formatMoney(revenue)}
                        </h3>

                        <p>
                            Revenue
                        </p>

                    </div>

                </div>

            </div>


            {/* =====================================
                CREATE INVOICE CARD
            ====================================== */}

            <div className="billing-card">

                <div className="billing-card-header">

                    <h2>
                        Create Invoice
                    </h2>

                    <p>
                        Generate a bill for a completed service
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="invoice-form"
                >

                    {/* ROW 1 */}

                    <div className="invoice-form-grid">

                        {/* WORK ORDER */}

                        <div className="form-group">

                            <label>
                                Work Order
                            </label>

                            <select
                                name="workOrderId"
                                value={form.workOrderId}
                                onChange={
                                    handleWorkOrderChange
                                }
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

                                            {workOrder.orderNumber ||
                                                `WO-${workOrder.id}`}
                                            {" - "}
                                            {workOrder.description ||
                                                "Service Work Order"}

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* CUSTOMER ID */}

                        <div className="form-group">

                            <label>
                                Customer ID
                            </label>

                            <input
                                type="number"
                                name="customerId"
                                value={form.customerId}
                                onChange={handleChange}
                                placeholder="Customer ID"
                                required
                            />

                        </div>


                        {/* DUE DATE */}

                        <div className="form-group">

                            <label>
                                Due Date
                            </label>

                            <input
                                type="date"
                                name="dueDate"
                                value={form.dueDate}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    {/* ROW 2 */}

                    <div className="invoice-form-grid">

                        {/* SERVICE AMOUNT */}

                        <div className="form-group">

                            <label>
                                Service Amount
                            </label>

                            <input
                                type="number"
                                name="serviceAmount"
                                value={form.serviceAmount}
                                onChange={handleChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                            />

                        </div>


                        {/* TAX */}

                        <div className="form-group">

                            <label>
                                Tax Amount
                            </label>

                            <input
                                type="number"
                                name="taxAmount"
                                value={form.taxAmount}
                                onChange={handleChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />

                        </div>


                        {/* TOTAL */}

                        <div className="invoice-total-box">

                            <span>
                                Invoice Total
                            </span>

                            <strong>
                                {formatMoney(totalAmount)}
                            </strong>

                        </div>

                    </div>


                    {/* NOTES */}

                    <div className="form-group notes-group">

                        <label>
                            Notes
                        </label>

                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Add invoice notes..."
                            rows="4"
                        />

                    </div>


                    {/* BUTTONS */}

                    <div className="invoice-form-actions">

                        <button
                            type="submit"
                            className="create-invoice-btn"
                            disabled={creating}
                        >

                            {creating
                                ? "Creating..."
                                : "+ Create Invoice"}

                        </button>


                        <button
                            type="button"
                            className="clear-invoice-btn"
                            onClick={clearForm}
                            disabled={creating}
                        >

                            Clear

                        </button>

                    </div>

                </form>

            </div>


            {/* =====================================
                INVOICES TABLE
            ====================================== */}

            <div className="billing-card invoices-card">

                <div className="billing-card-header">

                    <h2>
                        Invoices
                    </h2>

                    <p>
                        View and manage all invoices
                    </p>

                </div>


                {invoices.length === 0 ? (

                    <div className="empty-invoices">

                        <div className="empty-icon">
                            📄
                        </div>

                        <h3>
                            No invoices yet
                        </h3>

                        <p>
                            Create your first invoice above.
                        </p>

                    </div>

                ) : (

                    <div className="invoice-table-wrapper">

                        <table className="invoice-table">

                            <thead>

                                <tr>

                                    <th>
                                        Invoice
                                    </th>

                                    <th>
                                        Work Order
                                    </th>

                                    <th>
                                        Service Amount
                                    </th>

                                    <th>
                                        Tax
                                    </th>

                                    <th>
                                        Total
                                    </th>

                                    <th>
                                        Due Date
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {invoices.map(
                                    invoice => (

                                        <tr key={invoice.id}>

                                            <td className="invoice-number">

                                                {invoice.invoiceNumber}

                                            </td>


                                            <td>

                                                WO-
                                                {String(
                                                    invoice.workOrderId
                                                ).padStart(
                                                    4,
                                                    "0"
                                                )}

                                            </td>


                                            <td>

                                                {formatMoney(
                                                    invoice.serviceAmount
                                                )}

                                            </td>


                                            <td>

                                                {formatMoney(
                                                    invoice.taxAmount
                                                )}

                                            </td>


                                            <td className="invoice-total">

                                                {formatMoney(
                                                    invoice.totalAmount
                                                )}

                                            </td>


                                            <td>

                                                {formatDate(
                                                    invoice.dueDate
                                                )}

                                            </td>


                                            <td>

                                                <span
                                                    className={`invoice-status ${getStatusClass(
                                                        invoice.status
                                                    )}`}
                                                >

                                                    {invoice.status}

                                                </span>

                                            </td>


                                            <td>

                                                <div className="invoice-actions">

                                                    {/* VIEW */}

                                                    <button
                                                        type="button"
                                                        className="view-invoice-btn"
                                                        onClick={() =>
                                                            handleViewInvoice(
                                                                invoice
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>


                                                    {/* MARK PAID */}

                                                    {invoice.status !==
                                                        "PAID" &&
                                                        invoice.status !==
                                                            "CANCELLED" && (

                                                            <button
                                                                type="button"
                                                                className="mark-paid-btn"
                                                                onClick={() =>
                                                                    handleMarkPaid(
                                                                        invoice.id
                                                                    )
                                                                }
                                                            >
                                                                Mark Paid
                                                            </button>
                                                        )}


                                                    {/* CANCEL */}

                                                    {invoice.status !==
                                                        "PAID" &&
                                                        invoice.status !==
                                                            "CANCELLED" && (

                                                            <button
                                                                type="button"
                                                                className="cancel-invoice-btn"
                                                                onClick={() =>
                                                                    handleCancel(
                                                                        invoice.id
                                                                    )
                                                                }
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}


                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        className="delete-invoice-btn"
                                                        onClick={() =>
                                                            handleDelete(
                                                                invoice.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =====================================
                INVOICE DETAILS MODAL
            ====================================== */}

            {selectedInvoice && (

                <div
                    className="invoice-modal-overlay"
                    onClick={closeInvoiceDetails}
                >

                    <div
                        className="invoice-modal"
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="invoice-modal-header">

                            <div>

                                <div className="invoice-brand">
                                    FIELDSYNC
                                </div>

                                <h2>
                                    Invoice Details
                                </h2>

                                <p>
                                    {selectedInvoice.invoiceNumber}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="invoice-close-btn"
                                onClick={
                                    closeInvoiceDetails
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* INVOICE INFORMATION */}

                        <div className="invoice-details-section">

                            <div className="invoice-detail-grid">

                                <div className="invoice-detail-item">

                                    <span>
                                        Invoice Number
                                    </span>

                                    <strong>
                                        {
                                            selectedInvoice.invoiceNumber
                                        }
                                    </strong>

                                </div>


                                <div className="invoice-detail-item">

                                    <span>
                                        Status
                                    </span>

                                    <strong>

                                        <span
                                            className={`invoice-status ${getStatusClass(
                                                selectedInvoice.status
                                            )}`}
                                        >
                                            {
                                                selectedInvoice.status
                                            }
                                        </span>

                                    </strong>

                                </div>


                                <div className="invoice-detail-item">

                                    <span>
                                        Invoice Date
                                    </span>

                                    <strong>
                                        {formatDateTime(
                                            selectedInvoice.invoiceDate
                                        )}
                                    </strong>

                                </div>


                                <div className="invoice-detail-item">

                                    <span>
                                        Due Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedInvoice.dueDate
                                        )}
                                    </strong>

                                </div>


                                <div className="invoice-detail-item">

                                    <span>
                                        Customer ID
                                    </span>

                                    <strong>
                                        {
                                            selectedInvoice.customerId
                                        }
                                    </strong>

                                </div>


                                <div className="invoice-detail-item">

                                    <span>
                                        Work Order
                                    </span>

                                    <strong>
                                        WO-
                                        {String(
                                            selectedInvoice.workOrderId
                                        ).padStart(
                                            4,
                                            "0"
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* BILLING BREAKDOWN */}

                        <div className="invoice-breakdown">

                            <h3>
                                Billing Summary
                            </h3>


                            <div className="invoice-breakdown-row">

                                <span>
                                    Service Amount
                                </span>

                                <strong>
                                    {formatMoney(
                                        selectedInvoice.serviceAmount
                                    )}
                                </strong>

                            </div>


                            <div className="invoice-breakdown-row">

                                <span>
                                    Tax Amount
                                </span>

                                <strong>
                                    {formatMoney(
                                        selectedInvoice.taxAmount
                                    )}
                                </strong>

                            </div>


                            <div className="invoice-breakdown-total">

                                <span>
                                    Total Amount
                                </span>

                                <strong>
                                    {formatMoney(
                                        selectedInvoice.totalAmount
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* PAYMENT INFORMATION */}

                        {selectedInvoice.paymentDate && (

                            <div className="payment-info">

                                <span>
                                    Payment Date
                                </span>

                                <strong>
                                    {formatDateTime(
                                        selectedInvoice.paymentDate
                                    )}
                                </strong>

                            </div>
                        )}


                        {/* NOTES */}

                        {selectedInvoice.notes && (

                            <div className="invoice-notes">

                                <h3>
                                    Notes
                                </h3>

                                <p>
                                    {selectedInvoice.notes}
                                </p>

                            </div>
                        )}


                        {/* MODAL ACTIONS */}

                        <div className="invoice-modal-actions">

                            {selectedInvoice.status !==
                                "PAID" &&
                                selectedInvoice.status !==
                                    "CANCELLED" && (

                                    <>

                                        <button
                                            type="button"
                                            className="modal-paid-btn"
                                            onClick={() =>
                                                handleMarkPaid(
                                                    selectedInvoice.id
                                                )
                                            }
                                        >
                                            Mark Paid
                                        </button>


                                        <button
                                            type="button"
                                            className="modal-cancel-btn"
                                            onClick={() =>
                                                handleCancel(
                                                    selectedInvoice.id
                                                )
                                            }
                                        >
                                            Cancel Invoice
                                        </button>

                                    </>
                                )}


                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={
                                    closeInvoiceDetails
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}


export default Billing;