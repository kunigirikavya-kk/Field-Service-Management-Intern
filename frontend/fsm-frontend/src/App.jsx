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

        const user =
            localStorage.getItem(
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

    const user =
        getCurrentUser();

    if (!user) {
        return null;
    }

    return String(
        user.role || ""
    ).toUpperCase();
}


// =====================================================
// DEFAULT PAGE
// =====================================================

function DefaultRedirect() {

    const isAuthenticated =
        localStorage.getItem(
            "fieldsyncAuthenticated"
        ) === "true";


    if (!isAuthenticated) {

        return (
            <Navigate
                to="/register"
                replace
            />
        );

    }


    const role =
        getCurrentRole();


    // -----------------------------------------
    // CUSTOMER
    // -----------------------------------------

    if (role === "CUSTOMER") {

        return (
            <Navigate
                to="/service-requests/new"
                replace
            />
        );

    }


    // -----------------------------------------
    // TECHNICIAN
    // -----------------------------------------

    if (role === "TECHNICIAN") {

        return (
            <Navigate
                to="/job-execution"
                replace
            />
        );

    }


    // -----------------------------------------
    // DISPATCHER / MANAGER
    // -----------------------------------------

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


    const role =
        getCurrentRole();


    const normalizedRoles =
        allowedRoles.map(
            allowedRole =>
                String(
                    allowedRole
                ).toUpperCase()
        );


    // -----------------------------------------
    // ROLE NOT ALLOWED
    // -----------------------------------------

    if (
        !normalizedRoles.includes(role)
    ) {

        return (
            <DefaultRedirect />
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
                    DEFAULT
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
                            OPERATIONS DASHBOARD
                            
                            ONLY:
                            DISPATCHER
                            MANAGER
                        ================================= */}

                        <Route
                            path="/dashboard"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "DISPATCHER",
                                        "MANAGER"
                                    ]}
                                >

                                    <Dashboard />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            CUSTOMERS
                            
                            ONLY:
                            DISPATCHER
                            MANAGER
                        ================================= */}

                        <Route
                            path="/customers"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "DISPATCHER",
                                        "MANAGER"
                                    ]}
                                >

                                    <Customers />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            TECHNICIANS
                            
                            ONLY:
                            DISPATCHER
                            MANAGER
                        ================================= */}

                        <Route
                            path="/technicians"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "DISPATCHER",
                                        "MANAGER"
                                    ]}
                                >

                                    <Technicians />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            SERVICE REQUEST
                            
                            CUSTOMER CAN CREATE
                            
                            DISPATCHER/MANAGER CAN CREATE
                        ================================= */}

                        <Route
                            path="/service-requests/new"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "CUSTOMER",
                                        "DISPATCHER",
                                        "MANAGER"
                                    ]}
                                >

                                    <ServiceRequest />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            WORK ORDERS
                            
                            DISPATCHER / MANAGER
                        ================================= */}

                        <Route
                            path="/work-orders"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "DISPATCHER",
                                        "MANAGER"
                                    ]}
                                >

                                    <WorkOrders />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            SCHEDULE
                            
                            DISPATCHER / MANAGER / TECHNICIAN
                        ================================= */}

                        <Route
                            path="/schedule"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "DISPATCHER",
                                        "MANAGER",
                                        "TECHNICIAN"
                                    ]}
                                >

                                    <Schedule />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            JOB EXECUTION
                            
                            TECHNICIAN / DISPATCHER / MANAGER
                        ================================= */}

                        <Route
                            path="/job-execution"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "TECHNICIAN",
                                        "DISPATCHER",
                                        "MANAGER"
                                    ]}
                                >

                                    <JobExecution />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            INVENTORY
                            
                            DISPATCHER / MANAGER
                        ================================= */}

                        <Route
                            path="/inventory"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "DISPATCHER",
                                        "MANAGER"
                                    ]}
                                >

                                    <Inventory />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            BILLING
                            
                            DISPATCHER / MANAGER
                        ================================= */}

                        <Route
                            path="/billing"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "DISPATCHER",
                                        "MANAGER"
                                    ]}
                                >

                                    <Billing />

                                </RoleRoute>

                            }
                        />


                        {/* =================================
                            REPORTS
                            
                            DISPATCHER / MANAGER
                        ================================= */}

                        <Route
                            path="/reports"
                            element={

                                <RoleRoute
                                    allowedRoles={[
                                        "DISPATCHER",
                                        "MANAGER"
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