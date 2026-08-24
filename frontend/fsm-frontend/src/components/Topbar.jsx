
import { useState } from "react";

function Topbar({ onLogout }) {

    

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);


    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    const storedUser =
        localStorage.getItem("fieldsyncUser");


    let user = null;


    try {

        user = storedUser
            ? JSON.parse(storedUser)
            : null;

    } catch (error) {

        user = null;

    }


    // =====================================================
    // USER DETAILS
    // =====================================================

    const userName =
        user?.fullName || "User";


    const userRole =
        user?.role || "USER";


    const userInitial =
        userName
            .charAt(0)
            .toUpperCase();


    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    const handleNotification = () => {

        setShowNotifications(
            !showNotifications
        );

        setShowProfile(false);

    };


    // =====================================================
    // PROFILE
    // =====================================================

    const handleProfile = () => {

        setShowProfile(
            !showProfile
        );

        setShowNotifications(false);

    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

    setShowProfile(false);

    if (onLogout) {
        onLogout();
    }

};


    return (

        <header className="topbar">


            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div>

                <h3>
                    Field Service Management
                </h3>

                <p>
                    Manage your field operations efficiently
                </p>

            </div>


            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div
                className="topbar-right"
                style={{
                    position: "relative"
                }}
            >


                {/* =================================================
                    NOTIFICATION
                ================================================= */}

                <div
                    style={{
                        position: "relative"
                    }}
                >

                    <button
                        className="notification"
                        type="button"
                        onClick={handleNotification}
                        style={{
                            cursor: "pointer",
                            border: "none",
                            background: "transparent"
                        }}
                    >

                        🔔

                        <span></span>

                    </button>


                    {showNotifications && (

                        <div
                            style={{
                                position: "absolute",
                                right: "0",
                                top: "45px",
                                width: "260px",
                                background: "#ffffff",
                                borderRadius: "10px",
                                boxShadow:
                                    "0 8px 25px rgba(0,0,0,0.15)",
                                padding: "16px",
                                zIndex: "1000"
                            }}
                        >

                            <strong>
                                Notifications
                            </strong>


                            <p
                                style={{
                                    marginTop: "10px",
                                    color: "#64748b"
                                }}
                            >
                                No new notifications.
                            </p>

                        </div>

                    )}

                </div>


                {/* =================================================
                    PROFILE BUTTON
                ================================================= */}

                <button
                    className="profile"
                    type="button"
                    onClick={handleProfile}
                    style={{
                        cursor: "pointer",
                        border: "none",
                        background: "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}
                >


                    {/* USER AVATAR */}

                    <div className="avatar">

                        {userInitial}

                    </div>


                    {/* USER INFORMATION */}

                    <div>

                        <strong>
                            {userName}
                        </strong>


                        <small>
                            {userRole}
                        </small>

                    </div>

                </button>


                {/* =================================================
                    PROFILE DROPDOWN
                ================================================= */}

                {showProfile && (

                    <div
                        style={{
                            position: "absolute",
                            right: "0",
                            top: "55px",
                            width: "220px",
                            background: "#ffffff",
                            borderRadius: "10px",
                            boxShadow:
                                "0 8px 25px rgba(0,0,0,0.15)",
                            padding: "10px",
                            zIndex: "1000"
                        }}
                    >


                        {/* USER INFORMATION */}

                        <div
                            style={{
                                padding: "10px",
                                borderBottom:
                                    "1px solid #e5e7eb"
                            }}
                        >

                            <strong>
                                {userName}
                            </strong>


                            <p
                                style={{
                                    margin: "4px 0 0",
                                    fontSize: "12px",
                                    color: "#64748b"
                                }}
                            >
                                {userRole}
                            </p>


                            {user?.email && (

                                <p
                                    style={{
                                        margin: "4px 0 0",
                                        fontSize: "12px",
                                        color: "#94a3b8"
                                    }}
                                >
                                    {user.email}
                                </p>

                            )}

                        </div>


                        {/* PROFILE */}

                        <button
                            type="button"
                            onClick={() => {

                                alert(
                                    "Your FieldSync profile is currently active."
                                );

                                setShowProfile(false);

                            }}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "none",
                                background: "transparent",
                                textAlign: "left",
                                cursor: "pointer",
                                borderRadius: "6px"
                            }}
                        >

                            👤 Profile

                        </button>


                        {/* LOGOUT */}

                        <button
                            type="button"
                            onClick={handleLogout}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "none",
                                background: "transparent",
                                textAlign: "left",
                                cursor: "pointer",
                                borderRadius: "6px",
                                color: "#dc2626"
                            }}
                        >

                            🚪 Logout

                        </button>

                    </div>

                )}

            </div>

        </header>
    );
}


export default Topbar;