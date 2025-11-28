import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Search, Pin } from 'lucide-react';
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

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects');
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const stackArray = newProject.techStack.split(',').map(s => s.trim());
            await api.post('/projects', { ...newProject, techStack: stackArray });
            setIsModalOpen(false);
            fetchProjects();
            setNewProject({ title: '', description: '', techStack: '', startDate: '', endDate: '' });
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    return (
        <div className="projects-container">
            <div className="projects-header">
                <h1 className="projects-title">Projects</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-new-project"
                >
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
                                {project.pinned && <Pin className="h-4 w-4 text-primary fill-current" />}
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

            {/* Simple Modal for New Project */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">Create New Project</h2>
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
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                >
                                    Create Project
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
