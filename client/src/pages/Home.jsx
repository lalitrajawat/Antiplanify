import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { Plus, Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import './Home.css';

const Home = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProjects: 0,
        tasksDueToday: 0,
        completedTasks: 0
    });
    const [pinnedProjects, setPinnedProjects] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, we'd have specific endpoints for stats
                // For now, we'll fetch all projects and calculate locally or fetch from a dashboard endpoint
                // Let's assume we fetch projects and tasks separately for now
                const { data: projects } = await api.get('/projects');
                const pinned = projects.filter(p => p.pinned);
                setPinnedProjects(pinned);
                setStats(prev => ({ ...prev, totalProjects: projects.length }));

                // Fetch tasks (we might need a 'get all tasks' endpoint or iterate projects)
                // For simplicity, let's just show static stats or fetch from a new endpoint if we had one
                // I'll implement a simple dashboard endpoint logic here by fetching projects
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="home-container">
            <div className="home-header">
                <h1 className="home-title">Hello, {user?.name} 👋</h1>
                <p className="home-date">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Layout className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="stat-label">Total Projects</p>
                        <p className="stat-value">{stats.totalProjects}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="stat-label">Tasks Due Today</p>
                        <p className="stat-value">{stats.tasksDueToday}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="stat-label">Completed Tasks</p>
                        <p className="stat-value">{stats.completedTasks}</p>
                    </div>
                </div>
            </div>

            {/* Pinned Projects */}
            <div className="pinned-section">
                <div className="section-header">
                    <h2 className="section-title">Pinned Projects</h2>
                    <Link to="/projects" className="view-all-link">View All</Link>
                </div>
                {pinnedProjects.length > 0 ? (
                    <div className="projects-grid">
                        {pinnedProjects.map(project => (
                            <Link key={project._id} to={`/projects/${project._id}`} className="project-card-link group">
                                <div className="project-card">
                                    <div className="project-card-header">
                                        <h3 className="project-title">{project.title}</h3>
                                        <span className="tech-badge">{project.techStack[0]}</span>
                                    </div>
                                    <p className="project-desc">{project.description}</p>
                                    <div className="progress-bar-bg">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${project.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No pinned projects yet.</p>
                        <Link to="/projects" className="create-link">Create one?</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

function Layout({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    );
}

export default Home;
