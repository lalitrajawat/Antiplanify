import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Mail, Lock, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Left Panel (Form) */}
                <div className="auth-split-left">
                    <div className="auth-header">
                        <h2 className="auth-title">Welcome Back</h2>
                        <p className="auth-subtitle">
                            Don't have an account? <Link to="/signup">Sign up for free</Link>
                        </p>
                    </div>

                    {error && <div className="auth-message error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-form-group">
                            <label className="auth-label">Email Address</label>
                            <div className="auth-input-wrapper">
                                <Mail className="auth-input-icon" size={20} />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    className="auth-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-form-group">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrapper">
                                <Lock className="auth-input-icon" size={20} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="auth-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-row">
                            <label className="auth-checkbox-group">
                                <input type="checkbox" id="remember" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" name="forgot-password" className="auth-forgot-link">
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? <Loader2 className="spinner" size={20} /> : (
                                <>
                                    <LogIn size={20} />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <div className="auth-divider-line"></div>
                        <span className="auth-divider-text">or continue with</span>
                        <div className="auth-divider-line"></div>
                    </div>

                    <div className="auth-social-row">
                        <button className="auth-social-btn">
                            <img src="https://www.svgrepo.com/show/355037/google.svg" width="20" height="20" alt="Google" />
                            <span>Google</span>
                        </button>
                        <button className="auth-social-btn">
                            <img src="https://www.svgrepo.com/show/448204/apple.svg" width="20" height="20" alt="Apple" />
                            <span>Apple</span>
                        </button>
                    </div>
                </div>

                {/* Right panel (Branding) */}
                <div className="auth-split-right">
                    <img src="/assets/loginIMG.png" alt="login visual" className="auth-branding-img" />
                    <div className="auth-branding-overlay">
                        <div className="auth-branding-logo">
                            <img src="/src/assets/logo.png" alt="logo" />
                            <h1>AntiPlanify</h1>
                        </div>
                        <div className="auth-branding-content">
                            <p className="auth-branding-tagline">
                                "The best time to plant a tree was 20 years ago. The second best time is now."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
