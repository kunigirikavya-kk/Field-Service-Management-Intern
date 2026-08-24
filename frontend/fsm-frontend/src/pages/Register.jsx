import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../services/api";

import "./Register.css";


function Register() {

    const navigate = useNavigate();


    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "CUSTOMER"
    });


    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // =====================================================
    // HANDLE INPUT CHANGES
    // =====================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };


    // =====================================================
    // REGISTER
    // =====================================================

    const handleRegister = async (e) => {

        e.preventDefault();

        setError("");


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !form.fullName ||
            !form.email ||
            !form.phone ||
            !form.password ||
            !form.confirmPassword
        ) {

            setError(
                "Please fill in all required fields."
            );

            return;
        }


        if (form.password.length < 6) {

            setError(
                "Password must contain at least 6 characters."
            );

            return;
        }


        if (
            form.password !==
            form.confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        // =================================================
        // API REQUEST
        // =================================================

        try {

            setLoading(true);


            await registerUser({

                fullName: form.fullName,

                email: form.email,

                phone: form.phone,

                password: form.password,

                // Public registration is always CUSTOMER
                role: "CUSTOMER"

            });


            // =================================================
            // SUCCESS
            // =================================================

            alert(
                "Registration successful! Please sign in."
            );


            navigate("/login");


        } catch (error) {

            setError(
                error.message ||
                "Registration failed. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="register-page">

            {/* =========================
                BACKGROUND
            ========================== */}

            <div className="register-background">

                <div className="register-glow register-glow-one"></div>

                <div className="register-glow register-glow-two"></div>

                <div className="register-glow register-glow-three"></div>

                <div className="register-grid"></div>

            </div>


            {/* =========================
                LEFT SIDE
            ========================== */}

            <div className="register-left">

                <div className="register-brand">

                    <div className="register-logo">
                        FS
                    </div>

                    <div>

                        <h1>
                            FieldSync
                        </h1>

                        <p>
                            Field Service Management
                        </p>

                    </div>

                </div>


                <div className="register-intro">

                    <div className="register-badge">
                        ✦ Join FieldSync
                    </div>


                    <h2>

                        Start managing your

                        <span>
                            field operations.
                        </span>

                    </h2>


                    <p>
                        Create your FieldSync account and bring
                        customers, technicians, service requests,
                        schedules and billing together in one place.
                    </p>


                    <div className="register-benefits">

                        <div className="benefit">

                            <div className="benefit-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Easy service management
                                </strong>

                                <p>
                                    Manage your complete service workflow
                                    from one platform.
                                </p>

                            </div>

                        </div>


                        <div className="benefit">

                            <div className="benefit-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Smart technician scheduling
                                </strong>

                                <p>
                                    Organize jobs and technician assignments
                                    efficiently.
                                </p>

                            </div>

                        </div>


                        <div className="benefit">

                            <div className="benefit-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Powerful reporting
                                </strong>

                                <p>
                                    Monitor operations, billing and performance
                                    with ease.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                <div className="register-left-footer">
                    © 2026 FieldSync
                </div>

            </div>


            {/* =========================
                RIGHT SIDE
            ========================== */}

            <div className="register-right">

                <div className="register-card">

                    <div className="register-card-header">

                        <h2>
                            Create your account
                        </h2>

                        <p>
                            Register to get started with FieldSync
                        </p>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="register-error">
                            {error}
                        </div>

                    )}


                    <form
                        className="register-form"
                        onSubmit={handleRegister}
                    >

                        {/* FULL NAME */}

                        <div className="register-field">

                            <label htmlFor="fullName">
                                Full Name
                            </label>

                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={form.fullName}
                                onChange={handleChange}
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="register-field">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                            />

                        </div>


                        {/* PHONE */}

                        <div className="register-field">

                            <label htmlFor="phone">
                                Phone Number
                            </label>

                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                placeholder="Enter your phone number"
                                value={form.phone}
                                onChange={handleChange}
                            />

                        </div>


                        {/* ACCOUNT TYPE */}

                        <div className="register-field">

                            <label htmlFor="role">
                                Account Type
                            </label>

                            <select
                                id="role"
                                name="role"
                                value="CUSTOMER"
                                disabled
                            >

                                <option value="CUSTOMER">
                                    Customer
                                </option>

                            </select>

                        </div>


                        {/* PASSWORD */}

                        <div className="register-field">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="password-wrapper">

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={handleChange}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {
                                        showPassword
                                            ? "Hide"
                                            : "Show"
                                    }
                                </button>

                            </div>

                            <span className="field-hint">
                                Minimum 6 characters
                            </span>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="register-field">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <div className="password-wrapper">

                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {
                                        showConfirmPassword
                                            ? "Hide"
                                            : "Show"
                                    }
                                </button>

                            </div>

                        </div>


                        {/* TERMS */}

                        <label className="terms-checkbox">

                            <input
                                type="checkbox"
                                required
                            />

                            <span>
                                I agree to the FieldSync terms
                                and conditions.
                            </span>

                        </label>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="register-submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating Account..."
                                : "Create Account"
                            }

                            {!loading && (
                                <span>
                                    →
                                </span>
                            )}

                        </button>

                    </form>


                    {/* LOGIN */}

                    <div className="register-login">

                        <span>
                            Already have an account?
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Sign In
                        </button>

                    </div>


                    {/* HOME */}

                    <button
                        type="button"
                        className="back-home"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        ← Back to FieldSync
                    </button>

                </div>

            </div>

        </div>
    );
}


export default Register;