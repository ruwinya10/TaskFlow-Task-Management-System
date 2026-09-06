import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


const Register = () => {

    const navigate = useNavigate();

    const {
        register
    } = useAuth();


    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (password !== confirmPassword) {

            setError("Passwords do not match");

            return;
        }


        setLoading(true);


        try {

            await register(
                name,
                email,
                password
            );


            navigate("/login");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>Less Taxi</h1>

                <h2>Create Account</h2>

                <p className="auth-subtitle">
                    Register as a normal user
                </p>


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>Name</label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Enter your name"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter your email"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Minimum 6 characters"
                            minLength="6"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>Confirm Password</label>

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Confirm password"
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Register"
                        }
                    </button>

                </form>


                <p className="auth-link">

                    Already have an account?{" "}

                    <Link to="/login">
                        Login
                    </Link>

                </p>

            </div>

        </div>
    );
};


export default Register;