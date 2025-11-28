import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { Link } from "react-router-dom";
import {
    Plus,
    Calendar,
    CheckCircle,
    Clock,
    Bell,
    LayoutDashboard,
    ListTodo,
} from "lucide-react";
import { format } from "date-fns";
import "./Home.css";

const Home = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProjects: 0,
        tasksDueToday: 0,
        completedTasks: 0,
    });

    const [pinnedProjects, setPinnedProjects] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: projects } = await api.get("/projects");
                const pinned = projects.filter((p) => p.pinned);
                setPinnedProjects(pinned);

                // Simple derived stats (adjust later when you have real tasks API)
                const completed = projects.filter((p) => (p.progress || 0) === 100).length;

                setStats((prev) => ({
                    ...prev,
                    totalProjects: projects.length,
                    completedTasks: completed,
                }));

                // TEMP demo tasks – replace with real API when ready
                setTodayTasks([
                    { id: 1, title: "Design wireframes", priority: "High" },
                    { id: 2, title: "Refactor task service", priority: "Medium" },
                    { id: 3, title: "Update Gantt dates", priority: "Low" },
                ]);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        };
        fetchData();
    }, []);

    const avgProgress =
        pinnedProjects.length > 0
            ? Math.round(
                pinnedProjects.reduce((sum, p) => sum + (p.progress || 0), 0) /
                pinnedProjects.length
            )
            : 0;

    const tasksDueToday = todayTasks.length;

    return (
        <div className="home-container">
            {/* Top header */}
            <div className="home-header">
                <div>
                    <p className="home-subtitle">Dashboard</p>
                    <h1 className="home-title">
                        Hello, <span className="highlight">{user?.name}</span> 👋
                    </h1>
                    <p className="home-date">
                        <Calendar size={16} className="icon-inline" />
                        {format(new Date(), "EEEE, MMMM do, yyyy")}
                    </p>
                </div>
                <div className="home-header-right">
                    <button className="ghost-btn">
                        <Bell size={16} />
                    </button>
                    <Link to="/projects" className="primary-btn">
                        <Plus size={16} />
                        New Project
                    </Link>
                </div>
            </div>

            {/* GRID LAYOUT */}
            <div className="home-grid">
                {/* Daily To-Do */}
                <section className="panel panel-todo">
                    <div className="panel-header">
                        <div className="panel-title-wrap">
                            <span className="panel-icon">
                                <ListTodo size={16} />
                            </span>
                            <h2 className="panel-title">Daily To-Do</h2>
                        </div>
                        <span className="panel-badge">
                            {tasksDueToday} task{tasksDueToday !== 1 ? "s" : ""} today
                        </span>
                    </div>

                    <ul className="todo-list">
                        {todayTasks.map((task) => (
                            <li key={task.id} className="todo-item">
                                <div className="todo-left">
                                    <input type="checkbox" className="todo-checkbox" />
                                    <span className="todo-text">{task.title}</span>
                                </div>
                                <span className={`priority-pill ${task.priority.toLowerCase()}`}>
                                    {task.priority}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Project Progress circle */}
                <section className="panel panel-progress">
                    <div className="panel-header">
                        <div className="panel-title-wrap">
                            <span className="panel-icon">
                                <LayoutDashboard size={16} />
                            </span>
                            <h2 className="panel-title">Project Progress</h2>
                        </div>
                        <p className="panel-subtext">Average of pinned projects</p>
                    </div>

                    <div
                        className="progress-circle"
                        style={{ "--progress": avgProgress }}
                    >
                        <div className="progress-inner">
                            <span className="progress-value">{avgProgress}%</span>
                            <span className="progress-label">Overall</span>
                        </div>
                    </div>

                    <div className="progress-meta">
                        <div className="progress-meta-row">
                            <span className="dot dot-purple"></span>
                            <span>Total projects</span>
                            <span className="meta-value">{stats.totalProjects}</span>
                        </div>
                        <div className="progress-meta-row">
                            <span className="dot dot-green"></span>
                            <span>Completed</span>
                            <span className="meta-value">{stats.completedTasks}</span>
                        </div>
                    </div>
                </section>

                {/* Notifications */}
                <section className="panel panel-notifications">
                    <div className="panel-header">
                        <div className="panel-title-wrap">
                            <span className="panel-icon">
                                <Bell size={16} />
                            </span>
                            <h2 className="panel-title">Notifications</h2>
                        </div>
                    </div>

                    <ul className="notifications-list">
                        <li className="notification-item">
                            <p className="notification-title">Fix bugs in Task Manager</p>
                            <span className="notification-meta">Today · 4:30 PM</span>
                        </li>
                        <li className="notification-item">
                            <p className="notification-title">
                                Project &quot;E-commerce Website&quot; marked as complete
                            </p>
                            <span className="notification-meta">Yesterday · 6:12 PM</span>
                        </li>
                        <li className="notification-item">
                            <p className="notification-title">
                                Upcoming deadline: &quot;Database setup&quot;
                            </p>
                            <span className="notification-meta">In 3 days</span>
                        </li>
                    </ul>
                </section>

                {/* Gantt-like progress (using pinned projects) */}
                <section className="panel panel-gantt">
                    <div className="panel-header">
                        <div className="panel-title-wrap">
                            <span className="panel-icon">
                                <Clock size={16} />
                            </span>
                            <h2 className="panel-title">Timeline Overview</h2>
                        </div>
                        <span className="panel-subtext">Pinned project progress</span>
                    </div>

                    {pinnedProjects.length > 0 ? (
                        <div className="gantt-list">
                            {pinnedProjects.map((project) => (
                                <div key={project._id} className="gantt-row">
                                    <div className="gantt-label">
                                        <span className="gantt-title">{project.title}</span>
                                        <span className="gantt-tech">
                                            {project.techStack?.[0] || "General"}
                                        </span>
                                    </div>
                                    <div className="gantt-bar-track">
                                        <div
                                            className="gantt-bar"
                                            style={{ width: `${project.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-mini">
                            <p>No pinned projects to show in timeline.</p>
                        </div>
                    )}
                </section>

                {/* Tasks panel (mini cards) */}
                <section className="panel panel-tasks">
                    <div className="panel-header">
                        <div className="panel-title-wrap">
                            <span className="panel-icon">
                                <CheckCircle size={16} />
                            </span>
                            <h2 className="panel-title">Tasks</h2>
                        </div>
                        <span className="panel-subtext">Quick view</span>
                    </div>

                    <div className="task-list">
                        {todayTasks.map((task) => (
                            <div key={task.id} className="task-card">
                                <div>
                                    <p className="task-title">{task.title}</p>
                                    <span className="task-status">Today</span>
                                </div>
                                <span className={`priority-pill ${task.priority.toLowerCase()}`}>
                                    {task.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pinned projects as cards */}
                <section className="panel panel-projects">
                    <div className="panel-header">
                        <div className="panel-title-wrap">
                            <span className="panel-icon">
                                <LayoutDashboard size={16} />
                            </span>
                            <h2 className="panel-title">Pinned Projects</h2>
                        </div>
                        <Link to="/projects" className="panel-link">
                            View all
                        </Link>
                    </div>

                    {pinnedProjects.length > 0 ? (
                        <div className="projects-grid">
                            {pinnedProjects.map((project) => (
                                <Link
                                    key={project._id}
                                    to={`/projects/${project._id}`}
                                    className="project-pill"
                                >
                                    <div className="project-pill-main">
                                        <span className="project-pill-title">{project.title}</span>
                                        <span className="project-pill-tech">
                                            {project.techStack?.[0] || "General"}
                                        </span>
                                    </div>
                                    <div className="project-pill-meta">
                                        <div className="pill-progress-track">
                                            <div
                                                className="pill-progress-fill"
                                                style={{ width: `${project.progress || 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="pill-progress-label">
                                            {project.progress || 0}% done
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No pinned projects yet.</p>
                            <Link to="/projects" className="create-link">
                                Create one?
                            </Link>
                        </div>
                    )}
                </section>
            </div>

            {/* Floating + button */}
            <Link to="/projects" className="floating-new-project">
                <Plus size={20} />
            </Link>
        </div>
    );
};

export default Home;
