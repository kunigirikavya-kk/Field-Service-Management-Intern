
import { useEffect, useState } from "react";

import {
    getInvoices,
    getWorkOrders,
    createInvoice,
    markInvoiceAsPaid,
    cancelInvoice,
    deleteInvoice
} from "../services/api";

import "./Billing.css";


function Billing() {

    // =====================================================
    // STATE
    // =====================================================

    const [invoices, setInvoices] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const [toast, setToast] = useState({
        show: false,
        type: "",
        message: ""
    });

    const [form, setForm] = useState({
        workOrderId: "",
        customerId: "",
        dueDate: "",
        serviceAmount: "",
        taxAmount: "",
        notes: ""
    });


    // =====================================================
    // LOAD DATA
    // =====================================================

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

            showToast(
                "error",
                "Unable to load billing data. Please try again."
            );

        } finally {

            setLoading(false);
        }
    }


    // =====================================================
    // TOAST MESSAGE
    // =====================================================

    function showToast(type, message) {

        setToast({
            show: true,
            type,
            message
        });

        setTimeout(() => {

            setToast({
                show: false,
                type: "",
                message: ""
            });

        }, 3500);
    }


    // =====================================================
    // FORM CHANGE
    // =====================================================

    function handleChange(e) {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }


    // =====================================================
    // WORK ORDER CHANGE
    // =====================================================

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


    // =====================================================
    // CALCULATE TOTAL
    // =====================================================

    const serviceAmount =
        Number(form.serviceAmount) || 0;

    const taxAmount =
        Number(form.taxAmount) || 0;

    const totalAmount =
        serviceAmount + taxAmount;


    // =====================================================
    // CREATE INVOICE
    // =====================================================

    async function handleSubmit(e) {

        e.preventDefault();

        if (!form.workOrderId) {

            showToast(
                "warning",
                "Please select a work order."
            );

            return;
        }

        if (!form.customerId) {

            showToast(
                "warning",
                "Please enter a customer ID."
            );

            return;
        }

        if (serviceAmount <= 0) {

            showToast(
                "warning",
                "Please enter a valid service amount."
            );

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

                serviceAmount,

                taxAmount,

                notes:
                    form.notes,

                status:
                    "UNPAID"
            };


            await createInvoice(invoice);

clearForm();

await loadBillingData();

showToast(
    "success",
    "Invoice created successfully."
);

        } catch (error) {

            console.error(
                "Invoice creation error:",
                error
            );

            showToast(
                "error",
                `Failed to create invoice: ${
                    error.message || "Unknown error"
                }`
            );

        } finally {

            setCreating(false);
        }
    }


    // =====================================================
    // CLEAR FORM
    // =====================================================

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


    // =====================================================
    // VIEW INVOICE
    // =====================================================

    function handleViewInvoice(invoice) {

        setSelectedInvoice(invoice);
    }


    // =====================================================
    // CLOSE MODAL
    // =====================================================

    function closeInvoiceDetails() {

        setSelectedInvoice(null);
    }


    // =====================================================
    // MARK PAID
    // =====================================================

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

            showToast(
                "success",
                "Invoice marked as paid successfully."
            );

            await loadBillingData();

            if (
                selectedInvoice &&
                selectedInvoice.id === id
            ) {

                setSelectedInvoice(prev => ({
                    ...prev,
                    status: "PAID",
                    paymentDate: new Date().toISOString()
                }));
            }

        } catch (error) {

            console.error(
                "Failed to mark invoice as paid:",
                error
            );

            showToast(
                "error",
                `Failed to mark invoice as paid: ${
                    error.message || "Unknown error"
                }`
            );
        }
    }


    // =====================================================
    // CANCEL INVOICE
    // =====================================================

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

            showToast(
                "success",
                "Invoice cancelled successfully."
            );

            await loadBillingData();

            if (
                selectedInvoice &&
                selectedInvoice.id === id
            ) {

                setSelectedInvoice(prev => ({
                    ...prev,
                    status: "CANCELLED"
                }));
            }

        } catch (error) {

            console.error(
                "Failed to cancel invoice:",
                error
            );

            showToast(
                "error",
                `Failed to cancel invoice: ${
                    error.message || "Unknown error"
                }`
            );
        }
    }


    // =====================================================
    // DELETE INVOICE
    // =====================================================

    async function handleDelete(id) {

        const confirmed =
            window.confirm(
                "Are you sure you want to permanently delete this invoice?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await deleteInvoice(id);

            showToast(
                "success",
                "Invoice deleted successfully."
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

            showToast(
                "error",
                `Failed to delete invoice: ${
                    error.message || "Unknown error"
                }`
            );
        }
    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

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


    // =====================================================
    // FORMAT DATE TIME
    // =====================================================

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
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    // =====================================================
    // FORMAT MONEY
    // =====================================================

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


    // =====================================================
    // STATUS CLASS
    // =====================================================

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


    // =====================================================
    // STATUS ICON
    // =====================================================

    function getStatusIcon(status) {

        switch (status) {

            case "PAID":
                return "✓";

            case "UNPAID":
                return "◷";

            case "OVERDUE":
                return "!";

            case "CANCELLED":
                return "×";

            default:
                return "•";
        }
    }


    // =====================================================
    // STATISTICS
    // =====================================================

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


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="billing-page">

                <div className="billing-loading-screen">

                    <div className="billing-loading-art">
                        ◇
                    </div>

                    <div className="billing-loading-title">
                        Preparing Billing
                    </div>

                    <div className="billing-loading-text">
                        Loading invoices and payment information...
                    </div>

                    <div className="billing-loader">
                        <span></span>
                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="billing-page">

            {/* =================================================
                TOAST
            ================================================= */}

            {toast.show && (

                <div
                    className={`billing-toast toast-${toast.type}`}
                >

                    <div className="toast-symbol">

                        {toast.type === "success" && "✓"}

                        {toast.type === "error" && "!"}

                        {toast.type === "warning" && "!"}

                    </div>

                    <div className="toast-message">
                        {toast.message}
                    </div>

                    <button
                        type="button"
                        className="toast-close"
                        onClick={() =>
                            setToast({
                                show: false,
                                type: "",
                                message: ""
                            })
                        }
                    >
                        ×
                    </button>

                </div>
            )}


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="billing-header">

                <div className="billing-title-area">

                    <div className="billing-art-mark">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <div>

                        <div className="billing-eyebrow">
                            FINANCE • FIELDSYNC
                        </div>

                        <h1>
                            Billing Management
                        </h1>

                        <p>
                            Create invoices, track payments and manage your service revenue.
                        </p>

                    </div>

                </div>

                <div className="billing-header-decoration">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="billing-stats">

                <div className="billing-stat-card">

                    <div className="stat-art stat-art-blue">
                        <span>▤</span>
                    </div>

                    <div className="stat-content">

                        <span className="stat-label">
                            TOTAL INVOICES
                        </span>

                        <h3>
                            {totalInvoices}
                        </h3>

                        <span className="stat-caption">
                            All generated bills
                        </span>

                    </div>

                </div>


                <div className="billing-stat-card">

                    <div className="stat-art stat-art-green">
                        <span>✓</span>
                    </div>

                    <div className="stat-content">

                        <span className="stat-label">
                            PAID INVOICES
                        </span>

                        <h3>
                            {paidInvoices}
                        </h3>

                        <span className="stat-caption">
                            Successfully collected
                        </span>

                    </div>

                </div>


                <div className="billing-stat-card">

                    <div className="stat-art stat-art-orange">
                        <span>◷</span>
                    </div>

                    <div className="stat-content">

                        <span className="stat-label">
                            OUTSTANDING
                        </span>

                        <h3>
                            {unpaidInvoices}
                        </h3>

                        <span className="stat-caption">
                            Awaiting payment
                        </span>

                    </div>

                </div>


                <div className="billing-stat-card">

                    <div className="stat-art stat-art-purple">
                        <span>₹</span>
                    </div>

                    <div className="stat-content">

                        <span className="stat-label">
                            PAID REVENUE
                        </span>

                        <h3 className="revenue-value">
                            {formatMoney(revenue)}
                        </h3>

                        <span className="stat-caption">
                            Revenue collected
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                CREATE INVOICE
            ================================================= */}

            <div className="billing-card create-billing-card">

                <div className="billing-card-header">

                    <div className="section-icon">
                        +
                    </div>

                    <div>

                        <h2>
                            Create Invoice
                        </h2>

                        <p>
                            Generate a professional bill for a completed service.
                        </p>

                    </div>

                    <div className="section-shape">
                        ◆
                    </div>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="invoice-form"
                >

                    {/* ROW 1 */}

                    <div className="invoice-form-grid">

                        <div className="form-group">

                            <label>
                                Work Order
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    #
                                </span>

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
                                                {" — "}
                                                {workOrder.description ||
                                                    "Service Work Order"}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Customer ID
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ◉
                                </span>

                                <input
                                    type="number"
                                    name="customerId"
                                    value={form.customerId}
                                    onChange={handleChange}
                                    placeholder="Enter customer ID"
                                    required
                                />

                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Due Date
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    □
                                </span>

                                <input
                                    type="date"
                                    name="dueDate"
                                    value={form.dueDate}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                    </div>


                    {/* ROW 2 */}

                    <div className="invoice-form-grid">

                        <div className="form-group">

                            <label>
                                Service Amount
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ₹
                                </span>

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

                        </div>


                        <div className="form-group">

                            <label>
                                Tax Amount
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    %
                                </span>

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

                        </div>


                        <div className="invoice-total-box">

                            <div className="total-art">
                                ◆
                            </div>

                            <div>

                                <span>
                                    INVOICE TOTAL
                                </span>

                                <strong>
                                    {formatMoney(totalAmount)}
                                </strong>

                            </div>

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
                            placeholder="Add additional invoice notes, service details or payment instructions..."
                            rows="4"
                        />

                    </div>


                    {/* BUTTONS */}

                    <div className="invoice-form-actions">

                        <button
                            type="button"
                            className="clear-invoice-btn"
                            onClick={clearForm}
                            disabled={creating}
                        >
                            <span>↺</span>
                            Clear Form
                        </button>

                        <button
                            type="submit"
                            className="create-invoice-btn"
                            disabled={creating}
                        >

                            <span className="button-symbol">
                                {creating ? "…" : "＋"}
                            </span>

                            {creating
                                ? "Creating Invoice..."
                                : "Create Invoice"}

                        </button>

                    </div>

                </form>

            </div>


            {/* =================================================
                INVOICES
            ================================================= */}

            <div className="billing-card invoices-card">

                <div className="billing-card-header">

                    <div className="section-icon invoice-section-icon">
                        ▤
                    </div>

                    <div>

                        <h2>
                            Invoice Ledger
                        </h2>

                        <p>
                            View and manage every generated invoice.
                        </p>

                    </div>

                    <div className="invoice-count-badge">
                        {totalInvoices} Records
                    </div>

                </div>


                {invoices.length === 0 ? (

                    <div className="empty-invoices">

                        <div className="empty-art">

                            <div>□</div>
                            <span></span>
                            <span></span>

                        </div>

                        <h3>
                            No invoices yet
                        </h3>

                        <p>
                            Your generated invoices will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="invoice-table-scroll">

                        <table className="invoice-table">

                            <thead>

                                <tr>

                                    <th>INVOICE</th>

                                    <th>WORK ORDER</th>

                                    <th>SERVICE</th>

                                    <th>TAX</th>

                                    <th>TOTAL</th>

                                    <th>DUE DATE</th>

                                    <th>STATUS</th>

                                    <th>ACTIONS</th>

                                </tr>

                            </thead>


                            <tbody>

                                {invoices.map(
                                    invoice => (

                                        <tr key={invoice.id}>

                                            <td>

                                                <div className="invoice-number-cell">

                                                    <div className="invoice-mini-icon">
                                                        ◇
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {invoice.invoiceNumber}
                                                        </strong>

                                                        <span>
                                                            #{invoice.id}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <span className="work-order-chip">

                                                    WO-
                                                    {String(
                                                        invoice.workOrderId
                                                    ).padStart(
                                                        4,
                                                        "0"
                                                    )}

                                                </span>

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

                                                <span className="due-date-text">

                                                    {formatDate(
                                                        invoice.dueDate
                                                    )}

                                                </span>

                                            </td>


                                            <td>

                                                <span
                                                    className={`invoice-status ${getStatusClass(
                                                        invoice.status
                                                    )}`}
                                                >

                                                    <span className="status-dot">

                                                        {getStatusIcon(
                                                            invoice.status
                                                        )}

                                                    </span>

                                                    {invoice.status}

                                                </span>

                                            </td>


                                            <td>

                                                <div className="invoice-actions">

                                                    <button
                                                        type="button"
                                                        className="action-view"
                                                        onClick={() =>
                                                            handleViewInvoice(
                                                                invoice
                                                            )
                                                        }
                                                        title="View invoice"
                                                    >
                                                        <span>⌕</span>
                                                        View
                                                    </button>


                                                    {invoice.status !==
                                                        "PAID" &&
                                                        invoice.status !==
                                                            "CANCELLED" && (

                                                            <button
                                                                type="button"
                                                                className="action-paid"
                                                                onClick={() =>
                                                                    handleMarkPaid(
                                                                        invoice.id
                                                                    )
                                                                }
                                                                title="Mark as paid"
                                                            >
                                                                <span>✓</span>
                                                                Paid
                                                            </button>

                                                        )}


                                                    {invoice.status !==
                                                        "PAID" &&
                                                        invoice.status !==
                                                            "CANCELLED" && (

                                                            <button
                                                                type="button"
                                                                className="action-cancel"
                                                                onClick={() =>
                                                                    handleCancel(
                                                                        invoice.id
                                                                    )
                                                                }
                                                                title="Cancel invoice"
                                                            >
                                                                <span>×</span>
                                                                Cancel
                                                            </button>

                                                        )}


                                                    <button
                                                        type="button"
                                                        className="action-delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                invoice.id
                                                            )
                                                        }
                                                        title="Delete invoice"
                                                    >
                                                        <span>⌫</span>
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


            {/* =================================================
                INVOICE DETAILS MODAL
            ================================================= */}

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

                        <div className="invoice-modal-header">

                            <div className="modal-title-area">

                                <div className="modal-brand-mark">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>

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

                            </div>


                            <button
                                type="button"
                                className="invoice-close-btn"
                                onClick={
                                    closeInvoiceDetails
                                }
                                aria-label="Close invoice"
                            >
                                ×
                            </button>

                        </div>


                        {/* DETAILS */}

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

                                            <span className="status-dot">
                                                {getStatusIcon(
                                                    selectedInvoice.status
                                                )}
                                            </span>

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

                            <div className="breakdown-title">

                                <span className="breakdown-icon">
                                    ₹
                                </span>

                                <h3>
                                    Billing Summary
                                </h3>

                            </div>


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


                        {/* PAYMENT */}

                        {selectedInvoice.paymentDate && (

                            <div className="payment-info">

                                <div className="payment-icon">
                                    ✓
                                </div>

                                <div>

                                    <span>
                                        PAYMENT RECEIVED
                                    </span>

                                    <strong>
                                        {formatDateTime(
                                            selectedInvoice.paymentDate
                                        )}
                                    </strong>

                                </div>

                            </div>
                        )}


                        {/* NOTES */}

                        {selectedInvoice.notes && (

                            <div className="invoice-notes">

                                <div className="notes-icon">
                                    ✦
                                </div>

                                <div>

                                    <h3>
                                        Notes
                                    </h3>

                                    <p>
                                        {selectedInvoice.notes}
                                    </p>

                                </div>

                            </div>
                        )}


                        {/* ACTIONS */}

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
                                            ✓ Mark Paid
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
                                            × Cancel Invoice
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

