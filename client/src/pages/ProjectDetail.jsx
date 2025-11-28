import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { Calendar as CalendarIcon, List, BarChart2, CheckCircle as CheckCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Gantt, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import './ProjectDetail.css';

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

    if (loading) return <div className="loading-container">Loading project...</div>;
    if (!project) return <div className="loading-container">Project not found</div>;

    return (
        <div className="project-detail-container">
            {/* Sidebar */}
            <div className="project-sidebar">
                <h1 className="project-title">{project.title}</h1>
                <p className="project-desc">{project.description}</p>

                <div className="sidebar-section">
                    <h3 className="sidebar-section-title">Tech Stack</h3>
                    <div className="tech-stack">
                        {project.techStack.map((tech, i) => (
                            <span key={i} className="tech-badge">{tech}</span>
                        ))}
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3 className="sidebar-section-title">Timeline</h3>
                    <div className="timeline-text">
                        <p>Start: {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'Not set'}</p>
                        <p>End: {project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : 'Not set'}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Tabs */}
                <div className="tabs-header">
                    <div className="tabs-list">
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
                        >
                            <List className="h-4 w-4" />
                            <span>Tasks</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('gantt')}
                            className={`tab-button ${activeTab === 'gantt' ? 'active' : ''}`}
                        >
                            <BarChart2 className="h-4 w-4" />
                            <span>Gantt</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
                        >
                            <CalendarIcon className="h-4 w-4" />
                            <span>Calendar</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
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
        <div className="tasks-view-container">
            <form onSubmit={handleAddTask} className="add-task-form">
                <input
                    type="text"
                    placeholder="Add a new task..."
                    className="task-input"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <button type="submit" className="btn-add-task">
                    Add
                </button>
            </form>

            <div className="tasks-list">
                {tasks.map(task => (
                    <div key={task._id} className="task-item group">
                        <div className="task-left">
                            <button
                                onClick={() => handleStatusChange(task._id, task.status)}
                                className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                            >
                                {task.status === 'done' && <CheckCircleIcon className="w-3 h-3 text-white" />}
                            </button>
                            <span className={`task-title ${task.status === 'done' ? 'completed' : ''}`}>{task.title}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={`priority-badge ${task.priority}`}>
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
    if (tasks.length === 0) return <div className="empty-gantt">No tasks with dates to display.</div>;

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

    if (ganttTasks.length === 0) return <div className="empty-gantt">Add start and end dates to tasks to see them here.</div>;

    return (
        <div className="gantt-container">
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
        <div className="calendar-container">
            <div className="calendar-header">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="calendar-grid">
                {days.map(day => (
                    <div key={day} className="calendar-day">
                        <span className="day-number">{day <= 30 ? day : ''}</span>
                        {day <= 30 && tasks.slice(0, 2).map((task, i) => (
                            <div key={i} className="calendar-task">
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
