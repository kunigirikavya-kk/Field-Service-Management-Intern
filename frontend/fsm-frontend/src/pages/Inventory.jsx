
import { useEffect, useState } from "react";

import {
    getInventoryParts,
    createInventoryPart,
    updateInventoryPart,
    deleteInventoryPart,
    updateInventoryStock
} from "../services/api";

import "./Inventory.css";


function Inventory() {

    // =====================================================
    // USER ROLE
    // =====================================================

    const storedUser = localStorage.getItem("fieldsyncUser");

    let currentUser = null;

    try {
        currentUser = storedUser
            ? JSON.parse(storedUser)
            : null;
    } catch {
        currentUser = null;
    }

    const userRole = currentUser?.role
        ? currentUser.role.toUpperCase()
        : "CUSTOMER";

    const isManager = userRole === "MANAGER";
    const isTechnician = userRole === "TECHNICIAN";


    // =====================================================
    // STATE
    // =====================================================

    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    const [notification, setNotification] = useState({
        type: "",
        message: ""
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [stockFilter, setStockFilter] = useState("ALL");

    const [form, setForm] = useState({
        partNumber: "",
        partName: "",
        category: "",
        quantity: "",
        minimumStock: "",
        unitPrice: "",
        supplier: ""
    });


    // =====================================================
    // LOAD INVENTORY
    // =====================================================

    useEffect(() => {
        loadInventory();
    }, []);


    async function loadInventory() {

        try {

            setLoading(true);

            const data = await getInventoryParts();

            setParts(data || []);

        } catch (error) {

            console.error("Failed to load inventory:", error);

            if (error?.response?.status === 403) {

                showNotification(
                    "error",
                    "You don't have permission to view inventory."
                );

            } else {

                showNotification(
                    "error",
                    "Unable to load inventory. Please try again."
                );
            }

        } finally {

            setLoading(false);
        }
    }


    // =====================================================
    // NOTIFICATION
    // =====================================================

    function showNotification(type, message) {

        setNotification({
            type,
            message
        });

        setTimeout(() => {

            setNotification({
                type: "",
                message: ""
            });

        }, 4000);
    }


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    function handleChange(event) {

        const {
            name,
            value
        } = event.target;

        setForm(previous => ({
            ...previous,
            [name]: value
        }));
    }


    // =====================================================
    // RESET FORM
    // =====================================================

    function resetForm() {

        setForm({
            partNumber: "",
            partName: "",
            category: "",
            quantity: "",
            minimumStock: "",
            unitPrice: "",
            supplier: ""
        });

        setEditingId(null);
    }


    // =====================================================
    // CREATE / UPDATE
    // MANAGER ONLY
    // =====================================================

    async function handleSubmit(event) {

        event.preventDefault();

        if (!isManager) {

            showNotification(
                "error",
                "Only Managers can add or edit inventory parts."
            );

            return;
        }


        if (
            !form.partNumber.trim() ||
            !form.partName.trim()
        ) {

            showNotification(
                "error",
                "Part Number and Part Name are required."
            );

            return;
        }


        const quantity = Number(form.quantity) || 0;
        const minimumStock = Number(form.minimumStock) || 0;
        const unitPrice = Number(form.unitPrice) || 0;


        if (quantity < 0) {

            showNotification(
                "error",
                "Quantity cannot be negative."
            );

            return;
        }


        if (minimumStock < 0) {

            showNotification(
                "error",
                "Minimum stock cannot be negative."
            );

            return;
        }


        if (unitPrice < 0) {

            showNotification(
                "error",
                "Unit price cannot be negative."
            );

            return;
        }


        const partData = {

            partNumber: form.partNumber.trim(),

            partName: form.partName.trim(),

            category: form.category.trim(),

            quantity,

            minimumStock,

            unitPrice,

            supplier: form.supplier.trim()
        };


        try {

            if (editingId) {

                await updateInventoryPart(
                    editingId,
                    partData
                );

                showNotification(
                    "success",
                    "Inventory part updated successfully."
                );

            } else {

                await createInventoryPart(partData);

                showNotification(
                    "success",
                    "New inventory part added successfully."
                );
            }


            resetForm();

            await loadInventory();

        } catch (error) {

            console.error(
                "Inventory save error:",
                error
            );

            if (error?.response?.status === 403) {

                showNotification(
                    "error",
                    "You don't have permission to modify inventory."
                );

            } else {

                showNotification(
                    "error",
                    "Could not save the inventory part. Please try again."
                );
            }
        }
    }


    // =====================================================
    // EDIT
    // =====================================================

    function handleEdit(part) {

        if (!isManager) {

            showNotification(
                "error",
                "Only Managers can edit inventory parts."
            );

            return;
        }


        setEditingId(part.id);

        setForm({

            partNumber: part.partNumber || "",

            partName: part.partName || "",

            category: part.category || "",

            quantity: part.quantity ?? "",

            minimumStock: part.minimumStock ?? "",

            unitPrice: part.unitPrice ?? "",

            supplier: part.supplier || ""
        });


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    // =====================================================
    // DELETE
    // =====================================================

    async function handleDelete(id) {

        if (!isManager) {

            showNotification(
                "error",
                "Only Managers can delete inventory parts."
            );

            return;
        }


        const confirmed = window.confirm(
            "Are you sure you want to delete this inventory part?"
        );


        if (!confirmed) {
            return;
        }


        try {

            await deleteInventoryPart(id);

            showNotification(
                "success",
                "Inventory part deleted successfully."
            );

            await loadInventory();

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            if (error?.response?.status === 403) {

                showNotification(
                    "error",
                    "You don't have permission to delete inventory parts."
                );

            } else {

                showNotification(
                    "error",
                    "Unable to delete the inventory part."
                );
            }
        }
    }


    // =====================================================
    // UPDATE STOCK
    // TECHNICIAN + MANAGER
    // =====================================================

    async function handleStockUpdate(part) {

        if (!isTechnician && !isManager) {

            showNotification(
                "error",
                "You don't have permission to update inventory stock."
            );

            return;
        }


        const newQuantity = window.prompt(
            `Enter the new quantity for ${part.partName}:`,
            part.quantity
        );


        if (newQuantity === null) {
            return;
        }


        if (newQuantity.trim() === "") {

            showNotification(
                "error",
                "Quantity cannot be empty."
            );

            return;
        }


        const quantity = Number(newQuantity);


        if (
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {

            showNotification(
                "error",
                "Please enter a valid whole number (0 or greater)."
            );

            return;
        }


        try {

            await updateInventoryStock(
                part.id,
                quantity
            );

            showNotification(
                "success",
                `${part.partName} stock updated to ${quantity} units.`
            );

            await loadInventory();

        } catch (error) {

            console.error(
                "Stock update error:",
                error
            );

            if (error?.response?.status === 403) {

                showNotification(
                    "error",
                    "You don't have permission to update stock."
                );

            } else {

                showNotification(
                    "error",
                    "Unable to update stock. Please try again."
                );
            }
        }
    }


    // =====================================================
    // LOW STOCK
    // =====================================================

    function isLowStock(part) {

        return (
            Number(part.quantity || 0) <=
            Number(part.minimumStock || 0)
        );
    }


    // =====================================================
    // FILTERED PARTS
    // =====================================================

    const filteredParts = parts.filter(part => {

        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !search ||
            String(part.partNumber || "")
                .toLowerCase()
                .includes(search) ||
            String(part.partName || "")
                .toLowerCase()
                .includes(search) ||
            String(part.category || "")
                .toLowerCase()
                .includes(search) ||
            String(part.supplier || "")
                .toLowerCase()
                .includes(search);


        const matchesStock =
            stockFilter === "ALL" ||
            (stockFilter === "LOW" && isLowStock(part)) ||
            (stockFilter === "AVAILABLE" && !isLowStock(part));


        return matchesSearch && matchesStock;
    });


    // =====================================================
    // STATISTICS
    // =====================================================

    const totalStock = parts.reduce(
        (total, part) =>
            total + Number(part.quantity || 0),
        0
    );


    const lowStockCount = parts.filter(
        part => isLowStock(part)
    ).length;


    const inventoryValue = parts.reduce(
        (total, part) =>
            total +
            (
                Number(part.quantity || 0) *
                Number(part.unitPrice || 0)
            ),
        0
    );


    const availableCount =
        parts.length - lowStockCount;


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="inventory-page">


            {/* ================================================= */}
            {/* DECORATIVE BACKGROUND */}
            {/* ================================================= */}

            <div className="inventory-shape shape-one"></div>
            <div className="inventory-shape shape-two"></div>


            {/* ================================================= */}
            {/* NOTIFICATION */}
            {/* ================================================= */}

            {notification.message && (

                <div
                    className={`inventory-notification ${notification.type}`}
                >

                    <div className="notification-icon">

                        {notification.type === "success"
                            ? "✓"
                            : "!"}

                    </div>

                    <div className="notification-content">

                        <strong>
                            {notification.type === "success"
                                ? "Success"
                                : "Action required"}
                        </strong>

                        <span>
                            {notification.message}
                        </span>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setNotification({
                                type: "",
                                message: ""
                            })
                        }
                        className="notification-close"
                    >
                        ×
                    </button>

                </div>
            )}


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="inventory-header">

                <div className="inventory-heading">

                    <div className="inventory-title-row">

                        <div className="inventory-main-icon">
                            ◈
                        </div>

                        <div>

                            <span className="inventory-eyebrow">
                                FIELDSYNC • OPERATIONS
                            </span>

                            <h1>
                                Inventory Command Center
                            </h1>

                        </div>

                    </div>

                    <p>
                        Keep every service part accounted for,
                        from warehouse shelf to technician workflow.
                    </p>

                </div>


                <div className="inventory-count">

                    <div className="count-icon">
                        ▦
                    </div>

                    <div>

                        <strong>
                            {parts.length}
                        </strong>

                        <span>
                            Active Parts
                        </span>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* ROLE INFORMATION */}
            {/* ================================================= */}

            <div className={`role-banner ${isManager
                ? "manager"
                : isTechnician
                    ? "technician"
                    : "restricted"
                }`}>

                <div className="role-symbol">

                    {isManager
                        ? "◆"
                        : isTechnician
                            ? "◇"
                            : "!"
                    }

                </div>

                <div>

                    <strong>
                        {userRole} ACCESS
                    </strong>

                    <p>

                        {isManager
                            ? "Full inventory control — create, edit, update stock and remove parts."
                            : isTechnician
                                ? "Technician view — inspect parts and update stock quantities."
                                : "Inventory access is restricted for your current role."
                        }

                    </p>

                </div>

            </div>


            {/* ================================================= */}
            {/* STATISTICS */}
            {/* ================================================= */}

            <div className="inventory-stats">


                <div className="stat-card">

                    <div className="stat-icon parts-icon">
                        ◫
                    </div>

                    <div>

                        <span className="stat-label">
                            TOTAL PARTS
                        </span>

                        <strong>
                            {parts.length}
                        </strong>

                        <small>
                            Registered inventory items
                        </small>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon stock-icon">
                        ◎
                    </div>

                    <div>

                        <span className="stat-label">
                            TOTAL STOCK
                        </span>

                        <strong>
                            {totalStock}
                        </strong>

                        <small>
                            Units currently available
                        </small>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon warning-icon">
                        △
                    </div>

                    <div>

                        <span className="stat-label">
                            LOW STOCK
                        </span>

                        <strong>
                            {lowStockCount}
                        </strong>

                        <small>
                            Requires attention
                        </small>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon value-icon">
                        ₹
                    </div>

                    <div>

                        <span className="stat-label">
                            INVENTORY VALUE
                        </span>

                        <strong>
                            ₹{inventoryValue.toFixed(2)}
                        </strong>

                        <small>
                            Estimated current value
                        </small>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* MANAGER FORM */}
            {/* ================================================= */}

            {isManager && (

                <div className="inventory-card manager-form-card">

                    <div className="card-heading">

                        <div className="card-heading-icon">
                            {editingId ? "✎" : "+"}
                        </div>

                        <div>

                            <span>
                                MANAGER CONTROL
                            </span>

                            <h2>
                                {editingId
                                    ? "Edit Inventory Part"
                                    : "Add Inventory Part"}
                            </h2>

                            <p>
                                {editingId
                                    ? "Update the selected part's information."
                                    : "Register a new service part in your inventory."
                                }
                            </p>

                        </div>

                    </div>


                    <form
                        className="inventory-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">

                            <label>
                                Part Number
                            </label>

                            <div className="input-wrapper">
                                <span>⌗</span>

                                <input
                                    type="text"
                                    name="partNumber"
                                    value={form.partNumber}
                                    onChange={handleChange}
                                    placeholder="AC-FILTER-001"
                                />
                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Part Name
                            </label>

                            <div className="input-wrapper">
                                <span>◇</span>

                                <input
                                    type="text"
                                    name="partName"
                                    value={form.partName}
                                    onChange={handleChange}
                                    placeholder="AC Air Filter"
                                />
                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Category
                            </label>

                            <div className="input-wrapper">
                                <span>◈</span>

                                <input
                                    type="text"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    placeholder="HVAC"
                                />
                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Quantity
                            </label>

                            <div className="input-wrapper">
                                <span>◎</span>

                                <input
                                    type="number"
                                    min="0"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Minimum Stock
                            </label>

                            <div className="input-wrapper">
                                <span>△</span>

                                <input
                                    type="number"
                                    min="0"
                                    name="minimumStock"
                                    value={form.minimumStock}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Unit Price
                            </label>

                            <div className="input-wrapper">
                                <span>₹</span>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="unitPrice"
                                    value={form.unitPrice}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Supplier
                            </label>

                            <div className="input-wrapper">
                                <span>◇</span>

                                <input
                                    type="text"
                                    name="supplier"
                                    value={form.supplier}
                                    onChange={handleChange}
                                    placeholder="Supplier name"
                                />
                            </div>

                        </div>


                        <div className="form-actions">

                            <button
                                type="submit"
                                className="btn-primary"
                            >

                                <span>
                                    {editingId ? "↻" : "+"}
                                </span>

                                {editingId
                                    ? "Update Part"
                                    : "Add Part"}

                            </button>


                            {editingId && (

                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={resetForm}
                                >

                                    <span>
                                        ×
                                    </span>

                                    Cancel

                                </button>

                            )}

                        </div>

                    </form>

                </div>

            )}


            {/* ================================================= */}
            {/* INVENTORY LIST */}
            {/* ================================================= */}

            <div className="inventory-card inventory-list-card">


                {/* CARD HEADER */}

                <div className="inventory-list-header">

                    <div className="card-heading">

                        <div className="card-heading-icon list-icon">
                            ▤
                        </div>

                        <div>

                            <span>
                                STOCK REGISTER
                            </span>

                            <h2>
                                Inventory Parts
                            </h2>

                            <p>
                                Monitor quantities, value and stock health.
                            </p>

                        </div>

                    </div>


                    <div className="stock-summary">

                        <span className="summary-dot healthy"></span>

                        {availableCount} healthy

                        <span className="summary-dot low-dot"></span>

                        {lowStockCount} low

                    </div>

                </div>


                {/* SEARCH / FILTER */}

                <div className="inventory-toolbar">

                    <div className="search-box">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search by part number, name, category or supplier..."
                            value={searchTerm}
                            onChange={event =>
                                setSearchTerm(event.target.value)
                            }
                        />

                        {searchTerm && (

                            <button
                                type="button"
                                onClick={() =>
                                    setSearchTerm("")
                                }
                            >
                                ×
                            </button>

                        )}

                    </div>


                    <div className="filter-buttons">

                        <button
                            type="button"
                            className={
                                stockFilter === "ALL"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setStockFilter("ALL")
                            }
                        >
                            All
                        </button>


                        <button
                            type="button"
                            className={
                                stockFilter === "AVAILABLE"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setStockFilter("AVAILABLE")
                            }
                        >
                            Healthy
                        </button>


                        <button
                            type="button"
                            className={
                                stockFilter === "LOW"
                                    ? "active low-filter"
                                    : ""
                            }
                            onClick={() =>
                                setStockFilter("LOW")
                            }
                        >
                            Low Stock
                        </button>

                    </div>

                </div>


                {/* LOADING */}

                {loading ? (

                    <div className="loading-state">

                        <div className="loading-orbit">
                            ◌
                        </div>

                        <h3>
                            Loading inventory
                        </h3>

                        <p>
                            Gathering your latest stock information...
                        </p>

                    </div>


                ) : parts.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            ◫
                        </div>

                        <h3>
                            No inventory parts yet
                        </h3>

                        <p>

                            {isManager
                                ? "Add your first inventory part using the manager controls above."
                                : "No inventory parts are currently available."
                            }

                        </p>

                    </div>


                ) : filteredParts.length === 0 ? (

                    <div className="empty-state compact-empty">

                        <div className="empty-icon">
                            ⌕
                        </div>

                        <h3>
                            No matching parts
                        </h3>

                        <p>
                            Try another search term or change the stock filter.
                        </p>

                    </div>


                ) : (

                    <div className="table-scroll-wrapper">

                        <table className="inventory-table">

                            <thead>

                                <tr>

                                    <th>
                                        PART
                                    </th>

                                    <th>
                                        CATEGORY
                                    </th>

                                    <th>
                                        STOCK
                                    </th>

                                    <th>
                                        MINIMUM
                                    </th>

                                    <th>
                                        UNIT PRICE
                                    </th>

                                    <th>
                                        SUPPLIER
                                    </th>

                                    <th>
                                        STATUS
                                    </th>

                                    <th>
                                        ACTIONS
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredParts.map(part => (

                                    <tr
                                        key={part.id}
                                        className={
                                            isLowStock(part)
                                                ? "low-stock-row"
                                                : ""
                                        }
                                    >


                                        {/* PART */}

                                        <td>

                                            <div className="part-cell">

                                                <div className="part-avatar">
                                                    {String(
                                                        part.partName || "P"
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>

                                                    <strong>
                                                        {part.partName}
                                                    </strong>

                                                    <span>
                                                        {part.partNumber}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        {/* CATEGORY */}

                                        <td>

                                            <span className="category-pill">

                                                {part.category || "General"}

                                            </span>

                                        </td>


                                        {/* QUANTITY */}

                                        <td>

                                            <div className="quantity-cell">

                                                <strong>
                                                    {part.quantity}
                                                </strong>

                                                <span>
                                                    units
                                                </span>

                                            </div>

                                        </td>


                                        {/* MINIMUM */}

                                        <td>

                                            <span className="minimum-value">
                                                {part.minimumStock}
                                            </span>

                                        </td>


                                        {/* PRICE */}

                                        <td>

                                            <strong className="price-value">

                                                ₹
                                                {Number(
                                                    part.unitPrice || 0
                                                ).toFixed(2)}

                                            </strong>

                                        </td>


                                        {/* SUPPLIER */}

                                        <td>

                                            <span className="supplier-name">
                                                {part.supplier || "Not specified"}
                                            </span>

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            {isLowStock(part) ? (

                                                <span className="stock-badge low">

                                                    <span>
                                                        !
                                                    </span>

                                                    LOW STOCK

                                                </span>

                                            ) : (

                                                <span className="stock-badge available">

                                                    <span>
                                                        ✓
                                                    </span>

                                                    HEALTHY

                                                </span>

                                            )}

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <div className="action-buttons">


                                                {isManager && (

                                                    <button
                                                        type="button"
                                                        className="table-action edit-btn"
                                                        onClick={() =>
                                                            handleEdit(part)
                                                        }
                                                        title="Edit part"
                                                    >

                                                        ✎
                                                        <span>
                                                            Edit
                                                        </span>

                                                    </button>

                                                )}


                                                {(isTechnician ||
                                                    isManager) && (

                                                    <button
                                                        type="button"
                                                        className="table-action stock-btn"
                                                        onClick={() =>
                                                            handleStockUpdate(part)
                                                        }
                                                        title="Update stock"
                                                    >

                                                        ↕
                                                        <span>
                                                            Stock
                                                        </span>

                                                    </button>

                                                )}


                                                {isManager && (

                                                    <button
                                                        type="button"
                                                        className="table-action delete-btn"
                                                        onClick={() =>
                                                            handleDelete(part.id)
                                                        }
                                                        title="Delete part"
                                                    >

                                                        ×
                                                        <span>
                                                            Delete
                                                        </span>

                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ================================================= */}
            {/* FOOTER NOTE */}
            {/* ================================================= */}

            <div className="inventory-footer-note">

                <span className="footer-mark">
                    ◈
                </span>

                <span>
                    FieldSync Inventory • Real-time stock visibility
                </span>

                <span className="footer-separator">
                    /
                </span>

                <span>
                    {isManager
                        ? "Manager Control"
                        : isTechnician
                            ? "Technician Access"
                            : "Restricted Access"
                    }
                </span>

            </div>

        </div>
    );
}


export default Inventory;
