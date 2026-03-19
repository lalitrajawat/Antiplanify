import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, User, FolderOpen, CheckSquare, Calendar,
    Bot, Settings, Users, LogOut, Moon, Sun, ChevronDown, Pin
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import './Sidebar.css';

export default function Sidebar({ darkMode, onToggleDark }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [pinnedProjects, setPinnedProjects] = useState([]);

    useEffect(() => {
        if (user) {
            api.get('/projects').then(({ data }) => {
                setPinnedProjects(data.filter(p => p.pinned).slice(0, 3));
            }).catch(() => {});
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : 'U';

    const navLinks = [
        { to: '/',          icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/profile',   icon: <User size={18} />,           label: 'Personal' },
        { to: '/projects',  icon: <FolderOpen size={18} />,     label: 'Projects' },
        { to: '/calendar',  icon: <Calendar size={18} />,       label: 'Calendar' },
        { to: '/chat',      icon: <Bot size={18} />,            label: 'AI Assistant', disabled: true },
        { to: '/settings',  icon: <Settings size={18} />,       label: 'Settings' },
    ];

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <span className="sidebar-logo-text">AntiPlanify</span>
                <ChevronDown size={14} className="sidebar-logo-chevron" />
            </div>

            {/* Nav Links */}
            <nav className="sidebar-nav">
                {navLinks.map(({ to, icon, label, disabled }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`
                        }
                        onClick={disabled ? e => e.preventDefault() : undefined}
                    >
                        <span className="sidebar-link-icon">{icon}</span>
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Pinned projects */}
            {pinnedProjects.length > 0 && (
                <div className="sidebar-section">
                    <p className="sidebar-section-label">
                        <Pin size={12} /> Pinned
                    </p>
                    {pinnedProjects.map(p => (
                        <NavLink
                            key={p._id}
                            to={`/projects/${p._id}`}
                            className="sidebar-project-item"
                        >
                            <span className="sidebar-project-dot" />
                            <span className="sidebar-project-name">{p.title}</span>
                            {p.taskCount !== undefined && (
                                <span className="sidebar-project-count">{p.taskCount}</span>
                            )}
                        </NavLink>
                    ))}
                </div>
            )}

            <div className="sidebar-section">
                <button className="sidebar-link sidebar-invite-btn">
                    <Users size={18} />
                    <span>Invite Members</span>
                </button>
            </div>

            {/* Bottom */}
            <div className="sidebar-bottom">
                {/* User info */}
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{initials}</div>
                    <div className="sidebar-user-info">
                        <p className="sidebar-user-name">{user?.name}</p>
                        <p className="sidebar-user-email">{user?.email}</p>
                    </div>
                </div>

                {/* Dark mode toggle */}
                <div className="sidebar-dark-toggle">
                    {darkMode ? <Moon size={15} /> : <Sun size={15} />}
                    <span>Dark Mode</span>
                    <button
                        className={`toggle-switch ${darkMode ? 'on' : ''}`}
                        onClick={onToggleDark}
                        aria-label="Toggle dark mode"
                    >
                        <span className="toggle-thumb" />
                    </button>
                </div>

                {/* Logout */}
                <button className="sidebar-logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
