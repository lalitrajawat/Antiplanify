import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, Sun, Moon, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './Topbar.css';

export default function Topbar({ darkMode, onToggleDark }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/projects?search=${searchQuery}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : 'U';

    return (
        <header className="topbar">
            <div className="topbar-left">
                <button className="topbar-menu-btn" aria-label="Menu">
                    <Menu size={20} />
                </button>

                <div className="topbar-search">
                    <Search size={16} className="topbar-search-icon" />
                    <input
                        className="topbar-search-input"
                        placeholder="Search projects, tasks..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            <div className="topbar-right">
                {/* Theme Toggle */}
                <button
                    className="topbar-theme-btn"
                    onClick={onToggleDark}
                    aria-label="Toggle theme"
                >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notifications */}
                <button className="topbar-notifications-btn" aria-label="Notifications">
                    <Bell size={18} />
                    <span className="notification-badge">3</span>
                </button>

                {/* User Menu */}
                <div className="topbar-user-menu">
                    <button
                        className="topbar-user-btn"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        aria-label="User menu"
                    >
                        <div className="user-avatar">
                            {initials}
                        </div>
                        <span className="user-name">{user?.name || 'User'}</span>
                    </button>

                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="user-dropdown-header">
                                <div className="user-avatar-large">
                                    {initials}
                                </div>
                                <div className="user-info">
                                    <div className="user-name">{user?.name}</div>
                                    <div className="user-email">{user?.email}</div>
                                </div>
                            </div>

                            <div className="user-dropdown-divider"></div>

                            <button className="user-dropdown-item" onClick={() => navigate('/profile')}>
                                <User size={16} />
                                Profile
                            </button>

                            <button className="user-dropdown-item" onClick={() => navigate('/settings')}>
                                <Settings size={16} />
                                Settings
                            </button>

                            <div className="user-dropdown-divider"></div>

                            <button className="user-dropdown-item logout" onClick={handleLogout}>
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay for mobile */}
            {showUserMenu && (
                <div
                    className="topbar-overlay"
                    onClick={() => setShowUserMenu(false)}
                ></div>
            )}
        </header>
    );
}
