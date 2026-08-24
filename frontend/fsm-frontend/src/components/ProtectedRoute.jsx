import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {

    const token =
        localStorage.getItem("fieldsyncToken");

    const authenticated =
        localStorage.getItem(
            "fieldsyncAuthenticated"
        );

    if (
        !token ||
        authenticated !== "true"
    ) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return <Outlet />;
}

export default ProtectedRoute;