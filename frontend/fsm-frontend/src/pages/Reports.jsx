import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChartNoAxesCombined, FileText, Package, Receipt } from "lucide-react";

import {
    getWorkOrders,
    getInvoices,
    getInventoryParts
} from "../services/api";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import "./Reports.css";


function Reports() {

    const navigate = useNavigate();

    const [workOrders, setWorkOrders] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");


    // =====================================================
    // LOAD REPORT DATA
    // =====================================================

    useEffect(() => {
        loadReports();
    }, []);


    async function loadReports() {

        try {

            setError("");

            if (
                workOrders.length === 0 &&
                invoices.length === 0 &&
                inventory.length === 0
            ) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }


            // =====================================================
            // LOAD WORK ORDERS
            // =====================================================

            try {

                const workOrderData =
                    await getWorkOrders();

                setWorkOrders(
                    Array.isArray(workOrderData)
                        ? workOrderData
                        : []
                );

            } catch (error) {

                console.error(
                    "Failed to load work orders for reports:",
                    error
                );

                setWorkOrders([]);

            }


            // =====================================================
            // LOAD INVOICES
            // =====================================================

            try {

                const invoiceData =
                    await getInvoices();

                setInvoices(
                    Array.isArray(invoiceData)
                        ? invoiceData
                        : []
                );

            } catch (error) {

                console.error(
                    "Failed to load invoices for reports:",
                    error
                );

                setInvoices([]);

            }


            // =====================================================
            // LOAD INVENTORY
            // =====================================================

            try {

                const inventoryData =
                    await getInventoryParts();

                setInventory(
                    Array.isArray(inventoryData)
                        ? inventoryData
                        : []
                );

            } catch (error) {

                console.error(
                    "Failed to load inventory for reports:",
                    error
                );

                setInventory([]);

            }

        } catch (error) {

            console.error(
                "Failed to load reports:",
                error
            );

            setError(
                "Unable to load reports. Please try again."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    }


    // =====================================================
    // HELPERS
    // =====================================================

    function normalizeStatus(status) {

        return String(status || "")
            .trim()
            .toUpperCase();

    }


    function formatMoney(amount) {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(
            Number(amount) || 0
        );

    }


    function formatDate(date) {

        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(date);
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    function getStatusClass(status) {

        switch (
            normalizeStatus(status)
        ) {

            case "COMPLETED":
                return "status-completed";

            case "IN_PROGRESS":
                return "status-progress";

            case "PENDING":
                return "status-pending";

            case "OPEN":
                return "status-open";

            case "CANCELLED":
                return "status-cancelled";

            case "PAID":
                return "status-paid";

            case "UNPAID":
                return "status-unpaid";

            case "OVERDUE":
                return "status-overdue";

            default:
                return "status-default";

        }

    }


    function getPriorityClass(priority) {

        switch (
            normalizeStatus(priority)
        ) {

            case "URGENT":
                return "priority-urgent";

            case "HIGH":
                return "priority-high";

            case "MEDIUM":
                return "priority-medium";

            case "LOW":
                return "priority-low";

            default:
                return "priority-default";

        }

    }


    function getInventoryQuantity(part) {

        return Number(
            part.quantity ??
            part.stockQuantity ??
            part.currentStock ??
            0
        ) || 0;

    }


    function getMinimumStock(part) {

        return Number(
            part.minimumStock ??
            part.reorderLevel ??
            0
        ) || 0;

    }


    // =====================================================
    // WORK ORDER STATISTICS
    // =====================================================

    const totalWorkOrders =
        workOrders.length;


    const completedWorkOrders =
        workOrders.filter(order =>
            normalizeStatus(order.status) ===
            "COMPLETED"
        ).length;


    const inProgressWorkOrders =
        workOrders.filter(order =>
            normalizeStatus(order.status) ===
            "IN_PROGRESS"
        ).length;


    const pendingWorkOrders =
        workOrders.filter(order =>
            normalizeStatus(order.status) ===
            "PENDING"
        ).length;


    const cancelledWorkOrders =
        workOrders.filter(order =>
            normalizeStatus(order.status) ===
            "CANCELLED"
        ).length;


    const openWorkOrders =
        workOrders.filter(order => {

            const status =
                normalizeStatus(order.status);

            return (
                status !== "COMPLETED" &&
                status !== "CANCELLED"
            );

        }).length;


    const completionRate =
        totalWorkOrders > 0
            ? Math.round(
                (
                    completedWorkOrders /
                    totalWorkOrders
                ) * 100
            )
            : 0;


    // =====================================================
    // WORK ORDER COST
    // =====================================================

    const totalWorkOrderCost =
        workOrders.reduce(
            (sum, order) =>
                sum +
                (
                    Number(
                        order.totalCost || 0
                    ) || 0
                ),
            0
        );


    const averageWorkOrderCost =
        totalWorkOrders > 0
            ? totalWorkOrderCost /
              totalWorkOrders
            : 0;


    // =====================================================
    // PRIORITY STATISTICS
    // =====================================================

    const urgentWorkOrders =
        workOrders.filter(order =>
            normalizeStatus(order.priority) ===
            "URGENT"
        ).length;


    const highPriorityWorkOrders =
        workOrders.filter(order =>
            normalizeStatus(order.priority) ===
            "HIGH"
        ).length;


    const mediumPriorityWorkOrders =
        workOrders.filter(order =>
            normalizeStatus(order.priority) ===
            "MEDIUM"
        ).length;


    const lowPriorityWorkOrders =
        workOrders.filter(order =>
            normalizeStatus(order.priority) ===
            "LOW"
        ).length;


    // =====================================================
    // INVOICE STATISTICS
    // =====================================================

    const totalInvoices =
        invoices.length;


    // Cancelled invoices are excluded from active
    // financial calculations.

    const activeInvoices =
        invoices.filter(invoice =>
            normalizeStatus(invoice.status) !==
            "CANCELLED"
        );


    const totalInvoiceValue =
        activeInvoices.reduce(
            (sum, invoice) =>
                sum +
                (
                    Number(
                        invoice.totalAmount || 0
                    ) || 0
                ),
            0
        );


    const paidInvoicesList =
        invoices.filter(invoice =>
            normalizeStatus(invoice.status) ===
            "PAID"
        );


    const unpaidInvoicesList =
        invoices.filter(invoice => {

            const status =
                normalizeStatus(invoice.status);

            return (
                status === "UNPAID" ||
                status === "OVERDUE"
            );

        });


    const overdueInvoicesList =
        invoices.filter(invoice =>
            normalizeStatus(invoice.status) ===
            "OVERDUE"
        );


    const paidInvoices =
        paidInvoicesList.length;


    const unpaidInvoices =
        unpaidInvoicesList.length;


    const overdueInvoices =
        overdueInvoicesList.length;


    const paidRevenue =
        paidInvoicesList.reduce(
            (sum, invoice) =>
                sum +
                (
                    Number(
                        invoice.totalAmount || 0
                    ) || 0
                ),
            0
        );


    const unpaidRevenue =
        unpaidInvoicesList.reduce(
            (sum, invoice) =>
                sum +
                (
                    Number(
                        invoice.totalAmount || 0
                    ) || 0
                ),
            0
        );


    const collectionRate =
        totalInvoiceValue > 0
            ? Math.round(
                (
                    paidRevenue /
                    totalInvoiceValue
                ) * 100
            )
            : 0;


    // =====================================================
    // INVENTORY STATISTICS
    // =====================================================

    const lowStockParts =
        inventory.filter(part => {

            const quantity =
                getInventoryQuantity(part);

            const minimumStock =
                getMinimumStock(part);

            return (
                minimumStock > 0 &&
                quantity <= minimumStock &&
                quantity > 0
            );

        });


    const outOfStockParts =
        inventory.filter(part =>
            getInventoryQuantity(part) <= 0
        );


    const healthyStockParts =
        inventory.filter(part => {

            const quantity =
                getInventoryQuantity(part);

            const minimumStock =
                getMinimumStock(part);

            return (
                quantity > 0 &&
                (
                    minimumStock <= 0 ||
                    quantity > minimumStock
                )
            );

        });


    const lowStockCount =
        lowStockParts.length;


    const outOfStockCount =
        outOfStockParts.length;


    const healthyStockCount =
        healthyStockParts.length;


    // =====================================================
    // CHART DATA
    // =====================================================

    const workOrderChartData =
        useMemo(() => {

            return [

                {
                    name: "Completed",
                    value: completedWorkOrders
                },

                {
                    name: "In Progress",
                    value: inProgressWorkOrders
                },

                {
                    name: "Pending",
                    value: pendingWorkOrders
                },

                {
                    name: "Cancelled",
                    value: cancelledWorkOrders
                }

            ].filter(
                item => item.value > 0
            );

        }, [
            completedWorkOrders,
            inProgressWorkOrders,
            pendingWorkOrders,
            cancelledWorkOrders
        ]);


    const billingChartData = [

        {
            name: "Paid",
            amount: paidRevenue
        },

        {
            name: "Unpaid",
            amount: unpaidRevenue
        }

    ];


    const priorityChartData = [

        {
            name: "Urgent",
            value: urgentWorkOrders
        },

        {
            name: "High",
            value: highPriorityWorkOrders
        },

        {
            name: "Medium",
            value: mediumPriorityWorkOrders
        },

        {
            name: "Low",
            value: lowPriorityWorkOrders
        }

    ].filter(
        item => item.value > 0
    );


    const costChartData =
        workOrders.map(
            (order, index) => ({

                name:
                    order.orderNumber ||
                    `WO-${String(
                        order.id ||
                        index + 1
                    ).padStart(
                        4,
                        "0"
                    )}`,

                cost:
                    Number(
                        order.totalCost || 0
                    ) || 0

            })
        );


    const inventoryChartData = [

        {
            name: "Healthy Stock",
            value: healthyStockCount
        },

        {
            name: "Low Stock",
            value: lowStockCount
        },

        {
            name: "Out of Stock",
            value: outOfStockCount
        }

    ].filter(
        item => item.value > 0
    );


    // =====================================================
    // RECENT DATA
    // =====================================================

    const recentInvoices =
        [...invoices]
            .sort((a, b) => {

                const dateA =
                    new Date(
                        a.invoiceDate ||
                        a.createdAt ||
                        0
                    ).getTime();

                const dateB =
                    new Date(
                        b.invoiceDate ||
                        b.createdAt ||
                        0
                    ).getTime();

                return dateB - dateA;

            })
            .slice(0, 5);


    const recentWorkOrders =
        [...workOrders]
            .slice(-5)
            .reverse();


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="reports-page">

                <div className="reports-loading">

                    <div className="reports-spinner"></div>

                    <h2>
                        Loading Reports...
                    </h2>

                    <p>
                        Preparing your FieldSync analytics.
                    </p>

                </div>

            </div>

        );

    }


    return (

        <div className="reports-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="reports-header">

                <div>

                    <div className="reports-title-row">

                        <div className="reports-title-icon">
                            <ChartNoAxesCombined size={25} strokeWidth={1.8} aria-hidden />
                        </div>

                        <div>

                            <h1>
                                Reports & Analytics
                            </h1>

                            <p>
                                Visual insights into your
                                FieldSync operations.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="reports-header-actions">

                    <button
                        className="reports-refresh-button"
                        onClick={loadReports}
                        disabled={refreshing}
                    >

                        {refreshing
                            ? "Refreshing..."
                            : "↻ Refresh"}

                    </button>


                    <button
                        className="reports-primary-button"
                        onClick={() =>
                            navigate("/work-orders")
                        }
                    >
                        View Work Orders
                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="reports-error">

                    <span>
                        ⚠️
                    </span>

                    <span>
                        {error}
                    </span>

                    <button onClick={loadReports}>
                        Retry
                    </button>

                </div>

            )}


            {/* =================================================
                KPI CARDS
            ================================================= */}

            <div className="kpi-grid">


                <div className="kpi-card">

                    <div className="kpi-icon purple">
                        📋
                    </div>

                    <div>

                        <span>
                            Total Work Orders
                        </span>

                        <strong>
                            {totalWorkOrders}
                        </strong>

                    </div>

                </div>


                <div className="kpi-card">

                    <div className="kpi-icon green">
                        ✓
                    </div>

                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>
                            {completedWorkOrders}
                        </strong>

                    </div>

                </div>


                <div className="kpi-card">

                    <div className="kpi-icon blue">
                        ⚙
                    </div>

                    <div>

                        <span>
                            In Progress
                        </span>

                        <strong>
                            {inProgressWorkOrders}
                        </strong>

                    </div>

                </div>


                <div className="kpi-card">

                    <div className="kpi-icon orange">
                        ⏳
                    </div>

                    <div>

                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingWorkOrders}
                        </strong>

                    </div>

                </div>


                <div className="kpi-card">

                    <div className="kpi-icon red">
                        !
                    </div>

                    <div>

                        <span>
                            Low Stock
                        </span>

                        <strong>
                            {lowStockCount}
                        </strong>

                    </div>

                </div>


                <div className="kpi-card">

                    <div className="kpi-icon purple">
                        ₹
                    </div>

                    <div>

                        <span>
                            Total Revenue
                        </span>

                        <strong>
                            {formatMoney(
                                totalInvoiceValue
                            )}
                        </strong>

                    </div>

                </div>


                <div className="kpi-card">

                    <div className="kpi-icon green">
                        💰
                    </div>

                    <div>

                        <span>
                            Paid Revenue
                        </span>

                        <strong>
                            {formatMoney(
                                paidRevenue
                            )}
                        </strong>

                    </div>

                </div>


                <div className="kpi-card">

                    <div className="kpi-icon orange">
                        <Receipt size={18} strokeWidth={1.8} aria-hidden />
                    </div>

                    <div>

                        <span>
                            Total Invoices
                        </span>

                        <strong>
                            {totalInvoices}
                        </strong>

                    </div>

                </div>


                <div className="kpi-card">

                    <div className="kpi-icon red">
                        ⚠
                    </div>

                    <div>

                        <span>
                            Overdue Invoices
                        </span>

                        <strong>
                            {overdueInvoices}
                        </strong>

                    </div>

                </div>


                <div className="kpi-card">

                    <div className="kpi-icon blue">
                        <Package size={18} strokeWidth={1.8} aria-hidden />
                    </div>

                    <div>

                        <span>
                            Out of Stock
                        </span>

                        <strong>
                            {outOfStockCount}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                CHART ROW 1
            ================================================= */}

            <div className="charts-grid">


                {/* WORK ORDER DISTRIBUTION */}

                <div className="chart-card">

                    <div className="chart-header">

                        <div>

                            <h2>
                                Work Order Distribution
                            </h2>

                            <p>
                                Current work order status
                            </p>

                        </div>

                        <span className="chart-badge">
                            {totalWorkOrders} Total
                        </span>

                    </div>


                    <div className="chart-container donut-container">

                        {workOrderChartData.length === 0 ? (

                            <div className="chart-empty">
                                No work order data
                            </div>

                        ) : (

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <PieChart>

                                    <Pie
                                        data={workOrderChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={4}
                                        stroke="none"
                                    >

                                        {workOrderChartData.map(
                                            (entry, index) => (

                                                <Cell
                                                    key={`work-order-cell-${index}`}
                                                    fill={[
                                                        "#22c55e",
                                                        "#3b82f6",
                                                        "#f59e0b",
                                                        "#ef4444"
                                                    ][index % 4]}
                                                />

                                            )
                                        )}

                                    </Pie>

                                    <Tooltip
                                        formatter={(value) => [
                                            value,
                                            "Work Orders"
                                        ]}
                                    />

                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                    />

                                </PieChart>

                            </ResponsiveContainer>

                        )}

                    </div>

                </div>


                {/* BILLING */}

                <div className="chart-card">

                    <div className="chart-header">

                        <div>

                            <h2>
                                Billing Performance
                            </h2>

                            <p>
                                Paid vs unpaid revenue
                            </p>

                        </div>

                        <span className="chart-badge revenue-badge">
                            {formatMoney(
                                totalInvoiceValue
                            )}
                        </span>

                    </div>


                    <div className="chart-container">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <BarChart
                                data={billingChartData}
                                margin={{
                                    top: 15,
                                    right: 20,
                                    left: 10,
                                    bottom: 5
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fontSize: 12
                                    }}
                                />

                                <YAxis
                                    tick={{
                                        fontSize: 11
                                    }}
                                    tickFormatter={(value) =>
                                        `₹${value}`
                                    }
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        formatMoney(value)
                                    }
                                />

                                <Bar
                                    dataKey="amount"
                                    name="Revenue"
                                    radius={[
                                        8,
                                        8,
                                        0,
                                        0
                                    ]}
                                    fill="#4f46e5"
                                    barSize={65}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>

            </div>


            {/* =================================================
                CHART ROW 2
            ================================================= */}

            <div className="charts-grid">


                {/* COST ANALYSIS */}

                <div className="chart-card large-chart">

                    <div className="chart-header">

                        <div>

                            <h2>
                                Work Order Cost Analysis
                            </h2>

                            <p>
                                Cost distribution across work orders
                            </p>

                        </div>

                        <span className="chart-badge">
                            Avg{" "}
                            {formatMoney(
                                averageWorkOrderCost
                            )}
                        </span>

                    </div>


                    <div className="chart-container">

                        {costChartData.length === 0 ? (

                            <div className="chart-empty">
                                No cost data available
                            </div>

                        ) : (

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={costChartData}
                                    margin={{
                                        top: 15,
                                        right: 20,
                                        left: 10,
                                        bottom: 35
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="name"
                                        tick={{
                                            fontSize: 10
                                        }}
                                        angle={-25}
                                        textAnchor="end"
                                    />

                                    <YAxis
                                        tick={{
                                            fontSize: 11
                                        }}
                                        tickFormatter={(value) =>
                                            `₹${value}`
                                        }
                                    />

                                    <Tooltip
                                        formatter={(value) =>
                                            formatMoney(value)
                                        }
                                    />

                                    <Bar
                                        dataKey="cost"
                                        name="Work Order Cost"
                                        fill="#06b6d4"
                                        radius={[
                                            7,
                                            7,
                                            0,
                                            0
                                        ]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        )}

                    </div>

                </div>


                {/* INVENTORY */}

                <div className="chart-card">

                    <div className="chart-header">

                        <div>

                            <h2>
                                Inventory Health
                            </h2>

                            <p>
                                Current stock condition
                            </p>

                        </div>

                        <span className="inventory-chart-icon">
                            <Package size={18} strokeWidth={1.8} aria-hidden />
                        </span>

                    </div>


                    <div className="chart-container inventory-chart">

                        {inventoryChartData.length === 0 ? (

                            <div className="chart-empty">
                                No inventory data
                            </div>

                        ) : (

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={inventoryChartData}
                                    layout="vertical"
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 20,
                                        bottom: 10
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                    />

                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={100}
                                        tick={{
                                            fontSize: 11
                                        }}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="value"
                                        name="Parts"
                                        fill="#8b5cf6"
                                        radius={[
                                            0,
                                            8,
                                            8,
                                            0
                                        ]}
                                        barSize={28}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        )}

                    </div>


                    <button
                        className="analytics-link"
                        onClick={() =>
                            navigate("/inventory")
                        }
                    >
                        Manage Inventory →
                    </button>

                </div>

            </div>


            {/* =================================================
                PRIORITY + COLLECTION SUMMARY
            ================================================= */}

            <div className="charts-grid">


                {/* PRIORITY DISTRIBUTION */}

                <div className="chart-card">

                    <div className="chart-header">

                        <div>

                            <h2>
                                Work Order Priority
                            </h2>

                            <p>
                                Current priority distribution
                            </p>

                        </div>

                        <span className="chart-badge">
                            {totalWorkOrders} Orders
                        </span>

                    </div>


                    <div className="chart-container donut-container">

                        {priorityChartData.length === 0 ? (

                            <div className="chart-empty">
                                No priority data
                            </div>

                        ) : (

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <PieChart>

                                    <Pie
                                        data={priorityChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={105}
                                        paddingAngle={3}
                                    >

                                        {priorityChartData.map(
                                            (entry, index) => (

                                                <Cell
                                                    key={`priority-cell-${index}`}
                                                    fill={[
                                                        "#ef4444",
                                                        "#f97316",
                                                        "#6366f1",
                                                        "#22c55e"
                                                    ][index % 4]}
                                                />

                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                    />

                                </PieChart>

                            </ResponsiveContainer>

                        )}

                    </div>

                </div>


                {/* COLLECTION SUMMARY */}

                <div className="chart-card collection-summary-card">

                    <div className="chart-header">

                        <div>

                            <h2>
                                Invoice Collection
                            </h2>

                            <p>
                                Current billing collection performance
                            </p>

                        </div>

                        <span className="chart-badge revenue-badge">
                            {collectionRate}%
                        </span>

                    </div>


                    <div className="collection-summary">

                        <div className="collection-main">

                            <span>
                                Collection Rate
                            </span>

                            <strong>
                                {collectionRate}%
                            </strong>

                        </div>


                        <div className="collection-progress">

                            <div
                                className="collection-progress-bar"
                                style={{
                                    width: `${collectionRate}%`
                                }}
                            ></div>

                        </div>


                        <div className="collection-stats">

                            <div>

                                <span>
                                    Paid Invoices
                                </span>

                                <strong className="green-text">
                                    {paidInvoices}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Unpaid
                                </span>

                                <strong className="orange-text">
                                    {unpaidInvoices}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Overdue
                                </span>

                                <strong className="red-text">
                                    {overdueInvoices}
                                </strong>

                            </div>

                        </div>


                        <div className="collection-revenue">

                            <div>

                                <span>
                                    Collected Revenue
                                </span>

                                <strong>
                                    {formatMoney(
                                        paidRevenue
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Outstanding Revenue
                                </span>

                                <strong>
                                    {formatMoney(
                                        unpaidRevenue
                                    )}
                                </strong>

                            </div>

                        </div>


                        <button
                            className="analytics-link"
                            onClick={() =>
                                navigate("/billing")
                            }
                        >
                            Manage Billing →
                        </button>

                    </div>

                </div>

            </div>


            {/* =================================================
                OPERATIONS PERFORMANCE
            ================================================= */}

            <div className="performance-card">

                <div className="performance-header">

                    <div>

                        <h2>
                            Operations Performance
                        </h2>

                        <p>
                            Quick summary of your current
                            field service performance.
                        </p>

                    </div>


                    <div className="completion-circle">

                        <strong>
                            {completionRate}%
                        </strong>

                        <span>
                            Completion
                        </span>

                    </div>

                </div>


                <div className="performance-stats">

                    <div>

                        <span>
                            Completed
                        </span>

                        <strong className="green-text">
                            {completedWorkOrders}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Open
                        </span>

                        <strong className="blue-text">
                            {openWorkOrders}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Cancelled
                        </span>

                        <strong className="red-text">
                            {cancelledWorkOrders}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Total Cost
                        </span>

                        <strong>
                            {formatMoney(
                                totalWorkOrderCost
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                RECENT INVOICES
            ================================================= */}

            <div className="report-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Recent Invoices
                        </h2>

                        <p>
                            Latest billing activity
                        </p>

                    </div>


                    <button
                        className="view-all-button"
                        onClick={() =>
                            navigate("/billing")
                        }
                    >
                        View Billing →
                    </button>

                </div>


                {recentInvoices.length === 0 ? (

                    <div className="reports-empty">

                        <span>
                            <FileText size={18} strokeWidth={1.8} aria-hidden />
                        </span>

                        <p>
                            No invoices available.
                        </p>

                    </div>

                ) : (

                    <div className="report-table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Invoice
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {recentInvoices.map(
                                    (invoice, index) => (

                                        <tr
                                            key={
                                                invoice.id ||
                                                `invoice-${index}`
                                            }
                                            onClick={() =>
                                                navigate(
                                                    "/billing"
                                                )
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    {invoice.invoiceNumber ||
                                                        `INV-${String(
                                                            invoice.id ||
                                                            index + 1
                                                        ).padStart(
                                                            4,
                                                            "0"
                                                        )}`}
                                                </strong>

                                            </td>


                                            <td>

                                                {invoice.customerName ||
                                                    invoice.customer?.name ||
                                                    invoice.customer?.fullName ||
                                                    "Customer"}

                                            </td>


                                            <td>

                                                {formatDate(
                                                    invoice.invoiceDate ||
                                                    invoice.createdAt
                                                )}

                                            </td>


                                            <td>

                                                {formatMoney(
                                                    invoice.totalAmount
                                                )}

                                            </td>


                                            <td>

                                                <span
                                                    className={`status-badge ${getStatusClass(
                                                        invoice.status
                                                    )}`}
                                                >

                                                    {String(
                                                        invoice.status ||
                                                        "UNKNOWN"
                                                    ).replace(
                                                        /_/g,
                                                        " "
                                                    )}

                                                </span>

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
                WORK ORDER DETAILS
            ================================================= */}

            <div className="report-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Work Order Details
                        </h2>

                        <p>
                            Detailed view of current work orders
                        </p>

                    </div>


                    <button
                        className="view-all-button"
                        onClick={() =>
                            navigate("/work-orders")
                        }
                    >
                        View All →
                    </button>

                </div>


                {recentWorkOrders.length === 0 ? (

                    <div className="reports-empty">

                        <span>
                            📋
                        </span>

                        <p>
                            No work orders available.
                        </p>

                    </div>

                ) : (

                    <div className="report-table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Order Number
                                    </th>

                                    <th>
                                        Description
                                    </th>

                                    <th>
                                        Priority
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Total Cost
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {recentWorkOrders.map(
                                    order => (

                                        <tr
                                            key={order.id}
                                            onClick={() =>
                                                navigate(
                                                    "/work-orders"
                                                )
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    {order.orderNumber ||
                                                        `WO-${String(
                                                            order.id
                                                        ).padStart(
                                                            4,
                                                            "0"
                                                        )}`}
                                                </strong>

                                            </td>


                                            <td>

                                                {order.description ||
                                                    order.title ||
                                                    "Service Work Order"}

                                            </td>


                                            <td>

                                                <span
                                                    className={`priority-badge ${getPriorityClass(
                                                        order.priority
                                                    )}`}
                                                >

                                                    {order.priority ||
                                                        "MEDIUM"}

                                                </span>

                                            </td>


                                            <td>

                                                <span
                                                    className={`status-badge ${getStatusClass(
                                                        order.status
                                                    )}`}
                                                >

                                                    {String(
                                                        order.status ||
                                                        "UNKNOWN"
                                                    ).replace(
                                                        /_/g,
                                                        " "
                                                    )}

                                                </span>

                                            </td>


                                            <td>

                                                {formatMoney(
                                                    order.totalCost
                                                )}

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
                LOW STOCK ALERT
            ================================================= */}

            <div className="report-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Inventory Alerts
                        </h2>

                        <p>
                            Parts requiring attention
                        </p>

                    </div>


                    <button
                        className="view-all-button"
                        onClick={() =>
                            navigate("/inventory")
                        }
                    >
                        View Inventory →
                    </button>

                </div>


                {lowStockParts.length === 0 &&
                outOfStockParts.length === 0 ? (

                    <div className="reports-empty">

                        <span>
                            ✅
                        </span>

                        <p>
                            All inventory levels look healthy.
                        </p>

                    </div>

                ) : (

                    <div className="report-table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Part
                                    </th>

                                    <th>
                                        Current Stock
                                    </th>

                                    <th>
                                        Minimum Stock
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {[
                                    ...outOfStockParts,
                                    ...lowStockParts
                                ]
                                    .slice(0, 8)
                                    .map(
                                        (part, index) => {

                                            const quantity =
                                                getInventoryQuantity(
                                                    part
                                                );

                                            const minimumStock =
                                                getMinimumStock(
                                                    part
                                                );

                                            const isOutOfStock =
                                                quantity <= 0;


                                            return (

                                                <tr
                                                    key={
                                                        part.id ||
                                                        `inventory-${index}`
                                                    }
                                                    onClick={() =>
                                                        navigate(
                                                            "/inventory"
                                                        )
                                                    }
                                                >

                                                    <td>

                                                        <strong>
                                                            {part.partName ||
                                                                part.name ||
                                                                part.partNumber ||
                                                                "Inventory Part"}
                                                        </strong>

                                                    </td>


                                                    <td>

                                                        {quantity}

                                                    </td>


                                                    <td>

                                                        {minimumStock}

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`status-badge ${
                                                                isOutOfStock
                                                                    ? "status-cancelled"
                                                                    : "status-pending"
                                                            }`}
                                                        >

                                                            {isOutOfStock
                                                                ? "OUT OF STOCK"
                                                                : "LOW STOCK"}

                                                        </span>

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


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="reports-footer">

                <div>

                    <span>
                        <ChartNoAxesCombined size={18} strokeWidth={1.8} aria-hidden />
                    </span>

                    <div>

                        <strong>
                            FieldSync Analytics
                        </strong>

                        <p>
                            Operational data is updated
                            directly from the FieldSync backend.
                        </p>

                    </div>

                </div>


                <button
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    ← Back to Dashboard
                </button>

            </div>

        </div>

    );

}


export default Reports;