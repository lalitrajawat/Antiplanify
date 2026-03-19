import { useState } from "react";
import api from "../utils/api";
import { Mail, ArrowLeft, Loader2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import "./Auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message || "Reset link sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-centered">
        <div className="auth-header text-center">
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">Enter your email to receive a reset link</p>
        </div>

        {message && <div className="auth-message success">{message}</div>}
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

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={20} /> : (
              <>
                <Send size={20} />
                <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>

        <Link to="/login" className="auth-back-link">
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
