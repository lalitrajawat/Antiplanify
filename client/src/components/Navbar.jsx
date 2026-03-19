import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Bell, Search, Menu, X, User, Settings, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { formatDistanceToNow } from 'date-fns';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    
    const userMenuRef = useRef(null);
    const notifRef = useRef(null);

    // close menus on outside click or Escape
    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape') {
                setMobileOpen(false);
                setUserMenuOpen(false);
            }
        }
        function onDocClick(e) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('keydown', onKey);
        document.addEventListener('click', onDocClick);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('click', onDocClick);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchNotifications();
        }
    }, [user]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/projects?search=${searchQuery}`);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : 'U';

    return (
        <header className="pf-navbar" role="banner">
            <div className="pf-navbar-inner">
                <div className="pf-left">
                    <button
                        className="pf-mobile-toggle"
                        onClick={() => setMobileOpen((s) => !s)}
                        aria-expanded={mobileOpen}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileOpen ? <X /> : <Menu />}
                    </button>

                    <Link to="/" className="pf-logo">
                        <span className="pf-logo-mark" aria-hidden="true">P</span>
                        <span className="pf-logo-text">Planify</span>
                    </Link>

                    <nav className={`pf-links ${mobileOpen ? 'open' : ''}`} aria-label="Main navigation">
                        <Link to="/" className="pf-link">Dashboard</Link>
                        <Link to="/projects" className="pf-link">Projects</Link>
                        <Link to="/calendar" className="pf-link">Calendar</Link>
                    </nav>
                </div>

                <div className="pf-right">
                    <div className="pf-search">
                        <label htmlFor="site-search" className="sr-only">Search projects and tasks</label>
                        <div className="pf-search-inner">
                            <Search className="pf-search-icon" />
                            <input 
                                id="site-search" 
                                className="pf-search-input" 
                                placeholder="Search projects, tasks..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>

                    <div className="pf-notif-container" ref={notifRef}>
                        <button
                            className="pf-btn pf-notif"
                            aria-label="Notifications"
                            title="Notifications"
                            onClick={() => setNotifOpen(!notifOpen)}
                        >
                            <Bell />
                            {unreadCount > 0 && <span className="pf-badge" aria-hidden="true">{unreadCount}</span>}
                        </button>

                        {/* Notifications Dropdown */}
                        <div className={`pf-notif-dropdown ${notifOpen ? 'open' : ''}`}>
                            <div className="pf-notif-header">
                                <h3>Notifications</h3>
                                {unreadCount > 0 && <span className="pf-unread-dot">{unreadCount} new</span>}
                            </div>
                            <div className="pf-notif-list">
                                {notifications.length === 0 ? (
                                    <p className="pf-notif-empty">No notifications yet</p>
                                ) : (
                                    notifications.map(n => (
                                        <div 
                                            key={n._id} 
                                            className={`pf-notif-item ${!n.isRead ? 'unread' : ''}`}
                                            onClick={() => markAsRead(n._id)}
                                        >
                                            <div className="pf-notif-icon">
                                                {n.isRead ? <CheckCircle size={16} color="#10b981" /> : <Clock size={16} color="#c4a5ff" />}
                                            </div>
                                            <div className="pf-notif-content">
                                                <p>{n.message}</p>
                                                <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {user ? (
                        <div className="pf-user" ref={userMenuRef}>
                            <button
                                className="pf-user-trigger"
                                onClick={() => setUserMenuOpen((s) => !s)}
                                aria-haspopup="menu"
                                aria-expanded={userMenuOpen}
                                aria-label="User menu"
                            >
                                <div className="pf-avatar" title={user.name}>
                                    {initials}
                                </div>
                                <span className="pf-user-name">{user.name}</span>
                            </button>

                            <div
                                className={`pf-user-menu ${userMenuOpen ? 'open' : ''}`}
                                role="menu"
                                aria-hidden={!userMenuOpen}
                            >
                                <Link to="/profile" className="pf-user-item" role="menuitem">
                                    <User className="ic" /> Profile
                                </Link>
                                <Link to="/settings" className="pf-user-item" role="menuitem">
                                    <Settings className="ic" /> Settings
                                </Link>
                                <button className="pf-user-item danger" onClick={handleLogout} role="menuitem">
                                    <LogOut className="ic" /> Log out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pf-auth">
                            <Link to="/login" className="pf-btn pf-outline">Login</Link>
                            <Link to="/signup" className="pf-btn pf-primary">Sign up</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* mobile backdrop (click to close) */}
            {mobileOpen && <div className="pf-mobile-backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
        </header>
    );
}
