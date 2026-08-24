import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-page">

            {/* ================= BACKGROUND ================= */}

            <div className="home-background">
                <div className="glow glow-one"></div>
                <div className="glow glow-two"></div>
                <div className="glow glow-three"></div>
                <div className="grid-overlay"></div>
            </div>


            {/* ================= NAVBAR ================= */}

            <nav className="home-navbar">

                <div className="home-logo">

                    <div className="home-logo-icon">
                        FS
                    </div>

                    <div className="home-logo-text">
                        <h2>FieldSync</h2>
                        <span>Field Service Management</span>
                    </div>

                </div>


                <div className="home-nav-actions">

                    <button
                        className="home-login-btn"
                        onClick={() => navigate("/login")}
                    >
                        Sign In
                    </button>

                    <button
                        className="home-register-btn"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </button>

                </div>

            </nav>


            {/* ================= HERO ================= */}

            <section className="home-hero">

                <div className="hero-content">

                    <div className="hero-badge">
                        ✦ Smarter Field Operations
                    </div>

                    <h1>
                        Manage your field operations{" "}
                        <span>smarter.</span>
                    </h1>

                    <p>
                        FieldSync helps businesses connect teams,
                        manage service requests, schedule technicians,
                        track work orders and streamline billing —
                        all from one powerful platform.
                    </p>


                    <div className="hero-buttons">

                        <button
                            className="hero-primary"
                            onClick={() => navigate("/register")}
                        >
                            Get Started
                            <span>→</span>
                        </button>

                        <button
                            className="hero-secondary"
                            onClick={() => navigate("/login")}
                        >
                            Sign In
                        </button>

                    </div>

                </div>


                {/* ================= DASHBOARD PREVIEW ================= */}

                <div className="hero-preview">

                    <div className="preview-window">

                        <div className="preview-topbar">

                            <div className="preview-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                            <div className="preview-title">
                                FieldSync Dashboard
                            </div>

                        </div>


                        <div className="preview-body">

                            {/* SIDEBAR */}

                            <div className="preview-sidebar">

                                <div className="preview-side-logo">
                                    FS
                                </div>

                                <div className="preview-line active"></div>
                                <div className="preview-line"></div>
                                <div className="preview-line"></div>
                                <div className="preview-line"></div>
                                <div className="preview-line"></div>

                            </div>


                            {/* CONTENT */}

                            <div className="preview-content">

                                <div className="preview-heading">
                                    Dashboard
                                </div>


                                <div className="preview-cards">

                                    <div className="preview-card">

                                        <span className="preview-card-icon">
                                            👥
                                        </span>

                                        <strong>
                                            248
                                        </strong>

                                        <small>
                                            Customers
                                        </small>

                                    </div>


                                    <div className="preview-card">

                                        <span className="preview-card-icon">
                                            🔧
                                        </span>

                                        <strong>
                                            32
                                        </strong>

                                        <small>
                                            Technicians
                                        </small>

                                    </div>


                                    <div className="preview-card">

                                        <span className="preview-card-icon">
                                            📋
                                        </span>

                                        <strong>
                                            47
                                        </strong>

                                        <small>
                                            Work Orders
                                        </small>

                                    </div>

                                </div>


                                {/* CHART */}

                                <div className="preview-chart">

                                    <div className="chart-title">
                                        Recent Service Activity
                                    </div>

                                    <div className="chart-bars">

                                        <i></i>
                                        <i></i>
                                        <i></i>
                                        <i></i>
                                        <i></i>
                                        <i></i>
                                        <i></i>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* ================= FEATURES ================= */}

            <section className="home-features">

                <div className="feature">

                    <div className="feature-icon">
                        👥
                    </div>

                    <div>
                        <h3>
                            Customer Management
                        </h3>

                        <p>
                            Keep customer information organized
                            and accessible.
                        </p>
                    </div>

                </div>


                <div className="feature">

                    <div className="feature-icon">
                        🔧
                    </div>

                    <div>
                        <h3>
                            Technician Scheduling
                        </h3>

                        <p>
                            Assign technicians and manage
                            schedules efficiently.
                        </p>
                    </div>

                </div>


                <div className="feature">

                    <div className="feature-icon">
                        📋
                    </div>

                    <div>
                        <h3>
                            Work Order Tracking
                        </h3>

                        <p>
                            Track every service request from
                            start to completion.
                        </p>
                    </div>

                </div>


                <div className="feature">

                    <div className="feature-icon">
                        💳
                    </div>

                    <div>
                        <h3>
                            Billing & Reports
                        </h3>

                        <p>
                            Simplify invoicing and monitor
                            business performance.
                        </p>
                    </div>

                </div>

            </section>


            {/* ================= FOOTER ================= */}

            <footer className="home-footer">

                <div>
                    © 2026 FieldSync. All rights reserved.
                </div>

                <div>
                    Field Service Management Platform
                </div>

            </footer>

        </div>
    );
}

export default Home;