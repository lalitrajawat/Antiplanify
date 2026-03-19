import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Search, Pin, Trash2, Edit2, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './Projects.css';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        techStack: '',
        startDate: '',
        endDate: ''
    });
    const [editingProject, setEditingProject] = useState(null);
    const location = useLocation();

    const fetchProjects = async (query = "") => {
        try {
            const endpoint = query ? `/projects?search=${query}` : '/projects';
            const { data } = await api.get(endpoint);
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search).get('search');
        if (query) {
            fetchProjects(query);
        } else {
            fetchProjects();
        }
    }, [location.search]);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const stackArray = newProject.techStack.split(',').map(s => s.trim());
            if (editingProject) {
                await api.put(`/projects/${editingProject._id}`, { ...newProject, techStack: stackArray });
            } else {
                await api.post('/projects', { ...newProject, techStack: stackArray });
            }

            setIsModalOpen(false);
            setEditingProject(null);
            fetchProjects(); 
            setNewProject({ title: '', description: '', techStack: '', startDate: '', endDate: '' });
        } catch (error) {
            console.error('Error creating/updating project:', error);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this project?")) return;
        try {
            await api.delete(`/projects/${id}`);
            fetchProjects();
        } catch (err) {
            console.error("Error deleting project:", err);
        }
    };

    const handlePin = async (e, project) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.put(`/projects/${project._id}`, { pinned: !project.pinned });
            fetchProjects();
        } catch (err) {
            console.error("Error pinning project:", err);
        }
    };

    const openEdit = (e, project) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingProject(project);
        setNewProject({
            title: project.title,
            description: project.description,
            techStack: project.techStack.join(', '),
            startDate: project.startDate ? project.startDate.split('T')[0] : '',
            endDate: project.endDate ? project.endDate.split('T')[0] : ''
        });
        setIsModalOpen(true);
    };

    return (
        <div className="projects-container">
            <div className="projects-header">
                <h1 className="projects-title">Projects</h1>

                <button onClick={() => setIsModalOpen(true)} className="btn-new-project">
                    <Plus className="h-5 w-5" />
                    <span>New Project</span>
                </button>
            </div>

            <div className="projects-grid">
                {projects.map(project => (
                    <Link key={project._id} to={`/projects/${project._id}`} className="project-card-link group">
                        <div className="project-card">
                            <div className="project-card-header">
                                <h3 className="project-card-title">{project.title}</h3>
                                <div className="card-actions">
                                    <button onClick={(e) => handlePin(e, project)} className={`action-btn ${project.pinned ? 'active' : ''}`}>
                                        <Pin size={16} />
                                    </button>
                                    <button onClick={(e) => openEdit(e, project)} className="action-btn">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={(e) => handleDelete(e, project._id)} className="action-btn danger">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <p className="project-card-desc">{project.description}</p>

                            <div className="tech-stack">
                                {project.techStack.slice(0, 3).map((tech, i) => (
                                    <span key={i} className="tech-badge">{tech}</span>
                                ))}
                                {project.techStack.length > 3 && (
                                    <span className="tech-badge">+{project.techStack.length - 3}</span>
                                )}
                            </div>

                            <div className="project-card-footer">
                                <div className="card-meta-row">
                                    {project.endDate && (
                                        <span className="card-deadline">
                                            📅 {new Date(project.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                    <span className="card-task-count">
                                        🗂 {project.taskCount ?? 0} task{project.taskCount !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="progress-label">
                                    <span>Progress</span>
                                    <span>{project.progress || 0}%</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${project.progress || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
                            <button onClick={() => { setIsModalOpen(false); setEditingProject(null); }} className="close-btn"><X /></button>
                        </div>

                        <form onSubmit={handleCreateProject} className="modal-form">
                            <input
                                type="text"
                                placeholder="Project Title"
                                required
                                className="form-input"
                                value={newProject.title}
                                onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                            />

                            <textarea
                                placeholder="Description"
                                className="form-textarea"
                                value={newProject.description}
                                onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                            />

                            <input
                                type="text"
                                placeholder="Tech Stack (comma separated)"
                                className="form-input"
                                value={newProject.techStack}
                                onChange={e => setNewProject({ ...newProject, techStack: e.target.value })}
                            />

                            <div className="form-row">
                                <input
                                    type="date"
                                    className="form-input"
                                    value={newProject.startDate}
                                    onChange={e => setNewProject({ ...newProject, startDate: e.target.value })}
                                />

                                <input
                                    type="date"
                                    className="form-input"
                                    value={newProject.endDate}
                                    onChange={e => setNewProject({ ...newProject, endDate: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingProject ? 'Save Changes' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
