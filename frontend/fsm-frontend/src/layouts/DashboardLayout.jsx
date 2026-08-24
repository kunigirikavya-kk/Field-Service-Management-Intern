import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";


function DashboardLayout() {

    const navigate = useNavigate();

    const handleLogout = () => {

    localStorage.removeItem("fieldsyncToken");
    localStorage.removeItem("fieldsyncAuthenticated");
    localStorage.removeItem("fieldsyncUser");

    navigate("/login", {
        replace: true
    });
};


    return (

        <div className="app">

            <Sidebar />

            <div className="main">

                <Topbar
                    onLogout={handleLogout}
                />

                <main className="content">

                    <Outlet />

                </main>

            </div>

        </div>
    );
}


export default DashboardLayout;