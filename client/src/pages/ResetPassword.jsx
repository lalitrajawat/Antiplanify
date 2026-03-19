import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Lock, Loader2, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import "./Auth.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-card-centered text-center">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <CheckCircle size={80} color="var(--color-success)" />
          </div>
          <h1 className="auth-title">Success!</h1>
          <p className="auth-subtitle">Your password has been reset successfully.</p>
          <div className="auth-message success" style={{ marginTop: 'var(--space-4)' }}>
            Redirecting you to login in a few seconds...
          </div>
          <Link to="/login" className="auth-btn" style={{ marginTop: 'var(--space-6)' }}>
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-centered">
        <div className="auth-header text-center">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your new password below</p>
        </div>

        {error && <div className="auth-message error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label className="auth-label">New Password</label>
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

          <div className="auth-form-group">
            <label className="auth-label">Confirm Password</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                className="auth-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={20} /> : (
              <>
                <RefreshCw size={20} />
                <span>Reset Password</span>
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

export default ResetPassword;
