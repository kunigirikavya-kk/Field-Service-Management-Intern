// src/services/api.js

const API_BASE_URL =
    "http://localhost:8080/api";


async function request(
    url,
    options = {}
) {

    console.log(
        "➡️ API REQUEST:",
        options.method || "GET",
        url
    );


    const token =
        localStorage.getItem(
            "fieldsyncToken"
        );


    const response =
        await fetch(
            `${API_BASE_URL}${url}`,
            {
                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    ...(token
                        ? {
                            Authorization:
                                `Bearer ${token}`
                        }
                        : {}),

                    ...(options.headers || {})

                }
            }
        );


    const responseText =
        await response.text();


    console.log(
        "⬅️ API RESPONSE:",
        response.status,
        responseText
    );


    if (!response.ok) {

        throw new Error(
            `HTTP ${response.status}: ${
                responseText ||
                "Request failed"
            }`
        );

    }


    if (!responseText) {

        return null;

    }


    try {

        return JSON.parse(
            responseText
        );

    } catch {

        return responseText;

    }

}


// =====================================================
// CUSTOMERS
// =====================================================

export function getCustomers() {

    return request(
        "/customers"
    );

}


// =====================================================
// GET CURRENT LOGGED-IN CUSTOMER
// =====================================================

export function getCurrentCustomer() {

    return request(
        "/customers/me"
    );

}


export function createCustomer(
    customer
) {

    return request(
        "/customers",
        {
            method:
                "POST",

            body:
                JSON.stringify(
                    customer
                )
        }
    );

}


// =====================================================
// SITES
// =====================================================

export function getSites(
    customerId
) {

    return request(
        `/sites/customer/${customerId}`
    );

}


export function createSite(
    customerId,
    site
) {

    return request(
        `/sites/customer/${customerId}`,
        {
            method:
                "POST",

            body:
                JSON.stringify(
                    site
                )
        }
    );

}


// =====================================================
// SERVICE REQUESTS
// =====================================================

export function createServiceRequest(
    serviceRequest
) {

    return request(
        "/service-requests",
        {
            method:
                "POST",

            body:
                JSON.stringify(
                    serviceRequest
                )
        }
    );

}


export function getServiceRequests() {

    return request(
        "/service-requests"
    );

}


export function getServiceRequest(
    id
) {

    return request(
        `/service-requests/${id}`
    );

}


// =====================================================
// WORK ORDERS
// =====================================================

export function getWorkOrders() {

    return request(
        "/work-orders"
    );

}


export function getWorkOrder(
    id
) {

    return request(
        `/work-orders/${id}`
    );

}


export function getWorkOrdersByTechnician(
    technicianId
) {

    return request(
        `/work-orders/technician/${technicianId}`
    );

}


export function getWorkOrdersByCustomer(
    customerId
) {

    return request(
        `/work-orders/customer/${customerId}`
    );

}


export function getWorkOrdersByStatus(
    status
) {

    return request(
        `/work-orders/status/${status}`
    );

}


export function createWorkOrder(
    workOrder
) {

    return request(
        "/work-orders",
        {
            method:
                "POST",

            body:
                JSON.stringify(
                    workOrder
                )
        }
    );

}


export function updateWorkOrder(
    id,
    workOrder
) {

    return request(
        `/work-orders/${id}`,
        {
            method:
                "PUT",

            body:
                JSON.stringify(
                    workOrder
                )
        }
    );

}


// =====================================================
// ASSIGN TECHNICIAN
// =====================================================

export function assignTechnician(
    workOrderId,
    technicianId
) {

    return request(
        `/work-orders/${workOrderId}/assign?technicianId=${technicianId}`,
        {
            method:
                "POST"
        }
    );

}


// =====================================================
// UPDATE WORK ORDER STATUS
// =====================================================

export function updateWorkOrderStatus(
    workOrderId,
    status
) {

    return request(
        `/work-orders/${workOrderId}/status?status=${status}`,
        {
            method:
                "POST"
        }
    );

}


// =====================================================
// TECHNICIANS
// =====================================================

export function getTechnicians() {

    return request(
        "/technicians"
    );

}


export function getTechnician(
    id
) {

    return request(
        `/technicians/${id}`
    );

}


export function getTechnicianByUserId(
    userId
) {

    return request(
        `/technicians/user/${userId}`
    );

}


