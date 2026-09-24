import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCustomers,
  getCurrentCustomer,
  getTechnicians,
  getServiceRequests,
  getWorkOrders,
  getWorkOrdersByCustomer,
  getWorkOrdersByTechnician,
  getSchedules,
  getSchedulesByTechnician,
  getTechnicianByUserId,
  getInventoryParts,
  getInvoices,
} from "../services/api";

import "./Dashboard.css";
import ManagerDashboard from "./ManagerDashboard";


function Dashboard() {

  const navigate = useNavigate();

  // =====================================================
  // CURRENT USER
  // =====================================================

  let currentUser = null;

  try {

    const storedUser =
      localStorage.getItem("fieldsyncUser");

    currentUser =
      storedUser
        ? JSON.parse(storedUser)
        : null;

  } catch {

    currentUser = null;

  }


  const userRole =
    String(
      currentUser?.role || "CUSTOMER"
    ).toUpperCase();


  const userId =
    currentUser?.id;


  // =====================================================
  // STATE
  // =====================================================

  const [customers, setCustomers] = useState([]);

  const [technicians, setTechnicians] =
    useState([]);

  const [serviceRequests, setServiceRequests] =
    useState([]);

  const [workOrders, setWorkOrders] =
    useState([]);

  const [schedules, setSchedules] =
    useState([]);

  const [inventoryParts, setInventoryParts] =
    useState([]);

  const [invoices, setInvoices] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {

    loadDashboardData();

  }, []);


  async function loadDashboardData() {

    try {

      setError("");

      setRefreshing(true);


      // =================================================
      // CUSTOMER
      // =================================================

      if (userRole === "CUSTOMER") {

        /*
         * CUSTOMER SECURITY
         *
         * Customer must NOT request:
         *
         * GET /customers
         * GET /service-requests
         * GET /work-orders
         * GET /schedules
         * GET /inventory
         * GET /invoices
         *
         * The logged-in user's ID is NOT necessarily
         * the Customer table ID.
         *
         * Example:
         *
         * User ID     = 20
         * Customer ID = 16
         *
         * Therefore we first call:
         *
         * GET /api/customers/me
         *
         * The backend identifies the customer using
         * the authenticated JWT.
         *
         * Then we call:
         *
         * GET /api/work-orders/customer/16
         *
         * instead of:
         *
         * GET /api/work-orders/customer/20
         */


        if (userId) {

          // ---------------------------------------------
          // Get logged-in customer's profile
          // ---------------------------------------------

          const customer =
            await getCurrentCustomer();


          console.log(
            "👤 LOGGED-IN CUSTOMER:",
            customer
          );


          // ---------------------------------------------
          // Get actual Customer table ID
          // ---------------------------------------------

          const customerId =
            customer?.id;


          if (!customerId) {

            throw new Error(
              "Customer profile not found for the logged-in user."
            );

          }


          console.log(
            "👤 CUSTOMER ID:",
            customerId
          );


          // ---------------------------------------------
          // Get ONLY this customer's work orders
          // ---------------------------------------------

          const wo =
            await getWorkOrdersByCustomer(
              customerId
            );


          console.log(
            "📋 CUSTOMER WORK ORDERS:",
            wo
          );


          setWorkOrders(
            Array.isArray(wo)
              ? wo
              : []
          );

        }


        setLoading(false);

        setRefreshing(false);

        return;

      }


      // =================================================
      // TECHNICIAN
      // =================================================

      if (userRole === "TECHNICIAN") {

        /*
         * The logged-in user's ID is NOT the same as
         * the Technician table ID.
         *
         * Example:
         *
         * User ID       = 13
         * Technician ID = 1
         *
         * First get the technician record using the
         * logged-in User ID.
         *
         * Then use technician.id for technician-specific
         * APIs.
         */


        if (userId) {

          // ---------------------------------------------
          // Get technician record
          // ---------------------------------------------

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
              "Technician record not found for the logged-in user."
            );

          }


          console.log(
            "👨‍🔧 TECHNICIAN ID:",
            technicianId
          );


          // ---------------------------------------------
          // Load technician-specific data
          // ---------------------------------------------

          const [
            wo,
            sch,
            inv
          ] = await Promise.all([

            getWorkOrdersByTechnician(
              technicianId
            ),

            getSchedulesByTechnician(
              technicianId
            ),

            getInventoryParts()

          ]);


          setWorkOrders(
            Array.isArray(wo)
              ? wo
              : []
          );


          setSchedules(
            Array.isArray(sch)
              ? sch
              : []
          );


          setInventoryParts(
            Array.isArray(inv)
              ? inv
              : []
          );

        }


        setLoading(false);

        setRefreshing(false);

        return;

      }


      // =================================================
      // DISPATCHER
      // =================================================

      if (userRole === "DISPATCHER") {

        /*
         * Dispatcher can access:
         *
         * Customers
         * Technicians
         * Service Requests
         * Work Orders
         * Schedules
         * Inventory
         * Invoices
         */


        const [
          cD,
          tD,
          srD,
          woD,
          schD,
          invD,
          invoiceD
        ] = await Promise.all([

          getCustomers(),

          getTechnicians(),

          getServiceRequests(),

          getWorkOrders(),

          getSchedules(),

          getInventoryParts(),

          getInvoices()

        ]);


        setCustomers(
          Array.isArray(cD)
            ? cD
            : []
        );


        setTechnicians(
          Array.isArray(tD)
            ? tD
            : []
        );


        setServiceRequests(
          Array.isArray(srD)
            ? srD
            : []
        );


        setWorkOrders(
          Array.isArray(woD)
            ? woD
            : []
        );


        setSchedules(
          Array.isArray(schD)
            ? schD
            : []
        );


        setInventoryParts(
          Array.isArray(invD)
            ? invD
            : []
        );


        setInvoices(
          Array.isArray(invoiceD)
            ? invoiceD
            : []
        );


        setLoading(false);

        setRefreshing(false);

        return;

      }


      // =================================================
      // MANAGER
      // =================================================

      if (userRole === "MANAGER") {
        // ManagerDashboard owns manager-only operational data.
        // Keep this loader free of technician execution data.
        setLoading(false);
        setRefreshing(false);
        return;
      }


      // =================================================
      // UNKNOWN ROLE
      // =================================================

      throw new Error(
        `Unsupported role: ${userRole}`
      );

    } catch (err) {

      console.error(
        "Dashboard error:",
        err
      );


      setError(
        "Unable to load dashboard data. Please try again."
      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  }


  // =====================================================
  // STATS
  // =====================================================

  const totalCustomers =
    customers.length;


  const activeTechnicians =
    technicians.filter(t => {

      const status =
        String(
          t.status || ""
        ).toUpperCase();


      return (
        status === "ACTIVE" ||
        status === "AVAILABLE" ||
        status === ""
      );

    }).length;


  const openWorkOrders =
    workOrders.filter(w => {

      const status =
        String(
          w.status || ""
        ).toUpperCase();


      return (
        status !== "COMPLETED" &&
        status !== "CANCELLED"
      );

    }).length;


  const paidInvoices =
    invoices.filter(i =>
      String(
        i.status || ""
      ).toUpperCase() === "PAID"
    );


  const revenue =
    paidInvoices.reduce(
      (sum, i) =>
        sum +
        (
          Number(
            i.totalAmount || 0
          ) || 0
        ),
      0
    );


  const unpaidInvoices =
    invoices.filter(i => {

      const status =
        String(
          i.status || ""
        ).toUpperCase();


      return (
        status === "UNPAID" ||
        status === "OVERDUE"
      );

    });


  const lowStockItems =
    inventoryParts.filter(p => {

      const qty =
        Number(
          p.quantity ??
          p.stockQuantity ??
          p.currentStock ??
          0
        );


      const reorder =
        Number(
          p.reorderLevel ??
          p.minimumStock ??
          0
        );


      return (
        reorder > 0 &&
        qty <= reorder
      );

    });


  // =====================================================
  // TODAY
  // =====================================================

  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  const todaysSchedules =
    schedules
      .filter(s => {

        const date =
          s.scheduledDate ||
          s.date ||
          s.startDate;


        return (
          date &&
          String(date).startsWith(today)
        );

      })
      .sort((a, b) =>
        String(
          a.startTime ||
          a.scheduledTime ||
          ""
        ).localeCompare(
          String(
            b.startTime ||
            b.scheduledTime ||
            ""
          )
        )
      );


  // =====================================================
  // CUSTOMER DATA
  // =====================================================

  const customerOpenJobs =
    workOrders.filter(w => {

      const status =
        String(
          w.status || ""
        ).toUpperCase();


      return (
        status !== "COMPLETED" &&
        status !== "CANCELLED"
      );

    });


  const customerCompletedJobs =
    workOrders.filter(w =>
      String(
        w.status || ""
      ).toUpperCase() === "COMPLETED"
    );


  // =====================================================
  // TECHNICIAN DATA
  // =====================================================

  const technicianActiveJobs =
    workOrders.filter(w => {

      const status =
        String(
          w.status || ""
        ).toUpperCase();


      return (
        status === "ASSIGNED" ||
        status === "IN_PROGRESS"
      );

    });


  const technicianCompletedJobs =
    workOrders.filter(w =>
      String(
        w.status || ""
      ).toUpperCase() === "COMPLETED"
    );


  // =====================================================
  // DISPATCHER / MANAGER DATA
  // =====================================================

  const urgentWorkOrders =
    workOrders.filter(o => {

      const priority =
        String(
          o.priority || ""
        ).toUpperCase();


      const status =
        String(
          o.status || ""
        ).toUpperCase();


      return (
        (
          priority === "URGENT" ||
          priority === "HIGH"
        ) &&
        status !== "COMPLETED" &&
        status !== "CANCELLED"
      );

    });


  const unassignedRequests =
    serviceRequests.filter(r => {

      const technicianId =
        r.technicianId ??
        r.assignedTechnicianId ??
        r.technician?.id;


      return (
        technicianId === null ||
        technicianId === undefined
      );

    });


  const availableTechs =
    technicians.filter(t => {

      const status =
        String(
          t.status || ""
        ).toUpperCase();


      return (
        status === "AVAILABLE" ||
        status === "ACTIVE" ||
        status === ""
      );

    });


  const busyTechs =
    technicians.filter(t => {

      const status =
        String(
          t.status || ""
        ).toUpperCase();


      return (
        status === "BUSY" ||
        status === "ON_JOB" ||
        status === "IN_PROGRESS"
      );

    });


  const offlineTechs =
    technicians.filter(t => {

      const status =
        String(
          t.status || ""
        ).toUpperCase();


      return (
        status === "OFFLINE" ||
        status === "INACTIVE"
      );

    });


  const scheduledTechs =
    technicians.filter(t =>
      String(
        t.status || ""
      ).toUpperCase() === "SCHEDULED"
    );


  // =====================================================
  // RECENT DATA
  // =====================================================

  const recentSR =
    [...serviceRequests]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt ||
            b.createdDate ||
            0
          ) -
          new Date(
            a.createdAt ||
            a.createdDate ||
            0
          )
      )
      .slice(0, 5);


  const recentWO =
    [...workOrders]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt ||
            b.createdDate ||
            0
          ) -
          new Date(
            a.createdAt ||
            a.createdDate ||
            0
          )
      )
      .slice(0, 5);


  // =====================================================
  // HELPERS
  // =====================================================

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


  function getStatusBadge(status) {

    const s =
      String(
        status || ""
      ).toUpperCase();


    if (s === "COMPLETED")
      return "badge-success";


    if (
      s === "IN_PROGRESS" ||
      s === "ASSIGNED"
    )
      return "badge-info";


    if (
      s === "PENDING" ||
      s === "SCHEDULED"
    )
      return "badge-warning";


    if (s === "CANCELLED")
      return "badge-danger";


    if (
      s === "NEW" ||
      s === "OPEN"
    )
      return "badge-primary";


    return "badge-info";

  }


  function getTechName(t) {

    return (
      t.fullName ||
      t.name ||
      t.username ||
      t.email ||
      "Technician"
    );

  }


  function getTechStatusClass(t) {

    const status =
      String(
        t.status || "ACTIVE"
      ).toUpperCase();


    if (
      status === "BUSY" ||
      status === "ON_JOB" ||
      status === "IN_PROGRESS"
    )
      return "busy";


    if (status === "SCHEDULED")
      return "scheduled";


    if (
      status === "OFFLINE" ||
      status === "INACTIVE"
    )
      return "offline";


    return "available";

  }


  function getTechStatusLabel(t) {

    const status =
      String(
        t.status || "ACTIVE"
      ).toUpperCase();


    if (
      status === "ON_JOB" ||
      status === "IN_PROGRESS"
    )
      return "On Job";


    if (status === "ACTIVE")
      return "Available";


    return status.replace(
      /_/g,
      " "
    );

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="dash-loading">

        <div className="dash-spinner"></div>

        <h2>
          Loading FieldSync...
        </h2>

        <p>
          Preparing your operations center.
        </p>

      </div>

    );

  }


  // =====================================================
  // CUSTOMER DASHBOARD
  // =====================================================

  if (userRole === "CUSTOMER") {

    return (

      <div className="dash">

        <div className="page-header">

          <div>

            <h1>
              Customer Dashboard
            </h1>

            <p>
              View your service requests,
              work orders and job status.
            </p>

          </div>


          <div className="dash-header-actions">

            <button
              className="btn btn-outline"
              onClick={loadDashboardData}
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>


            <button
              className="btn btn-primary"
              onClick={() =>
                navigate(
                  "/service-requests/new"
                )
              }
            >
              + New Service Request
            </button>

          </div>

        </div>


        {error && (

          <div className="dash-error">

            <span>⚠️</span>

            <span>
              {error}
            </span>

            <button
              onClick={loadDashboardData}
            >
              Retry
            </button>

          </div>

        )}


        <div className="dash-stats">

          <div className="dash-stat-card">

            <h2>
              {workOrders.length}
            </h2>

            <p>
              My Work Orders
            </p>

          </div>


          <div className="dash-stat-card">

            <h2>
              {customerOpenJobs.length}
            </h2>

            <p>
              Active Jobs
            </p>

          </div>


          <div className="dash-stat-card">

            <h2>
              {customerCompletedJobs.length}
            </h2>

            <p>
              Completed Jobs
            </p>

          </div>

        </div>


        <section className="card dash-section">

          <div className="dash-section-head">

            <div>

              <h2>
                My Recent Work Orders
              </h2>

              <p>
                Latest service activity for your account.
              </p>

            </div>


            <button
              className="btn btn-sm btn-outline"
              onClick={() =>
                navigate("/work-orders")
              }
            >
              View Work Orders
            </button>

          </div>


          {recentWO.length === 0 ? (

            <div className="empty-state">

              <h3>
                No work orders yet
              </h3>

              <p>
                Create a service request to get started.
              </p>

            </div>

          ) : (

            <div className="dash-recent-list">

              {recentWO.map(order => (

                <div
                  className="dash-recent-item"
                  key={order.id}
                  onClick={() =>
                    navigate("/work-orders")
                  }
                >

                  <div>

                    <strong>
                      {
                        order.orderNumber ||
                        `WO-${String(order.id).padStart(4, "0")}`
                      }
                    </strong>


                    <span>
                      {
                        order.description ||
                        "Service Work Order"
                      }
                    </span>

                  </div>


                  <span
                    className={`badge ${getStatusBadge(
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

                </div>

              ))}

            </div>

          )}

        </section>


        <section className="card dash-quick">

          <div>

            <h3>
              Need Service?
            </h3>

            <p>
              Create a new service request.
            </p>

          </div>


          <button
            className="btn btn-primary"
            onClick={() =>
              navigate(
                "/service-requests/new"
              )
            }
          >
            + New Service Request
          </button>

        </section>

      </div>

    );

  }


  // =====================================================
  // TECHNICIAN DASHBOARD
  // =====================================================

  if (userRole === "TECHNICIAN") {

    return (

      <div className="dash">

        <div className="page-header">

          <div>

            <h1>
              Technician Dashboard
            </h1>

            <p>
              Manage your assigned field jobs and inventory.
            </p>

          </div>


          <button
            className="btn btn-outline"
            onClick={loadDashboardData}
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>


        {error && (

          <div className="dash-error">

            <span>⚠️</span>

            <span>
              {error}
            </span>

            <button
              onClick={loadDashboardData}
            >
              Retry
            </button>

          </div>

        )}


        <div className="dash-stats">

          <div className="dash-stat-card">

            <h2>
              {workOrders.length}
            </h2>

            <p>
              Assigned Work Orders
            </p>

          </div>


          <div className="dash-stat-card">

            <h2>
              {technicianActiveJobs.length}
            </h2>

            <p>
              Active Jobs
            </p>

          </div>


          <div className="dash-stat-card">

            <h2>
              {technicianCompletedJobs.length}
            </h2>

            <p>
              Completed Jobs
            </p>

          </div>


          <div className="dash-stat-card">

            <h2>
              {lowStockItems.length}
            </h2>

            <p>
              Low Stock Parts
            </p>

          </div>

        </div>


        <div className="dash-two-col">

          <section className="card dash-panel">

            <div className="dash-panel-head">

              <div>

                <h3>
                  My Assigned Jobs
                </h3>

                <p>
                  Work orders assigned to you.
                </p>

              </div>


              <button
                className="btn btn-sm btn-outline"
                onClick={() =>
                  navigate("/work-orders")
                }
              >
                View Jobs
              </button>

            </div>


            {workOrders.length === 0 ? (

              <div className="empty-state">

                <h3>
                  No assigned jobs
                </h3>

                <p>
                  You currently have no assigned work orders.
                </p>

              </div>

            ) : (

              <div className="dash-recent-list">

                {recentWO.map(order => (

                  <div
                    className="dash-recent-item"
                    key={order.id}
                    onClick={() =>
                      navigate("/work-orders")
                    }
                  >

                    <div>

                      <strong>
                        {
                          order.orderNumber ||
                          `WO-${String(order.id).padStart(4, "0")}`
                        }
                      </strong>


                      <span>
                        {
                          order.description ||
                          "Work Order"
                        }
                      </span>

                    </div>


                    <span
                      className={`badge ${getStatusBadge(
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

                  </div>

                ))}

              </div>

            )}

          </section>


          <section className="card dash-panel">

            <div className="dash-panel-head">

              <div>

                <h3>
                  Today's Schedule
                </h3>

                <p>
                  Your scheduled field activity.
                </p>

              </div>


              <button
                className="btn btn-sm btn-outline"
                onClick={() =>
                  navigate("/schedule")
                }
              >
                Schedule
              </button>

            </div>


            {todaysSchedules.length === 0 ? (

              <div className="empty-state">

                <h3>
                  No jobs scheduled today
                </h3>

              </div>

            ) : (

              <div className="dash-activity-list">

                {todaysSchedules
                  .slice(0, 6)
                  .map(schedule => (

                    <div
                      className="dash-activity-item"
                      key={schedule.id}
                    >

                      <div className="dash-activity-time">

                        {
                          schedule.startTime ||
                          schedule.scheduledTime ||
                          "--:--"
                        }

                      </div>


                      <div className="dash-activity-dot"></div>


                      <div className="dash-activity-info">

                        <strong>
                          {
                            schedule.title ||
                            schedule.description ||
                            "Scheduled Service"
                          }
                        </strong>


                        <p>
                          {
                            schedule.customerName ||
                            schedule.customer?.name ||
                            `Work Order #${
                              schedule.workOrderId || "-"
                            }`
                          }
                        </p>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </section>

        </div>


        <section className="card dash-quick">

          <div>

            <h3>
              Quick Actions
            </h3>

            <p>
              Manage your field work.
            </p>

          </div>


          <div className="dash-quick-btns">

            <button
              className="btn btn-primary"
              onClick={() =>
                navigate("/work-orders")
              }
            >
              Work Orders
            </button>


            <button
              className="btn btn-outline"
              onClick={() =>
                navigate("/schedule")
              }
            >
              Schedule
            </button>


            <button
              className="btn btn-outline"
              onClick={() =>
                navigate("/inventory")
              }
            >
              Inventory
            </button>


            <button
              className="btn btn-outline"
              onClick={() =>
                navigate("/job-execution")
              }
            >
              Job Execution
            </button>

          </div>

        </section>

      </div>

    );

  }


  // =====================================================
  // DISPATCHER / MANAGER DASHBOARD
  // =====================================================

  if (userRole === "MANAGER") {
    return <ManagerDashboard />;
  }


  return (

    <div className="dash">

      <div className="page-header">

        <div>

          <h1>
            {userRole === "MANAGER"
              ? "Manager Dashboard"
              : "Dispatcher Dashboard"}
          </h1>


          <p>
            Everything your field team needs to stay on top of today's operations.
          </p>

        </div>


        <div className="dash-header-actions">

          <button
            className="btn btn-outline"
            onClick={loadDashboardData}
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>


          <button
            className="btn btn-primary"
            onClick={() =>
              navigate(
                "/service-requests/new"
              )
            }
          >
            + New Service Request
          </button>

        </div>

      </div>


      {error && (

        <div className="dash-error">

          <span>⚠️</span>

          <span>
            {error}
          </span>

          <button
            onClick={loadDashboardData}
          >
            Retry
          </button>

        </div>

      )}


      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="dash-stats">

        <div
          className="dash-stat-card"
          onClick={() =>
            navigate("/customers")
          }
        >

          <h2>
            {totalCustomers}
          </h2>

          <p>
            Total Customers
          </p>

        </div>


        <div
          className="dash-stat-card"
          onClick={() =>
            navigate("/technicians")
          }
        >

          <h2>
            {activeTechnicians}
          </h2>

          <p>
            Active Technicians
          </p>

        </div>


        <div
          className="dash-stat-card"
          onClick={() =>
            navigate("/work-orders")
          }
        >

          <h2>
            {openWorkOrders}
          </h2>

          <p>
            Open Work Orders
          </p>

        </div>


        <div
          className="dash-stat-card"
          onClick={() =>
            navigate("/billing")
          }
        >

          <h2>
            {formatMoney(revenue)}
          </h2>

          <p>
            Paid Revenue
          </p>

        </div>

      </div>


      {/* =================================================
          ACTION REQUIRED
      ================================================= */}

      <section className="card dash-section">

        <div className="dash-section-head">

          <div>

            <h2>
              Action Required
            </h2>

            <p>
              Items that may need your attention.
            </p>

          </div>

        </div>


        <div className="dash-actions">

          <div
            className="dash-action-card action-urgent"
            onClick={() =>
              navigate("/work-orders")
            }
          >

            <div className="dash-action-icon">
              ⚠
            </div>


            <div className="dash-action-body">

              <strong>
                {urgentWorkOrders.length}
              </strong>

              <span>
                High Priority Jobs
              </span>

            </div>

          </div>


          <div
            className="dash-action-card action-unpaid"
            onClick={() =>
              navigate("/billing")
            }
          >

            <div className="dash-action-icon">
              ₹
            </div>


            <div className="dash-action-body">

              <strong>
                {unpaidInvoices.length}
              </strong>

              <span>
                Unpaid Invoices
              </span>

            </div>

          </div>


          <div
            className="dash-action-card action-stock"
            onClick={() =>
              navigate("/inventory")
            }
          >

            <div className="dash-action-icon">
              📦
            </div>


            <div className="dash-action-body">

              <strong>
                {lowStockItems.length}
              </strong>

              <span>
                Low Stock Parts
              </span>

            </div>

          </div>


          <div
            className="dash-action-card action-requests"
            onClick={() =>
              navigate("/service-requests/new")
            }
          >

            <div className="dash-action-icon">
              ✉
            </div>


            <div className="dash-action-body">

              <strong>
                {unassignedRequests.length}
              </strong>

              <span>
                Unassigned Requests
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          TWO COLUMNS
      ================================================= */}

      <div className="dash-two-col">

        {/* TODAY'S SCHEDULE */}

        <section className="card dash-panel">

          <div className="dash-panel-head">

            <div>

              <h3>
                Today's Field Activity
              </h3>

              <p>
                Scheduled jobs and appointments.
              </p>

            </div>


            <button
              className="btn btn-sm btn-outline"
              onClick={() =>
                navigate("/schedule")
              }
            >
              View Schedule
            </button>

          </div>


          {todaysSchedules.length === 0 ? (

            <div className="empty-state">

              <h3>
                No jobs scheduled today
              </h3>

              <p>
                Your field team has no appointments.
              </p>

            </div>

          ) : (

            <div className="dash-activity-list">

              {todaysSchedules
                .slice(0, 6)
                .map(schedule => (

                  <div
                    className="dash-activity-item"
                    key={schedule.id}
                    onClick={() =>
                      navigate("/schedule")
                    }
                  >

                    <div className="dash-activity-time">

                      {
                        schedule.startTime ||
                        schedule.scheduledTime ||
                        "--:--"
                      }

                    </div>


                    <div className="dash-activity-dot"></div>


                    <div className="dash-activity-info">

                      <strong>
                        {
                          schedule.title ||
                          schedule.description ||
                          "Scheduled Service"
                        }
                      </strong>


                      <p>
                        {
                          schedule.customerName ||
                          schedule.customer?.name ||
                          `Work Order #${
                            schedule.workOrderId || "-"
                          }`
                        }
                      </p>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>


        {/* TECHNICIANS */}

        <section className="card dash-panel">

          <div className="dash-panel-head">

            <div>

              <h3>
                Technician Availability
              </h3>

              <p>
                Current field team status.
              </p>

            </div>


            <button
              className="btn btn-sm btn-outline"
              onClick={() =>
                navigate("/technicians")
              }
            >
              View Team
            </button>

          </div>


          <div className="dash-tech-summary">

            <div className="dash-tech-stat">

              <strong>
                {availableTechs.length}
              </strong>

              <span>
                Available
              </span>

            </div>


            <div className="dash-tech-stat">

              <strong>
                {busyTechs.length}
              </strong>

              <span>
                On Job
              </span>

            </div>


            <div className="dash-tech-stat">

              <strong>
                {scheduledTechs.length}
              </strong>

              <span>
                Scheduled
              </span>

            </div>


            <div className="dash-tech-stat">

              <strong>
                {offlineTechs.length}
              </strong>

              <span>
                Offline
              </span>

            </div>

          </div>


          <div className="dash-tech-list">

            {technicians.length === 0 ? (

              <div className="empty-state">

                <h3>
                  No technicians
                </h3>

              </div>

            ) : (

              technicians
                .slice(0, 5)
                .map(technician => {

                  const statusClass =
                    getTechStatusClass(
                      technician
                    );


                  return (

                    <div
                      className="dash-tech-item"
                      key={technician.id}
                    >

                      <div className="dash-tech-avatar">

                        {getTechName(
                          technician
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>


                      <div className="dash-tech-info">

                        <strong>
                          {getTechName(
                            technician
                          )}
                        </strong>


                        <span>
                          {
                            technician.specialization ||
                            technician.skill ||
                            "Field Technician"
                          }
                        </span>

                      </div>


                      <span
                        className={`badge ${
                          statusClass === "available"
                            ? "badge-success"
                            : statusClass === "busy"
                            ? "badge-info"
                            : statusClass === "scheduled"
                            ? "badge-warning"
                            : "badge-danger"
                        }`}
                      >

                        {getTechStatusLabel(
                          technician
                        )}

                      </span>

                    </div>

                  );

                })

            )}

          </div>

        </section>

      </div>


      {/* =================================================
          RECENT ACTIVITY
      ================================================= */}

      <section className="card dash-section">

        <div className="dash-section-head">

          <div>

            <h2>
              Recent Activity
            </h2>

            <p>
              Latest requests and work orders.
            </p>

          </div>

        </div>


        <div className="dash-recent-grid">

          {/* SERVICE REQUESTS */}

          <div className="dash-recent-card">

            <div className="dash-recent-head">

              <div>

                <h4>
                  Latest Requests
                </h4>

                <span>
                  {serviceRequests.length} total
                </span>

              </div>

            </div>


            {recentSR.length === 0 ? (

              <div className="empty-state">

                <h3>
                  No requests
                </h3>

              </div>

            ) : (

              <div className="dash-recent-list">

                {recentSR.map(request => (

                  <div
                    className="dash-recent-item"
                    key={request.id}
                    onClick={() =>
                      navigate(
                        "/service-requests/new"
                      )
                    }
                  >

                    <div>

                      <strong>
                        {
                          request.requestNumber ||
                          `SR-${String(
                            request.id
                          ).padStart(
                            4,
                            "0"
                          )}`
                        }
                      </strong>


                      <span>
                        {
                          request.description ||
                          request.title ||
                          "Service Request"
                        }
                      </span>

                    </div>


                    <span
                      className={`badge ${getStatusBadge(
                        request.status
                      )}`}
                    >

                      {String(
                        request.status ||
                        "NEW"
                      ).replace(
                        /_/g,
                        " "
                      )}

                    </span>

                  </div>

                ))}

              </div>

            )}

          </div>


          {/* WORK ORDERS */}

          <div className="dash-recent-card">

            <div className="dash-recent-head">

              <div>

                <h4>
                  Latest Work Orders
                </h4>

                <span>
                  {workOrders.length} total
                </span>

              </div>

            </div>


            {recentWO.length === 0 ? (

              <div className="empty-state">

                <h3>
                  No work orders
                </h3>

              </div>

            ) : (

              <div className="dash-recent-list">

                {recentWO.map(order => (

                  <div
                    className="dash-recent-item"
                    key={order.id}
                    onClick={() =>
                      navigate(
                        "/work-orders"
                      )
                    }
                  >

                    <div>

                      <strong>
                        {
                          order.orderNumber ||
                          `WO-${String(
                            order.id
                          ).padStart(
                            4,
                            "0"
                          )}`
                        }
                      </strong>


                      <span>
                        {
                          order.description ||
                          "Work Order"
                        }
                      </span>

                    </div>


                    <span
                      className={`badge ${getStatusBadge(
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

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </section>


      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section className="card dash-quick">

        <div>

          <h3>
            Quick Actions
          </h3>

          <p>
            What would you like to do?
          </p>

        </div>


        <div className="dash-quick-btns">

          <button
            className="btn btn-primary"
            onClick={() =>
              navigate(
                "/service-requests/new"
              )
            }
          >
            + New Request
          </button>


          <button
            className="btn btn-outline"
            onClick={() =>
              navigate(
                "/work-orders"
              )
            }
          >
            Work Orders
          </button>


          <button
            className="btn btn-outline"
            onClick={() =>
              navigate(
                "/schedule"
              )
            }
          >
            Schedule
          </button>


          <button
            className="btn btn-outline"
            onClick={() =>
              navigate(
                "/inventory"
              )
            }
          >
            Inventory
          </button>

        </div>

      </section>

    </div>

  );

}


export default Dashboard;