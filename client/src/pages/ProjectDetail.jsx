import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Gantt, ViewMode } from 'gantt-task-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { LayoutDashboard, Calendar as CalendarIcon, List, BarChart2, CheckCircle as CheckCircleIcon } from 'lucide-react';
import "gantt-task-react/dist/index.css";
import './ProjectDetail.css';
import ChatbotWidget from '../components/ChatbotWidget';
import api from '../utils/api';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
                            onClick={() => setActiveTab('kanban')}
                            className={`tab-button ${activeTab === 'kanban' ? 'active' : ''}`}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Kanban</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'tasks' && <TasksView tasks={tasks} projectId={id} onUpdate={refreshTasks} />}
                    {activeTab === 'kanban' && <KanbanView tasks={tasks} onUpdate={refreshTasks} />}
                    {activeTab === 'gantt' && <GanttView tasks={tasks} />}
                    {activeTab === 'calendar' && <CalendarView tasks={tasks} />}
                </div>

                <ChatbotWidget projectContext={{
                    title: project.title,
                    description: project.description,
                    tasks: tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority }))
                }} />
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

const KanbanView = ({ tasks, onUpdate }) => {
    const columns = {
        todo: { title: 'To Do', items: tasks.filter(t => t.status === 'todo') },
        doing: { title: 'In Progress', items: tasks.filter(t => t.status === 'doing') },
        done: { title: 'Completed', items: tasks.filter(t => t.status === 'done') }
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        try {
            await api.put(`/tasks/${draggableId}`, { status: destination.droppableId });
            onUpdate();
        } catch (error) {
            console.error('Error updating task status via drag:', error);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-board">
                {Object.entries(columns).map(([id, column]) => (
                    <div key={id} className="kanban-column">
                        <h3 className="column-title">{column.title} <span>{column.items.length}</span></h3>
                        <Droppable droppableId={id}>
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="column-content">
                                    {column.items.map((task, index) => (
                                        <Draggable key={task._id} draggableId={task._id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`kanban-card priority-${task.priority}`}
                                                >
                                                    <p>{task.title}</p>
                                                    <div className="card-footer">
                                                        <span className="priority-dot"></span>
                                                        <span className="card-priority">{task.priority}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
};

const GanttView = ({ tasks }) => {
    if (tasks.length === 0) return <div className="empty-gantt">No tasks with dates to display.</div>;

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
            styles: { progressColor: '#c4a5ff', progressSelectedColor: '#8b5cf6' }
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
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "MMMM yyyy";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const onDateClick = (day) => {
        // Handle date click
    };

    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const prevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, "d");
            const cloneDay = day;
            const dayTasks = tasks.filter(t => 
                t.startDate && isSameDay(new Date(t.startDate), cloneDay)
            );

            days.push(
                <div
                    className={`calendar-cell-mini ${!isSameMonth(day, monthStart) ? "disabled" : isSameDay(day, new Date()) ? "today" : ""}`}
                    key={day}
                >
                    <span className="number">{formattedDate}</span>
                    <div className="day-tasks-mini">
                        {dayTasks.map(t => (
                            <div key={t._id} className={`task-dot priority-${t.priority}`}></div>
                        ))}
                    </div>
                </div>
            );
            day = addMonths(day, 0); // dummy for date-fns but we need to increment day
            // Wait, day = addDays(day, 1) is what I need. But I didn't import addDays.
            // Let's use vanilla JS for incrementing day to avoid re-importing.
            const nextDay = new Date(day);
            nextDay.setDate(nextDay.getDate() + 1);
            day = nextDay;
        }
        rows.push(
            <div className="calendar-row-mini" key={day}>
                {days}
            </div>
        );
        days = [];
    }

    return (
        <div className="calendar-mini-wrap">
            <div className="calendar-mini-header">
                <button onClick={prevMonth}>&lt;</button>
                <span>{format(currentDate, dateFormat)}</span>
                <button onClick={nextMonth}>&gt;</button>
            </div>
            <div className="calendar-mini-body">{rows}</div>
        </div>
    );
};

export default ProjectDetail;
