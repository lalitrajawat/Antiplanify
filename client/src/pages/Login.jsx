import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">

                {/* Left Panel (Form) */}
                <div className="login-left">
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtext">
                        Don’t have an account? <Link to="/signup">Sign up here</Link>
                    </p>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email address"
                            className="login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && <div className="error-message">{error}</div>}

                        <div className="login-row">
                            <div className="login-remember">
                                <input type="checkbox" id="remember" />
                                <label htmlFor="remember">Remember me</label>
                            </div>
                            <Link to="/forgot-password" className="login-forgot">
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" className="login-btn">Login</button>
                    </form>

                    <div className="login-row">
                        <button className="login-btn small">Google</button>
                        <button className="login-btn small">Apple</button>
                    </div>
                </div>

                {/* Right panel */}
                <div className="login-right">
                    <img src="/assets/loginIMG.png" alt="login visual" className="login-img" />
                    <div className="login-overlay">
                        <div className="login-header">
                            <img src="src/assets/logo.png" alt="logo" id="logoIMG" />
                            <h1 className="logo">lanify</h1>
                        </div>
                        <p className="login-tagline">One step closer to your goals — log in now.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
