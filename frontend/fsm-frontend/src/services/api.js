const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/$/, "");

function getErrorMessage(data, status) {
    if (data && typeof data === "object" && data.message) return data.message;
    if (typeof data === "string" && data.trim()) return data;
    return `Request failed (HTTP ${status})`;
}

async function request(url, options = {}) {
    const token = localStorage.getItem("fieldsyncToken");
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers
        });
    } catch {
        throw new Error("Unable to reach the server. Please check your connection and try again.");
    }

    const responseText = await response.text();
    let data = null;

    if (responseText) {
        try { data = JSON.parse(responseText); }
        catch { data = responseText; }
    }

    if (response.status === 401) {
        localStorage.removeItem("fieldsyncToken");
        localStorage.removeItem("fieldsyncAuthenticated");
        localStorage.removeItem("fieldsyncUser");
        window.dispatchEvent(new CustomEvent("fieldsync:session-expired"));
    }

    if (!response.ok) {
        throw new Error(getErrorMessage(data, response.status));
    }

    return data;
}

export function getCustomers() { return request("/customers"); }
export function getCurrentCustomer() { return request("/customers/me"); }
export function createCustomer(customer) { return request("/customers", { method: "POST", body: JSON.stringify(customer) }); }

export function getSites(customerId) { return request(`/sites/customer/${customerId}`); }
export function createSite(customerId, site) { return request(`/sites/customer/${customerId}`, { method: "POST", body: JSON.stringify(site) }); }

export function createServiceRequest(serviceRequest) { return request("/service-requests", { method: "POST", body: JSON.stringify(serviceRequest) }); }
export function getServiceRequests() { return request("/service-requests"); }
export function getServiceRequest(id) { return request(`/service-requests/${id}`); }

export function getWorkOrders() { return request("/work-orders"); }
export function getWorkOrder(id) { return request(`/work-orders/${id}`); }
export function getWorkOrdersByTechnician(id) { return request(`/work-orders/technician/${id}`); }
export function getWorkOrdersByCustomer(id) { return request(`/work-orders/customer/${id}`); }
export function getWorkOrdersByStatus(status) { return request(`/work-orders/status/${status}`); }
export function createWorkOrder(workOrder) { return request("/work-orders", { method: "POST", body: JSON.stringify(workOrder) }); }
export function updateWorkOrder(id, workOrder) { return request(`/work-orders/${id}`, { method: "PUT", body: JSON.stringify(workOrder) }); }
export function assignTechnician(workOrderId, technicianId) { return request(`/work-orders/${workOrderId}/assign?technicianId=${technicianId}`, { method: "POST" }); }
export function updateWorkOrderStatus(workOrderId, status) { return request(`/work-orders/${workOrderId}/status?status=${status}`, { method: "POST" }); }

export function getTechnicians() { return request("/technicians"); }
export function getTechnician(id) { return request(`/technicians/${id}`); }
export function getTechnicianByUserId(id) { return request(`/technicians/user/${id}`); }
export function createTechnician(data) { return request("/technicians", { method: "POST", body: JSON.stringify(data) }); }
export function updateTechnician(id, data) { return request(`/technicians/${id}`, { method: "PUT", body: JSON.stringify(data) }); }
export function deleteTechnician(id) { return request(`/technicians/${id}`, { method: "DELETE" }); }

export function getSchedules() { return request("/schedules"); }
export function getSchedule(id) { return request(`/schedules/${id}`); }
export function createSchedule(data) { return request("/schedules", { method: "POST", body: JSON.stringify(data) }); }
export function updateSchedule(id, data) { return request(`/schedules/${id}`, { method: "PUT", body: JSON.stringify(data) }); }
export function deleteSchedule(id) { return request(`/schedules/${id}`, { method: "DELETE" }); }
export function getSchedulesByTechnician(id) { return request(`/schedules/technician/${id}`); }
export function getSchedulesByWorkOrder(id) { return request(`/schedules/work-order/${id}`); }
export function getSchedulesByDate(date) { return request(`/schedules/date/${date}`); }
export function getSchedulesByStatus(status) { return request(`/schedules/status/${status}`); }

