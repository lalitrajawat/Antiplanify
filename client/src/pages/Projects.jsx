import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Search, Pin } from 'lucide-react';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    <span>New Project</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <Link key={project._id} to={`/projects/${project._id}`} className="block group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md h-full flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{project.title}</h3>
                                {project.pinned && <Pin className="h-4 w-4 text-primary fill-current" />}
                            </div>
                            <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-grow">{project.description}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.techStack.slice(0, 3).map((tech, i) => (
                                    <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{tech}</span>
                                ))}
                                {project.techStack.length > 3 && (
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">+{project.techStack.length - 3}</span>
                                )}
                            </div>

                            <div className="mt-auto">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>{project.progress || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all duration-500"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Project Title"
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                value={newProject.title}
                                onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                value={newProject.description}
                                onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Tech Stack (comma separated)"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                value={newProject.techStack}
                                onChange={e => setNewProject({ ...newProject, techStack: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={newProject.startDate}
                                    onChange={e => setNewProject({ ...newProject, startDate: e.target.value })}
                                />
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={newProject.endDate}
                                    onChange={e => setNewProject({ ...newProject, endDate: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700"
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