export function createTechnician(
    technician
) {

    return request(
        "/technicians",
        {
            method:
                "POST",

            body:
                JSON.stringify(
                    technician
                )
        }
    );

}


export function updateTechnician(
    id,
    technician
) {

    return request(
        `/technicians/${id}`,
        {
            method:
                "PUT",

            body:
                JSON.stringify(
                    technician
                )
        }
    );

}


export function deleteTechnician(
    id
) {

    return request(
        `/technicians/${id}`,
        {
            method:
                "DELETE"
        }
    );

}


// =====================================================
// SCHEDULES
// =====================================================

export function getSchedules() {

    return request(
        "/schedules"
    );

}


export function getSchedule(
    id
) {

    return request(
        `/schedules/${id}`
    );

}


export function createSchedule(
    schedule
) {

    return request(
        "/schedules",
        {
            method:
                "POST",

            body:
                JSON.stringify(
                    schedule
                )
        }
    );

}


export function updateSchedule(
    id,
    schedule
) {

    return request(
        `/schedules/${id}`,
        {
            method:
                "PUT",

            body:
                JSON.stringify(
                    schedule
                )
        }
    );

}


export function deleteSchedule(
    id
) {

    return request(
        `/schedules/${id}`,
        {
            method:
                "DELETE"
        }
    );

}


export function getSchedulesByTechnician(
    technicianId
) {

    return request(
        `/schedules/technician/${technicianId}`
    );

}


export function getSchedulesByWorkOrder(
    workOrderId
) {

    return request(
        `/schedules/work-order/${workOrderId}`
    );

}


export function getSchedulesByDate(
    date
) {

    return request(
        `/schedules/date/${date}`
    );

}


export function getSchedulesByStatus(
    status
) {

    return request(
        `/schedules/status/${status}`
    );

}


// =====================================================
// JOB EXECUTIONS
// =====================================================

export function getJobExecutions() {

    return request(
        "/job-executions"
    );

}


export function getJobExecution(
    id
) {

    return request(
        `/job-executions/${id}`
    );

}


