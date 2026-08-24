const API_BASE_URL = "http://localhost:8080/api";

async function request(url, options = {}) {

    console.log(
        "➡️ API REQUEST:",
        options.method || "GET",
        url
    );

    const token = localStorage.getItem("fieldsyncToken");

    const response = await fetch(
        `${API_BASE_URL}${url}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                ...(token
                    ? {
                        Authorization: `Bearer ${token}`
                    }
                    : {}),

                ...(options.headers || {})
            }
        }
    );

    const responseText = await response.text();

    console.log(
        "⬅️ API RESPONSE:",
        response.status,
        responseText
    );

    if (!response.ok) {

        throw new Error(
            `HTTP ${response.status}: ${
                responseText || "Request failed"
            }`
        );
    }

    if (!responseText) {
        return null;
    }

    return JSON.parse(responseText);
}


// --------------------
// CUSTOMERS
// --------------------

export function getCustomers() {
    return request("/customers");
}

export function createCustomer(customer) {

    return request("/customers", {
        method: "POST",
        body: JSON.stringify(customer)
    });
}


// --------------------
// SITES
// --------------------

export function getSites(customerId) {

    return request(
        `/sites/customer/${customerId}`
    );
}

export function createSite(customerId, site) {

    return request(
        `/sites/customer/${customerId}`,
        {
            method: "POST",
            body: JSON.stringify(site)
        }
    );
}


// --------------------
// WORK ORDERS
// --------------------

export function getWorkOrders() {

    return request("/work-orders");
}

export function getWorkOrder(id) {

    return request(`/work-orders/${id}`);
}

export function createWorkOrder(workOrder) {

    return request("/work-orders", {
        method: "POST",
        body: JSON.stringify(workOrder)
    });
}

export function updateWorkOrder(id, workOrder) {

    return request(`/work-orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(workOrder)
    });
}


// --------------------
// TECHNICIANS
// --------------------

export function getTechnicians() {

    return request("/technicians");
}

export function getTechnician(id) {

    return request(`/technicians/${id}`);
}

export function createTechnician(technician) {

    return request("/technicians", {
        method: "POST",
        body: JSON.stringify(technician)
    });
}

export function updateTechnician(id, technician) {

    return request(`/technicians/${id}`, {
        method: "PUT",
        body: JSON.stringify(technician)
    });
}

export function deleteTechnician(id) {

    return request(`/technicians/${id}`, {
        method: "DELETE"
    });
}
// --------------------
// SCHEDULES
// --------------------

export function getSchedules() {

    return request("/schedules");
}


export function getSchedule(id) {

    return request(`/schedules/${id}`);
}


export function createSchedule(schedule) {

    return request("/schedules", {
        method: "POST",
        body: JSON.stringify(schedule)
    });
}


export function updateSchedule(id, schedule) {

    return request(`/schedules/${id}`, {
        method: "PUT",
        body: JSON.stringify(schedule)
    });
}


export function deleteSchedule(id) {

    return request(`/schedules/${id}`, {
        method: "DELETE"
    });
}


export function getSchedulesByTechnician(technicianId) {

    return request(
        `/schedules/technician/${technicianId}`
    );
}


export function getSchedulesByWorkOrder(workOrderId) {

    return request(
        `/schedules/work-order/${workOrderId}`
    );
}


export function getSchedulesByDate(date) {

    return request(
        `/schedules/date/${date}`
    );
}


export function getSchedulesByStatus(status) {

    return request(
        `/schedules/status/${status}`
    );
}

// --------------------
// JOB EXECUTIONS
// --------------------

export function getJobExecutions() {

    return request("/job-executions");
}


export function getJobExecution(id) {

    return request(`/job-executions/${id}`);
}


export function getJobExecutionBySchedule(scheduleId) {

    return request(
        `/job-executions/schedule/${scheduleId}`
    );
}


export function startJob(jobExecution) {

    return request("/job-executions/start", {
        method: "POST",
        body: JSON.stringify(jobExecution)
    });
}


export function updateJobExecution(id, jobExecution) {

    return request(`/job-executions/${id}`, {
        method: "PUT",
        body: JSON.stringify(jobExecution)
    });
}


export function completeJob(id, jobExecution) {

    return request(
        `/job-executions/${id}/complete`,
        {
            method: "PUT",
            body: JSON.stringify(jobExecution)
        }
    );
}


export function cancelJobExecution(id) {

    return request(
        `/job-executions/${id}/cancel`,
        {
            method: "PUT"
        }
    );
}


export function getJobExecutionsByTechnician(
    technicianId
) {

    return request(
        `/job-executions/technician/${technicianId}`
    );
}


export function getJobExecutionsByWorkOrder(
    workOrderId
) {

    return request(
        `/job-executions/work-order/${workOrderId}`
    );
}


export function getJobExecutionsByStatus(
    status
) {

    return request(
        `/job-executions/status/${status}`
    );
}

// --------------------
// INVENTORY
// --------------------

export function getInventoryParts() {
    return request("/inventory");
}

export function getInventoryPart(id) {
    return request(`/inventory/${id}`);
}

export function createInventoryPart(part) {
    return request("/inventory", {
        method: "POST",
        body: JSON.stringify(part)
    });
}

export function updateInventoryPart(id, part) {
    return request(`/inventory/${id}`, {
        method: "PUT",
        body: JSON.stringify(part)
    });
}

export function deleteInventoryPart(id) {
    return request(`/inventory/${id}`, {
        method: "DELETE"
    });
}

export function updateInventoryStock(id, quantity) {
    return request(
        `/inventory/${id}/stock?quantity=${quantity}`,
        {
            method: "PUT"
        }
    );
}

// --------------------
// BILLING / INVOICES
// --------------------

export function getInvoices() {
    return request("/invoices");
}

export function getInvoice(id) {
    return request(`/invoices/${id}`);
}

export function createInvoice(invoice) {
    return request("/invoices", {
        method: "POST",
        body: JSON.stringify(invoice)
    });
}

export function updateInvoice(id, invoice) {
    return request(`/invoices/${id}`, {
        method: "PUT",
        body: JSON.stringify(invoice)
    });
}

export function markInvoiceAsPaid(id) {
    return request(`/invoices/${id}/pay`, {
        method: "PUT"
    });
}

export function cancelInvoice(id) {
    return request(`/invoices/${id}/cancel`, {
        method: "PUT"
    });
}

export function deleteInvoice(id) {
    return request(`/invoices/${id}`, {
        method: "DELETE"
    });
}

export const registerUser = async (userData) => {

    const response = await fetch(
        `${API_BASE_URL}/users/register`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(userData)
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.message || "Registration failed"
        );
    }


    return data;
};

export const loginUser = async (loginData) => {

    const response = await fetch(
        `${API_BASE_URL}/users/login`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(loginData)
        }
    );

    const data = await response.json();

    console.log("🔐 LOGIN RESPONSE:", data);

    if (!response.ok) {

        throw new Error(
            data.message || "Login failed"
        );
    }

    // Save JWT separately
    if (data.token) {

        localStorage.setItem(
            "fieldsyncToken",
            data.token
        );
    }

    return data;
};