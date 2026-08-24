import { useEffect, useState } from "react";

import {
    getWorkOrders,
    getInvoices,
    getInventoryParts
} from "../services/api";

import "./Reports.css";

function Reports() {

    const [workOrders, setWorkOrders] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    async function loadReports() {

        try {

            setLoading(true);

            const [
                workOrderData,
                invoiceData,
                inventoryData
            ] = await Promise.all([
                getWorkOrders(),
                getInvoices(),
                getInventoryParts()
            ]);

            setWorkOrders(workOrderData || []);
            setInvoices(invoiceData || []);
            setInventory(inventoryData || []);

        } catch (error) {

            console.error(
                "Failed to load reports:",
                error
            );

        } finally {

            setLoading(false);

        }
    }


    // -----------------------------
    // WORK ORDER STATISTICS
    // -----------------------------

    const totalWorkOrders =
        workOrders.length;

    const completedWorkOrders =
        workOrders.filter(
            order => order.status === "COMPLETED"
        ).length;

    const inProgressWorkOrders =
        workOrders.filter(
            order => order.status === "IN_PROGRESS"
        ).length;

    const pendingWorkOrders =
        workOrders.filter(
            order =>
                order.status === "PENDING"
        ).length;

    const cancelledWorkOrders =
        workOrders.filter(
            order =>
                order.status === "CANCELLED"
        ).length;


    // -----------------------------
    // INVOICE STATISTICS
    // -----------------------------

    const totalRevenue =
        invoices.reduce(
            (sum, invoice) =>
                sum + Number(invoice.totalAmount || 0),
            0
        );

    const paidInvoices =
        invoices.filter(
            invoice => invoice.status === "PAID"
        ).length;

    const unpaidInvoices =
        invoices.filter(
            invoice => invoice.status === "UNPAID"
        ).length;


    // -----------------------------
    // INVENTORY
    // -----------------------------

    const lowStockParts =
        inventory.filter(
            part =>
                Number(part.quantity) <=
                Number(part.minimumStock)
        ).length;


    if (loading) {

        return (
            <div className="reports-page">
                <h1>Reports</h1>
                <p>Loading reports...</p>
            </div>
        );

    }


    return (

        <div className="reports-page">

            {/* HEADER */}

            <div className="reports-header">

                <div>
                    <h1>Reports & Analytics</h1>

                    <p>
                        Overview of your field service operations
                    </p>
                </div>

            </div>


            {/* WORK ORDER SECTION */}

            <div className="report-section">

                <h2>Work Order Overview</h2>

                <div className="report-grid">

                    <div className="report-card">

                        <h3>Total Work Orders</h3>

                        <strong>
                            {totalWorkOrders}
                        </strong>

                    </div>


                    <div className="report-card completed">

                        <h3>Completed</h3>

                        <strong>
                            {completedWorkOrders}
                        </strong>

                    </div>


                    <div className="report-card progress">

                        <h3>In Progress</h3>

                        <strong>
                            {inProgressWorkOrders}
                        </strong>

                    </div>


                    <div className="report-card pending">

                        <h3>Pending</h3>

                        <strong>
                            {pendingWorkOrders}
                        </strong>

                    </div>


                    <div className="report-card cancelled">

                        <h3>Cancelled</h3>

                        <strong>
                            {cancelledWorkOrders}
                        </strong>

                    </div>

                </div>

            </div>


            {/* BILLING SECTION */}

            <div className="report-section">

                <h2>Billing Overview</h2>

                <div className="report-grid">

                    <div className="report-card revenue">

                        <h3>Total Revenue</h3>

                        <strong>
                            ₹{totalRevenue.toFixed(2)}
                        </strong>

                    </div>


                    <div className="report-card completed">

                        <h3>Paid Invoices</h3>

                        <strong>
                            {paidInvoices}
                        </strong>

                    </div>


                    <div className="report-card pending">

                        <h3>Unpaid Invoices</h3>

                        <strong>
                            {unpaidInvoices}
                        </strong>

                    </div>

                </div>

            </div>


            {/* INVENTORY SECTION */}

            <div className="report-section">

                <h2>Inventory Overview</h2>

                <div className="report-grid">

                    <div className="report-card">

                        <h3>Total Parts</h3>

                        <strong>
                            {inventory.length}
                        </strong>

                    </div>


                    <div className="report-card pending">

                        <h3>Low Stock Parts</h3>

                        <strong>
                            {lowStockParts}
                        </strong>

                    </div>

                </div>

            </div>


            {/* WORK ORDER TABLE */}

            <div className="report-section">

                <h2>Work Order Status</h2>

                <div className="report-table-wrapper">

                    <table>

                        <thead>

                            <tr>
                                <th>Order Number</th>
                                <th>Title</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Total Cost</th>
                            </tr>

                        </thead>

                        <tbody>

                            {workOrders.map(order => (

                                <tr key={order.id}>

                                    <td>
                                        {order.orderNumber}
                                    </td>

                                    <td>
                                        {order.title}
                                    </td>

                                    <td>
                                        {order.priority}
                                    </td>

                                    <td>
                                        <span className="status-badge">
                                            {order.status}
                                        </span>
                                    </td>

                                    <td>
                                        ₹
                                        {Number(
                                            order.totalCost || 0
                                        ).toFixed(2)}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );
}

export default Reports;