export function getJobExecutionBySchedule(
    scheduleId
) {

    return request(
        `/job-executions/schedule/${scheduleId}`
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


export function startJob(
    jobExecution
) {

    return request(
        "/job-executions/start",
        {
            method:
                "POST",

            body:
                JSON.stringify(
                    jobExecution
                )
        }
    );

}


export function updateJobExecution(
    id,
    jobExecution
) {

    return request(
        `/job-executions/${id}`,
        {
            method:
                "PUT",

            body:
                JSON.stringify(
                    jobExecution
                )
        }
    );

}


export function completeJob(
    id,
    jobExecution
) {

    return request(
        `/job-executions/${id}/complete`,
        {
            method:
                "PUT",

            body:
                JSON.stringify(
                    jobExecution
                )
        }
    );

}


export function cancelJobExecution(
    id
) {

    return request(
        `/job-executions/${id}/cancel`,
        {
            method:
                "PUT"
        }
    );

}


// =====================================================
// JOB PHOTOS
// =====================================================

export async function uploadJobPhoto(
    file,
    jobExecutionId
) {

    if (!file) {

        throw new Error(
            "Please select an image."
        );

    }


    if (!jobExecutionId) {

        throw new Error(
            "Job Execution ID is required."
        );

    }


    const token =
        localStorage.getItem(
            "fieldsyncToken"
        );


    if (!token) {

        throw new Error(
            "Authentication token not found."
        );

    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "jobExecutionId",
        String(jobExecutionId)
    );


    console.log(
        "📷 UPLOADING JOB PHOTO:",
        {
            fileName:
                file.name,

            fileType:
                file.type,

            fileSize:
                file.size,

            jobExecutionId
        }
    );


    const response =
        await fetch(
            `${API_BASE_URL}/job-photos/upload`,
            {

                method:
                    "POST",

                headers: {

                    Authorization:
                        `Bearer ${token}`

                },

                body:
                    formData

            }
        );


    const responseText =
        await response.text();


    console.log(
        "📷 PHOTO UPLOAD RESPONSE:",
        response.status,
        responseText
    );


    if (!response.ok) {

        throw new Error(
            `HTTP ${response.status}: ${
                responseText ||
                "Photo upload failed"
            }`
        );

    }


    if (!responseText) {

        return null;

    }


    try {

        return JSON.parse(
            responseText
        );

    } catch {

        return responseText;

    }
}


export function getJobPhotosByExecution(
    jobExecutionId
) {

    return request(
        `/job-photos/execution/${jobExecutionId}`
    );

}


export function getJobPhotosByWorkOrder(
    workOrderId
) {

    return request(
        `/job-photos/work-order/${workOrderId}`
    );

}


export function getJobPhotosByTechnician(
    technicianId
) {

    return request(
        `/job-photos/technician/${technicianId}`
    );

}


export function getJobPhoto(
    id
) {

    return request(
        `/job-photos/${id}`
    );

}


// =====================================================
// INVENTORY
// =====================================================

export function getInventoryParts() {

    return request(
        "/inventory"
    );

}


export function getInventoryPart(
    id
) {

    return request(
        `/inventory/${id}`
    );

}


export function createInventoryPart(
    part
) {

    return request(
        "/inventory",
        {
            method:
                "POST",

            body:
                JSON.stringify(
                    part
                )
        }
    );

}


export function updateInventoryPart(
    id,
    part
) {

    return request(
        `/inventory/${id}`,
        {
            method:
                "PUT",

            body:
                JSON.stringify(
                    part
                )
        }
    );

}


export function deleteInventoryPart(
    id
) {

    return request(
        `/inventory/${id}`,
        {
            method:
                "DELETE"
        }
    );

}


export function updateInventoryStock(
    id,
    quantity
) {

    return request(
        `/inventory/${id}/stock?quantity=${quantity}`,
        {
            method:
                "PUT"
        }
    );

}


// =====================================================
// PART USAGE
// =====================================================

export function recordPartUsage(
    partUsage
) {

    return request(
        "/part-usage",
        {
            method:
                "POST",

            body:
                JSON.stringify(
                    partUsage
                )
        }
    );

}


export function getPartUsageByWorkOrder(
    workOrderId
) {

    return request(
        `/part-usage/work-order/${workOrderId}`
    );

}


export function getPartUsageByJobExecution(
    jobExecutionId
) {

    return request(
        `/part-usage/job-execution/${jobExecutionId}`
    );

}


export function getPartUsageByTechnician(
    technicianId
) {

    return request(
        `/part-usage/technician/${technicianId}`
    );

}


export function deletePartUsage(
    id
) {

    return request(
        `/part-usage/${id}`,
        {
            method:
                "DELETE"
        }
    );

}


// =====================================================
// BILLING / INVOICES
// =====================================================

export function getInvoices() {

    return request(
        "/invoices"
    );

}


export function getInvoice(
    id
) {

    return request(
        `/invoices/${id}`
    );

}


export function createInvoice(
    invoice
) {

    return request(
        "/invoices",
        {
            method:
                "POST",

            body:
                JSON.stringify(
                    invoice
                )
        }
    );

}


export function updateInvoice(
    id,
    invoice
) {

    return request(
        `/invoices/${id}`,
        {
            method:
                "PUT",

            body:
                JSON.stringify(
                    invoice
                )
        }
    );

}


export function markInvoiceAsPaid(
    id
) {

    return request(
        `/invoices/${id}/pay`,
        {
            method:
                "PUT"
        }
    );

}


export function cancelInvoice(
    id
) {

    return request(
        `/invoices/${id}/cancel`,
        {
            method:
                "PUT"
        }
    );

}


export function deleteInvoice(
    id
) {

    return request(
        `/invoices/${id}`,
        {
            method:
                "DELETE"
        }
    );

}


// =====================================================
// REGISTER
// =====================================================

export const registerUser =
    async (
        userData
    ) => {

        const response =
            await fetch(
                `${API_BASE_URL}/users/register`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            userData
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Registration failed"
            );

        }


        return data;

    };


// =====================================================
// LOGIN
// =====================================================

export const loginUser =
    async (
        loginData
    ) => {

        const response =
            await fetch(
                `${API_BASE_URL}/users/login`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            loginData
                        )
                }
            );


        const data =
            await response.json();


        console.log(
            "🔐 LOGIN RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Login failed"
            );

        }


        if (data.token) {

            localStorage.setItem(
                "fieldsyncToken",
                data.token
            );

        }


        return data;

    };