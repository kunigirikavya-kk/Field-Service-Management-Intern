import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, UsersRound, XCircle } from "lucide-react";
import {
  getServiceRequests,
  getTechnicians,
  getWorkOrders,
  updateWorkOrderStatus
} from "../services/api";
import "./ManagerDashboard.css";

function normalize(value) {
  return String(value || "").toUpperCase();
}

function ManagerDashboard() {
  const [workOrders, setWorkOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [closingId, setClosingId] = useState(null);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");
      setRefreshing(true);
      const [orders, serviceRequests, techs] = await Promise.all([
        getWorkOrders(),
        getServiceRequests(),
        getTechnicians()
      ]);
      setWorkOrders(Array.isArray(orders) ? orders : []);
      setRequests(Array.isArray(serviceRequests) ? serviceRequests : []);
      setTechnicians(Array.isArray(techs) ? techs : []);
    } catch (err) {
      console.error("Manager dashboard error:", err);
      setError(err.message || "Unable to load manager operations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeWorkOrders = useMemo(
    () =>
      workOrders.filter((order) => {
        const status = normalize(order.status);
        return !["COMPLETED", "CLOSED", "CANCELLED"].includes(status);
      }),
    [workOrders]
  );

  const unassignedRequests = useMemo(
    () =>
      requests.filter((request) => {
        const technicianId =
          request.technicianId ??
          request.assignedTechnicianId ??
          request.technician?.id;
        return technicianId === null || technicianId === undefined;
      }),
    [requests]
  );

  const pendingCloseout = useMemo(
    () =>
      workOrders.filter(
        (order) => normalize(order.status) === "COMPLETED"
      ),
    [workOrders]
  );

  const slaWarnings = useMemo(() => {
    const now = Date.now();
    return activeWorkOrders.filter((order) => {
      const explicit =
        order.slaBreached ??
        order.slaBreachedFlag ??
        order.isSlaBreached;
      if (explicit === true) return true;

      const deadline =
        order.slaDueAt ||
        order.slaDueDate ||
        order.dueDate ||
        order.expectedCompletionAt;

      if (!deadline) return false;
      const time = new Date(deadline).getTime();
      return Number.isFinite(time) && time < now;
    });
  }, [activeWorkOrders]);

  const availableTechnicians = technicians.filter((tech) =>
    ["AVAILABLE", "ACTIVE", ""].includes(normalize(tech.status))
  );

  const busyTechnicians = technicians.filter((tech) =>
    ["BUSY", "ON_JOB", "IN_PROGRESS"].includes(normalize(tech.status))
  );

  async function closeWorkOrder(order) {
    try {
      setClosingId(order.id);
      setError("");
      await updateWorkOrderStatus(order.id, "CLOSED");
      setWorkOrders((current) =>
        current.map((item) =>
          item.id === order.id ? { ...item, status: "CLOSED" } : item
        )
      );
    } catch (err) {
      console.error("Failed to close work order:", err);
      setError(err.message || "Unable to close this work order.");
    } finally {
      setClosingId(null);
    }
  }

  function workOrderNumber(order) {
    return (
      order.workOrderNumber ||
      order.orderNumber ||
      `WO-${String(order.id).padStart(4, "0")}`
    );
  }

  if (loading) {
    return (
      <main className="manager-dashboard">
        <div className="manager-loading">Loading operations...</div>
      </main>
    );
  }

  return (
    <main className="manager-dashboard">
      <header className="manager-header">
        <div>
          <span className="manager-eyebrow">OPERATIONS CENTER</span>
          <h1>Manager Dashboard</h1>
          <p>Monitor field operations, SLA risk, technician availability, and work-order close-out.</p>
        </div>
        <button className="manager-refresh" onClick={loadData} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="manager-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <section className="manager-metrics">
        <article className="manager-metric">
          <span className="manager-metric-icon indigo"><Clock3 size={18} /></span>
          <div><strong>{activeWorkOrders.length}</strong><span>Active Work Orders</span></div>
        </article>
        <article className="manager-metric">
          <span className="manager-metric-icon terracotta"><AlertTriangle size={18} /></span>
          <div><strong>{unassignedRequests.length}</strong><span>Unassigned Requests</span></div>
        </article>
        <article className="manager-metric">
          <span className="manager-metric-icon gold"><XCircle size={18} /></span>
          <div><strong>{slaWarnings.length}</strong><span>SLA Breach Warnings</span></div>
        </article>
        <article className="manager-metric">
          <span className="manager-metric-icon sage"><UsersRound size={18} /></span>
          <div><strong>{availableTechnicians.length}</strong><span>Technicians Available</span></div>
        </article>
      </section>

      <section className="manager-panel">
        <div className="manager-panel-head">
          <div>
            <span className="manager-section-kicker">MANAGER CONTROL</span>
            <h2>Pending Close-out</h2>
            <p>Review completed field work and perform the official COMPLETED → CLOSED transition.</p>
          </div>
          <span className="manager-count">{pendingCloseout.length} pending</span>
        </div>

        {pendingCloseout.length === 0 ? (
          <div className="manager-empty">
            <CheckCircle2 size={22} />
            <div><strong>No work orders pending close-out</strong><span>Completed field work is fully closed.</span></div>
          </div>
        ) : (
          <div className="manager-table-wrap">
            <table className="manager-table">
              <thead>
                <tr>
                  <th>Work Order</th>
                  <th>Customer</th>
                  <th>Technician</th>
                  <th>Completed</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pendingCloseout.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{workOrderNumber(order)}</strong></td>
                    <td>{order.customerName || order.customer?.name || "—"}</td>
                    <td>{order.technicianName || order.technician?.name || "—"}</td>
                    <td>{order.completedAt ? new Date(order.completedAt).toLocaleString() : "Completed"}</td>
                    <td><span className="manager-status completed">COMPLETED</span></td>
                    <td>
                      <button
                        className="manager-close-btn"
                        onClick={() => closeWorkOrder(order)}
                        disabled={closingId === order.id}
                      >
                        {closingId === order.id ? "Closing..." : "Close Work Order"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="manager-panel">
        <div className="manager-panel-head compact">
          <div>
            <span className="manager-section-kicker">FIELD OVERSIGHT</span>
            <h2>Technician Availability</h2>
            <p>Operational availability only — field execution actions remain on the Technician page.</p>
          </div>
        </div>
        <div className="manager-tech-grid">
          <div className="manager-tech-stat"><strong>{availableTechnicians.length}</strong><span>Available</span></div>
          <div className="manager-tech-stat"><strong>{busyTechnicians.length}</strong><span>On Job</span></div>
          <div className="manager-tech-stat"><strong>{technicians.length - availableTechnicians.length - busyTechnicians.length}</strong><span>Other / Offline</span></div>
        </div>
      </section>
    </main>
  );
}

export default ManagerDashboard;
