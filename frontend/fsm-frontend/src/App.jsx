import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Technicians from "./pages/Technicians";
import WorkOrders from "./pages/WorkOrders";
import Schedule from "./pages/Schedule";
import JobExecution from "./pages/JobExecution";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import ServiceRequest from "./pages/ServiceRequest";

import DashboardLayout from "./layouts/DashboardLayout";

import ProtectedRoute from "./components/ProtectedRoute";


// =====================================================
// GET CURRENT USER
// =====================================================

function getCurrentUser() {

    try {

        const user = localStorage.getItem(
            "fieldsyncUser"
        );

        if (!user) {
            return null;
        }

        return JSON.parse(user);

    } catch (error) {

        console.error(
            "Unable to read logged-in user:",
            error
        );

        return null;
    }
}


// =====================================================
// GET CURRENT ROLE
// =====================================================

function getCurrentRole() {

    const user = getCurrentUser();

    if (!user) {
        return null;
    }

    return String(
        user.role || ""
    ).toUpperCase();
}


// =====================================================
// DEFAULT REDIRECT
// =====================================================

function DefaultRedirect() {

    const isAuthenticated =
        localStorage.getItem(
            "fieldsyncAuthenticated"
        ) === "true";


    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    return (
        <Navigate
            to="/dashboard"
            replace
        />
    );
}


// =====================================================
// ROLE PROTECTED ROUTE
// =====================================================

function RoleRoute({
    allowedRoles,
    children
}) {

    const isAuthenticated =
        localStorage.getItem(
            "fieldsyncAuthenticated"
        ) === "true";


    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    const role = getCurrentRole();


    const normalizedRoles =
        allowedRoles.map(
            allowedRole =>
                String(
                    allowedRole
                ).toUpperCase()
        );


    if (
        !normalizedRoles.includes(role)
    ) {

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );

    }


    return children;
}


// =====================================================
// APP
// =====================================================

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* =====================================
                    DEFAULT ROUTE
                ====================================== */}

                <Route
                    path="/"
                    element={
                        <DefaultRedirect />
                    }
                />


                {/* =====================================
                    PUBLIC ROUTES
                ====================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* =====================================
                    PROTECTED ROUTES
                ====================================== */}

                <Route
                    element={<ProtectedRoute />}
                >

                    <Route
                        element={<DashboardLayout />}
                    >


                        {/* =================================
                            DASHBOARD
                            ALL ROLES
                        ================================= */}

                        <Route
                            path="/dashboard"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "CUSTOMER",
                                        "DISPATCHER",
                                        "TECHNICIAN",
                                        "MANAGER",
                                        "ADMIN"
                                    ]}
                                >

                                    <Dashboard />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            CUSTOMERS
                            DISPATCHER / MANAGER
                        ================================= */}

                        <Route
                            path="/customers"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "DISPATCHER",
                                        "MANAGER",
                                        "ADMIN"
                                    ]}
                                >

                                    <Customers />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            TECHNICIANS
                            DISPATCHER / MANAGER
                        ================================= */}

                        <Route
                            path="/technicians"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "DISPATCHER",
                                        "MANAGER",
                                        "ADMIN"
                                    ]}
                                >

                                    <Technicians />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            SERVICE REQUEST CREATION
                            CUSTOMER / DISPATCHER / MANAGER
                        ================================= */}

                        <Route
                            path="/service-requests/new"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "CUSTOMER",
                                        "DISPATCHER",
                                        "MANAGER",
                                        "ADMIN"
                                    ]}
                                >

                                    <ServiceRequest />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            WORK ORDERS
                            ALL ROLES
                        ================================= */}

                        <Route
                            path="/work-orders"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "CUSTOMER",
                                        "DISPATCHER",
                                        "TECHNICIAN",
                                        "MANAGER",
                                        "ADMIN"
                                    ]}
                                >

                                    <WorkOrders />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            SCHEDULE
                            DISPATCHER / TECHNICIAN / MANAGER
                        ================================= */}

                        <Route
                            path="/schedule"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "DISPATCHER",
                                        "TECHNICIAN",
                                        "MANAGER",
                                        "ADMIN"
                                    ]}
                                >

                                    <Schedule />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            JOB EXECUTION
                            TECHNICIAN / MANAGER
                        ================================= */}

                        <Route
                            path="/execution"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "TECHNICIAN"
                                    ]}
                                >

                                    <JobExecution />

                                </RoleRoute>

                            }
                        />


                        {/* Legacy technician execution URL */}
                        <Route
                            path="/job-execution"
                            element={
                                <RoleRoute allowedRoles={["TECHNICIAN"]}>
                                    <Navigate to="/execution" replace />
                                </RoleRoute>
                            }
                        />


                        {/* =================================
                            INVENTORY
                            TECHNICIAN / MANAGER
                        ================================= */}

                        <Route
                            path="/inventory"
                            element={

                                <RoleRoute
                                    allowedRoles={[
    "DISPATCHER",
    "TECHNICIAN",
    "MANAGER",
    "ADMIN"
]}
                                >

                                    <Inventory />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            BILLING
                            MANAGER
                        ================================= */}

                        <Route
                            path="/billing"
                            element={

                                <RoleRoute
                                    allowedRoles={[
    "DISPATCHER",
    "MANAGER",
    "ADMIN"
]}
                                >

                                    <Billing />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            REPORTS
                            MANAGER
                        ================================= */}

                        <Route
                            path="/reports"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "MANAGER",
                                        "ADMIN"
                                    ]}
                                >

                                    <Reports />

                                </RoleRoute>

                            }
                        />

                    </Route>

                </Route>


                {/* =====================================
                    FALLBACK
                ====================================== */}

                <Route
                    path="*"
                    element={
                        <DefaultRedirect />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;