export function getJobExecutions() { return request("/job-executions"); }
export function getJobExecution(id) { return request(`/job-executions/${id}`); }
export function getJobExecutionBySchedule(id) { return request(`/job-executions/schedule/${id}`); }
export function getJobExecutionsByTechnician(id) { return request(`/job-executions/technician/${id}`); }
export function getJobExecutionsByWorkOrder(id) { return request(`/job-executions/work-order/${id}`); }
export function getJobExecutionsByStatus(status) { return request(`/job-executions/status/${status}`); }
export function startJob(data) { return request("/job-executions/start", { method: "POST", body: JSON.stringify(data) }); }
export function updateJobExecution(id, data) { return request(`/job-executions/${id}`, { method: "PUT", body: JSON.stringify(data) }); }
export function completeJob(id, data) { return request(`/job-executions/${id}/complete`, { method: "PUT", body: JSON.stringify(data) }); }
export function cancelJobExecution(id) { return request(`/job-executions/${id}/cancel`, { method: "PUT" }); }

export async function uploadJobPhoto(file, jobExecutionId) {
    if (!file) throw new Error("Please select an image.");
    if (!jobExecutionId) throw new Error("Job Execution ID is required.");
    if (file.size > 10 * 1024 * 1024) throw new Error("Image must be smaller than 10 MB.");
    return request("/job-photos/upload", {
        method: "POST",
        body: (() => { const form = new FormData(); form.append("file", file); form.append("jobExecutionId", String(jobExecutionId)); return form; })()
    });
}
export function getJobPhotosByExecution(id) { return request(`/job-photos/execution/${id}`); }
export function getJobPhotosByWorkOrder(id) { return request(`/job-photos/work-order/${id}`); }
export function getJobPhotosByTechnician(id) { return request(`/job-photos/technician/${id}`); }
export function getJobPhoto(id) { return request(`/job-photos/${id}`); }

export function getInventoryParts() { return request("/inventory"); }
export function getInventoryPart(id) { return request(`/inventory/${id}`); }
export function createInventoryPart(data) { return request("/inventory", { method: "POST", body: JSON.stringify(data) }); }
export function updateInventoryPart(id, data) { return request(`/inventory/${id}`, { method: "PUT", body: JSON.stringify(data) }); }
export function deleteInventoryPart(id) { return request(`/inventory/${id}`, { method: "DELETE" }); }
export function updateInventoryStock(id, quantity) { return request(`/inventory/${id}/stock?quantity=${quantity}`, { method: "PUT" }); }

export function recordPartUsage(data) { return request("/part-usage", { method: "POST", body: JSON.stringify(data) }); }
export function getPartUsageByWorkOrder(id) { return request(`/part-usage/work-order/${id}`); }
export function getPartUsageByJobExecution(id) { return request(`/part-usage/job-execution/${id}`); }
export function getPartUsageByTechnician(id) { return request(`/part-usage/technician/${id}`); }
export function deletePartUsage(id) { return request(`/part-usage/${id}`, { method: "DELETE" }); }
export function logTime(data) { return request("/time-logs", { method: "POST", body: JSON.stringify(data) }); }
export function getTimeLogsByWorkOrder(id) { return request(`/time-logs/work-order/${id}`); }
export function getNotifications() { return request("/notifications"); }
export function markNotificationRead(id) { return request(`/notifications/${id}/read`, { method: "PUT" }); }
export function getWorkOrderHistory(id) { return request(`/work-orders/${id}/history`); }
export function getReportsSummary() { return request("/reports/summary"); }

export function getInvoices() { return request("/invoices"); }
export function getInvoice(id) { return request(`/invoices/${id}`); }
export function createInvoice(data) { return request("/invoices", { method: "POST", body: JSON.stringify(data) }); }
export function updateInvoice(id, data) { return request(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(data) }); }
export function markInvoiceAsPaid(id) { return request(`/invoices/${id}/pay`, { method: "PUT" }); }
export function cancelInvoice(id) { return request(`/invoices/${id}/cancel`, { method: "PUT" }); }
export function deleteInvoice(id) { return request(`/invoices/${id}`, { method: "DELETE" }); }

export async function registerUser(userData) {
    return request("/users/register", { method: "POST", body: JSON.stringify(userData) });
}

export async function loginUser(loginData) {
    const data = await request("/users/login", { method: "POST", body: JSON.stringify(loginData) });
    if (data?.token) localStorage.setItem("fieldsyncToken", data.token);
    return data;
}
