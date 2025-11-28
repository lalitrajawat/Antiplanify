import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Layout, Calendar } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-content">
                    <div className="navbar-left">
                        <Link to="/" className="logo-link">
                            <span className="logo-text">Planify</span>
                        </Link>
                        {user && (
                            <div className="nav-links">
                                <Link to="/" className="nav-link active">
                                    Dashboard
                                </Link>
                                <Link to="/projects" className="nav-link">
                                    Projects
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="navbar-right">
                        {user ? (
                            <div className="user-menu">
                                <div className="user-info">
                                    <div className="user-avatar">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="user-name">{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="btn-logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="btn-login">
                                    Login
                                </Link>
                                <Link to="/signup" className="btn-signup">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
