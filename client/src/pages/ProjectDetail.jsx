import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { Calendar as CalendarIcon, List, BarChart2, CheckCircle as CheckCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Gantt, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";

const ProjectDetail = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('tasks');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectRes, tasksRes] = await Promise.all([
                    api.get(`/projects/${id}`),
                    api.get(`/tasks/project/${id}`)
                ]);
                setProject(projectRes.data);
                setTasks(tasksRes.data);
            } catch (error) {
                console.error('Error fetching project details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const refreshTasks = async () => {
        try {
            const { data } = await api.get(`/tasks/project/${id}`);
            setTasks(data);
        } catch (error) {
            console.error('Error refreshing tasks:', error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading project...</div>;
    if (!project) return <div className="p-8 text-center">Project not found</div>;

    return (
        <div className="flex h-[calc(100vh-64px)]">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 p-6 flex-shrink-0 overflow-y-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
                <p className="text-gray-500 text-sm mb-6">{project.description}</p>

                <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{tech}</span>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Timeline</h3>
                    <div className="text-sm text-gray-600">
                        <p>Start: {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'Not set'}</p>
                        <p>End: {project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : 'Not set'}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tabs */}
                <div className="bg-white border-b border-gray-200 px-6">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'tasks' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <List className="h-4 w-4" />
                            <span>Tasks</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('gantt')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'gantt' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <BarChart2 className="h-4 w-4" />
                            <span>Gantt</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'calendar' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <CalendarIcon className="h-4 w-4" />
                            <span>Calendar</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {activeTab === 'tasks' && <TasksView tasks={tasks} projectId={id} onUpdate={refreshTasks} />}
                    {activeTab === 'gantt' && <GanttView tasks={tasks} />}
                    {activeTab === 'calendar' && <CalendarView tasks={tasks} />}
                </div>
            </div>
        </div>
    );
};

const TasksView = ({ tasks, projectId, onUpdate }) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            await api.post('/tasks', {
                projectId,
                title: newTaskTitle,
                status: 'todo',
                priority: 'medium',
                startDate: new Date(), // Default to today
                endDate: new Date(Date.now() + 86400000) // Default to tomorrow
            });
            setNewTaskTitle('');
            onUpdate();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleStatusChange = async (taskId, currentStatus) => {
        const newStatus = currentStatus === 'done' ? 'todo' : 'done';
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            onUpdate();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleAddTask} className="mb-6 flex gap-2">
                <input
                    type="text"
                    placeholder="Add a new task..."
                    className="flex-1 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none shadow-sm"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <button type="submit" className="bg-primary text-white px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    Add
                </button>
            </form>

            <div className="space-y-3">
                {tasks.map(task => (
                    <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => handleStatusChange(task._id, task.status)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === 'done' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-primary'}`}
                            >
                                {task.status === 'done' && <CheckCircleIcon className="w-3 h-3 text-white" />}
                            </button>
                            <span className={`${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-blue-100 text-blue-700'
                                }`}>
                                {task.priority}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GanttView = ({ tasks }) => {
    if (tasks.length === 0) return <div className="text-center text-gray-500 mt-10">No tasks with dates to display.</div>;

    // Transform tasks for the library
    const ganttTasks = tasks
        .filter(t => t.startDate && t.endDate)
        .map(t => ({
            start: new Date(t.startDate),
            end: new Date(t.endDate),
            name: t.title,
            id: t._id,
            type: 'task',
            progress: t.status === 'done' ? 100 : 0,
            isDisabled: true,
            styles: { progressColor: '#4F46E5', progressSelectedColor: '#4338ca' }
        }));

    if (ganttTasks.length === 0) return <div className="text-center text-gray-500 mt-10">Add start and end dates to tasks to see them here.</div>;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <Gantt
                tasks={ganttTasks}
                viewMode={ViewMode.Day}
                columnWidth={60}
                listCellWidth=""
            />
        </div>
    );
};

const CalendarView = ({ tasks }) => {
    const days = Array.from({ length: 35 }, (_, i) => i + 1);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-7 gap-4 mb-4 text-center font-medium text-gray-400">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-4">
                {days.map(day => (
                    <div key={day} className="min-h-[100px] border border-gray-100 rounded-lg p-2 relative hover:bg-gray-50 transition-colors">
                        <span className="text-sm text-gray-400">{day <= 30 ? day : ''}</span>
                        {day <= 30 && tasks.slice(0, 2).map((task, i) => (
                            <div key={i} className="mt-1 text-xs bg-primary/10 text-primary px-1 py-0.5 rounded truncate">
                                {task.title}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectDetail;
