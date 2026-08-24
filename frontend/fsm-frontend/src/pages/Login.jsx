import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/api";

import "./Login.css";


function Login() {

    const navigate = useNavigate();


    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");


        if (!email || !password) {

            setError(
                "Please enter your email and password."
            );

            return;
        }


        try {

            setLoading(true);


            const user =
    await loginUser({

        email: email,

        password: password

    });

localStorage.setItem(
    "fieldsyncUser",
    JSON.stringify(user)
);

localStorage.setItem(
    "fieldsyncAuthenticated",
    "true"
);

navigate("/dashboard");


        } catch (error) {

            setError(
                error.message ||
                "Invalid email or password."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="login-page">

            <div className="login-left">

                <div className="login-brand">

                    <div className="logo-icon large">
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


                <div className="login-message">

                    <h2>
                        Manage your field operations
                        <span> smarter.</span>
                    </h2>

                    <p>
                        Connect your team, manage service requests,
                        schedule technicians and keep your operations
                        running smoothly.
                    </p>


                    <div className="login-features">

                        <div>
                            <b>✓</b>
                            Real-time job management
                        </div>

                        <div>
                            <b>✓</b>
                            Technician scheduling
                        </div>

                        <div>
                            <b>✓</b>
                            Customer & billing management
                        </div>

                    </div>

                </div>

            </div>


            <div className="login-right">

                <div className="login-card">

                    <h2>
                        Welcome back
                    </h2>

                    <p>
                        Sign in to access your dashboard
                    </p>


                    {error && (

                        <div className="login-error">
                            {error}
                        </div>

                    )}


                    <form onSubmit={handleLogin}>

                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            placeholder="admin@fsm.com"
                            value={email}
                            onChange={(e) => {

                                setEmail(e.target.value);

                                setError("");

                            }}
                        />


                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => {

                                setPassword(e.target.value);

                                setError("");

                            }}
                        />


                        <div className="form-options">

                            <label className="remember">

                                <input
                                    type="checkbox"
                                />

                                Remember me

                            </label>


                            <a href="#">
                                Forgot password?
                            </a>

                        </div>


                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Signing In..."
                                : "Sign In"
                            }

                        </button>

                    </form>


                    <div className="demo-login">

                        <span>
                            New to FieldSync?
                        </span>{" "}

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Create an account
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default Login;