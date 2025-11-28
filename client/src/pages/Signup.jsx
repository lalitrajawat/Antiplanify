import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { signup } = useAuth(); // from AuthContext

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!acceptedTerms) {
            setError("Please accept the Terms & Conditions.");
            return;
        }

        const fullName = `${firstName} ${lastName}`.trim();

        try {
            await signup(fullName, email, password);
            navigate("/");
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to sign up");
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">

                {/* Left Panel */}
                <div className="signup-left">
                    <img src="/assets/signupIMG.png" alt="background" className="signup-img" />

                    <div className="signup-overlay">
                        <div className="signup-header">
                            <img src="src/assets/logo.png" alt="logo" id="logoIMG" />
                            <h1 className="logo">lanify</h1>
                        </div>
                        <p className="signup-tagline">
                            Ideas grow when you begin — sign up now.
                        </p>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="signup-right">
                    <h2 className="signup-title">Create an account</h2>
                    <p className="signup-subtext">
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="signup-row">
                            <input
                                type="text"
                                placeholder="First name"
                                className="signup-input half"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />

                            <input
                                type="text"
                                placeholder="Last name"
                                className="signup-input half"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>

                        <input
                            type="email"
                            placeholder="Email address"
                            className="signup-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="signup-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div className="signup-terms">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                            />
                            <label htmlFor="terms">I agree to the Terms &amp; Conditions</label>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="signup-btn">Create account</button>

                        <div className="signup-row">
                            <button type="button" className="signup-btn small">Google</button>
                            <button type="button" className="signup-btn small">Apple</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
