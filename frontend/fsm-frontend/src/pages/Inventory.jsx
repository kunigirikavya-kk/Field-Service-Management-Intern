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

    const [parts, setParts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        partNumber: "",
        partName: "",
        category: "",
        quantity: "",
        minimumStock: "",
        unitPrice: "",
        supplier: ""
    });


    // -----------------------------------------
    // LOAD INVENTORY
    // -----------------------------------------

    useEffect(() => {
        loadInventory();
    }, []);


    async function loadInventory() {

        try {

            setLoading(true);

            const data = await getInventoryParts();

            setParts(data || []);

        } catch (error) {

            console.error(
                "Failed to load inventory:",
                error
            );

            alert("Failed to load inventory");

        } finally {

            setLoading(false);
        }
    }


    // -----------------------------------------
    // INPUT CHANGE
    // -----------------------------------------

    function handleChange(event) {

        const {
            name,
            value
        } = event.target;

        setForm({
            ...form,
            [name]: value
        });
    }


    // -----------------------------------------
    // RESET
    // -----------------------------------------

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


    // -----------------------------------------
    // CREATE / UPDATE
    // -----------------------------------------

    async function handleSubmit(event) {

        event.preventDefault();


        if (
            !form.partNumber ||
            !form.partName
        ) {

            alert(
                "Part Number and Part Name are required"
            );

            return;
        }


        const partData = {

            partNumber: form.partNumber,

            partName: form.partName,

            category: form.category,

            quantity:
                Number(form.quantity) || 0,

            minimumStock:
                Number(form.minimumStock) || 0,

            unitPrice:
                Number(form.unitPrice) || 0,

            supplier: form.supplier
        };


        try {

            if (editingId) {

                await updateInventoryPart(
                    editingId,
                    partData
                );

                alert(
                    "Inventory part updated successfully!"
                );

            } else {

                await createInventoryPart(
                    partData
                );

                alert(
                    "Inventory part created successfully!"
                );
            }


            resetForm();

            await loadInventory();

        } catch (error) {

            console.error(
                "Inventory save error:",
                error
            );

            alert(
                "Failed to save inventory part"
            );
        }
    }


    // -----------------------------------------
    // EDIT
    // -----------------------------------------

    function handleEdit(part) {

        setEditingId(part.id);

        setForm({

            partNumber:
                part.partNumber || "",

            partName:
                part.partName || "",

            category:
                part.category || "",

            quantity:
                part.quantity ?? "",

            minimumStock:
                part.minimumStock ?? "",

            unitPrice:
                part.unitPrice ?? "",

            supplier:
                part.supplier || ""
        });


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    // -----------------------------------------
    // DELETE
    // -----------------------------------------

    async function handleDelete(id) {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this inventory part?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteInventoryPart(id);

            alert(
                "Inventory part deleted successfully!"
            );

            await loadInventory();

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            alert(
                "Failed to delete inventory part"
            );
        }
    }


    // -----------------------------------------
    // UPDATE STOCK
    // -----------------------------------------

    async function handleStockUpdate(part) {

        const newQuantity = window.prompt(
            `Enter new quantity for ${part.partName}:`,
            part.quantity
        );


        // User clicked Cancel
        if (newQuantity === null) {
            return;
        }


        // Empty input
        if (newQuantity.trim() === "") {

            alert(
                "Quantity cannot be empty"
            );

            return;
        }


        const quantity = Number(newQuantity);


        // Validate quantity
        if (
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {

            alert(
                "Please enter a valid quantity (0 or greater)."
            );

            return;
        }


        try {

            await updateInventoryStock(
                part.id,
                quantity
            );

            alert(
                "Stock updated successfully!"
            );

            await loadInventory();

        } catch (error) {

            console.error(
                "Stock update error:",
                error
            );

            alert(
                "Failed to update stock."
            );
        }
    }


    // -----------------------------------------
    // LOW STOCK
    // -----------------------------------------

    function isLowStock(part) {

        return (
            Number(part.quantity) <=
            Number(part.minimumStock)
        );
    }


    // -----------------------------------------
    // STATISTICS
    // -----------------------------------------

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


    return (

        <div className="inventory-page">


            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="inventory-header">

                <div>

                    <h1>
                        Inventory Management
                    </h1>

                    <p>
                        Manage parts, stock and suppliers
                    </p>

                </div>


                <div className="inventory-count">

                    <strong>
                        {parts.length}
                    </strong>

                    <span>
                        Parts
                    </span>

                </div>

            </div>


            {/* ================================= */}
            {/* STATISTICS */}
            {/* ================================= */}

            <div className="inventory-stats">

                <div className="stat-card">

                    <span>
                        📦
                    </span>

                    <div>

                        <strong>
                            {parts.length}
                        </strong>

                        <p>
                            Total Parts
                        </p>

                    </div>

                </div>


                <div className="stat-card">

                    <span>
                        📊
                    </span>

                    <div>

                        <strong>
                            {totalStock}
                        </strong>

                        <p>
                            Total Stock
                        </p>

                    </div>

                </div>


                <div className="stat-card">

                    <span>
                        ⚠️
                    </span>

                    <div>

                        <strong>
                            {lowStockCount}
                        </strong>

                        <p>
                            Low Stock
                        </p>

                    </div>

                </div>


                <div className="stat-card">

                    <span>
                        ₹
                    </span>

                    <div>

                        <strong>
                            ₹{inventoryValue.toFixed(2)}
                        </strong>

                        <p>
                            Inventory Value
                        </p>

                    </div>

                </div>

            </div>


            {/* ================================= */}
            {/* ADD / EDIT FORM */}
            {/* ================================= */}

            <div className="inventory-card">

                <div className="card-title">

                    <h2>

                        {editingId
                            ? "Edit Inventory Part"
                            : "Add Inventory Part"}

                    </h2>

                    <p>
                        Add and manage service parts
                    </p>

                </div>


                <form
                    className="inventory-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label>
                            Part Number
                        </label>

                        <input
                            type="text"
                            name="partNumber"
                            value={form.partNumber}
                            onChange={handleChange}
                            placeholder="AC-FILTER-001"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Part Name
                        </label>

                        <input
                            type="text"
                            name="partName"
                            value={form.partName}
                            onChange={handleChange}
                            placeholder="AC Air Filter"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Category
                        </label>

                        <input
                            type="text"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            placeholder="HVAC"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Quantity
                        </label>

                        <input
                            type="number"
                            min="0"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            placeholder="0"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Minimum Stock
                        </label>

                        <input
                            type="number"
                            min="0"
                            name="minimumStock"
                            value={form.minimumStock}
                            onChange={handleChange}
                            placeholder="0"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Unit Price
                        </label>

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


                    <div className="form-group">

                        <label>
                            Supplier
                        </label>

                        <input
                            type="text"
                            name="supplier"
                            value={form.supplier}
                            onChange={handleChange}
                            placeholder="Supplier name"
                        />

                    </div>


                    <div className="form-actions">

                        <button
                            type="submit"
                            className="btn-primary"
                        >

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
                                Cancel
                            </button>

                        )}

                    </div>

                </form>

            </div>


            {/* ================================= */}
            {/* INVENTORY TABLE */}
            {/* ================================= */}

            <div className="inventory-card">

                <div className="card-title">

                    <h2>
                        Inventory Parts
                    </h2>

                    <p>
                        Current stock levels
                    </p>

                </div>


                {loading ? (

                    <div className="loading">
                        Loading inventory...
                    </div>

                ) : parts.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            📦
                        </div>

                        <h3>
                            No inventory parts
                        </h3>

                        <p>
                            Add your first inventory part above.
                        </p>

                    </div>

                ) : (

                    <div className="table-container">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Part Number
                                    </th>

                                    <th>
                                        Part Name
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Minimum
                                    </th>

                                    <th>
                                        Unit Price
                                    </th>

                                    <th>
                                        Supplier
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

                                {parts.map(
                                    part => (

                                    <tr
                                        key={part.id}
                                    >

                                        <td>
                                            <strong>
                                                {part.partNumber}
                                            </strong>
                                        </td>

                                        <td>
                                            {part.partName}
                                        </td>

                                        <td>
                                            {part.category || "-"}
                                        </td>

                                        <td>
                                            {part.quantity}
                                        </td>

                                        <td>
                                            {part.minimumStock}
                                        </td>

                                        <td>
                                            ₹
                                            {Number(
                                                part.unitPrice || 0
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            {part.supplier || "-"}
                                        </td>

                                        <td>

                                            {isLowStock(part) ? (

                                                <span className="stock-badge low">
                                                    LOW STOCK
                                                </span>

                                            ) : (

                                                <span className="stock-badge available">
                                                    AVAILABLE
                                                </span>

                                            )}

                                        </td>

                                        <td>

                                            <div className="action-buttons">

                                                <button
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        handleEdit(part)
                                                    }
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    className="stock-btn"
                                                    onClick={() =>
                                                        handleStockUpdate(
                                                            part
                                                        )
                                                    }
                                                >
                                                    Stock
                                                </button>


                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        handleDelete(
                                                            part.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}


export default Inventory;