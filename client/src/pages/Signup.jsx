import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { User, Mail, Lock, UserPlus, Loader2 } from "lucide-react";

export default function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!acceptedTerms) {
            setError("Please accept the Terms & Conditions.");
            return;
        }

        setLoading(true);
        const fullName = `${firstName} ${lastName}`.trim();

        try {
            await signup(fullName, email, password);
            navigate("/");
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to sign up");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Left Panel (Branding) */}
                <div className="auth-split-right">
                    <img src="/assets/signupIMG.png" alt="background" className="auth-branding-img" />
                    <div className="auth-branding-overlay">
                        <div className="auth-branding-logo">
                            <img src="/src/assets/logo.png" alt="logo" />
                            <h1>AntiPlanify</h1>
                        </div>
                        <div className="auth-branding-content">
                            <p className="auth-branding-tagline">
                                "Ideas grow when you begin — sign up now and bring your vision to life."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel (Form) */}
                <div className="auth-split-left">
                    <div className="auth-header">
                        <h2 className="auth-title">Create Account</h2>
                        <p className="auth-subtitle">
                            Already have an account? <Link to="/login">Sign in instead</Link>
                        </p>
                    </div>

                    {error && <div className="auth-message error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-row">
                            <div className="auth-form-group" style={{ flex: 1 }}>
                                <label className="auth-label">First Name</label>
                                <div className="auth-input-wrapper">
                                    <User className="auth-input-icon" size={20} />
                                    <input
                                        type="text"
                                        placeholder="John"
                                        className="auth-input"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="auth-form-group" style={{ flex: 1 }}>
                                <label className="auth-label">Last Name</label>
                                <div className="auth-input-wrapper">
                                    <User className="auth-input-icon" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        className="auth-input"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

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
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                />
                                <span>I agree to the Terms &amp; Conditions</span>
                            </label>
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? <Loader2 className="spinner" size={20} /> : (
                                <>
                                    <UserPlus size={20} />
                                    <span>Create Account</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <div className="auth-divider-line"></div>
                        <span className="auth-divider-text">or sign up with</span>
                        <div className="auth-divider-line"></div>
                    </div>

                    <div className="auth-social-row">
                        <button type="button" className="auth-social-btn">
                            <img src="https://www.svgrepo.com/show/355037/google.svg" width="20" height="20" alt="Google" />
                            <span>Google</span>
                        </button>
                        <button type="button" className="auth-social-btn">
                            <img src="https://www.svgrepo.com/show/448204/apple.svg" width="20" height="20" alt="Apple" />
                            <span>Apple</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
