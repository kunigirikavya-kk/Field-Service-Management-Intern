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
                        <Navigate
                            to="/login"
                            replace
                        />
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

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />


                        <Route
                            path="/customers"
                            element={<Customers />}
                        />


                        <Route
                            path="/technicians"
                            element={<Technicians />}
                        />


                        <Route
                            path="/service-requests/new"
                            element={<ServiceRequest />}
                        />


                        <Route
                            path="/work-orders"
                            element={<WorkOrders />}
                        />


                        <Route
                            path="/schedule"
                            element={<Schedule />}
                        />


                        <Route
                            path="/job-execution"
                            element={<JobExecution />}
                        />


                        <Route
                            path="/inventory"
                            element={<Inventory />}
                        />


                        <Route
                            path="/billing"
                            element={<Billing />}
                        />


                        <Route
                            path="/reports"
                            element={<Reports />}
                        />

                    </Route>

                </Route>


                {/* =====================================
                    FALLBACK
                ====================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default App;