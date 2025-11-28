import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { Plus, Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Hello, {user?.name} 👋</h1>
                <p className="text-gray-500 mt-1">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Layout className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Projects</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-red-50 rounded-lg text-red-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Tasks Due Today</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.tasksDueToday}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-green-50 rounded-lg text-green-600">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Completed Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
                    </div>
                </div>
            </div>

            {/* Pinned Projects */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Pinned Projects</h2>
                    <Link to="/projects" className="text-primary text-sm font-medium hover:text-indigo-600">View All</Link>
                </div>
                {pinnedProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pinnedProjects.map(project => (
                            <Link key={project._id} to={`/projects/${project._id}`} className="block group">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{project.title}</h3>
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{project.techStack[0]}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{project.description}</p>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${project.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No pinned projects yet.</p>
                        <Link to="/projects" className="text-primary font-medium mt-2 inline-block">Create one?</Link>
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
