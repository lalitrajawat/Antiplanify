import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, addDays } from 'date-fns';
import { Gantt, ViewMode } from 'gantt-task-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { LayoutDashboard, Calendar as CalendarIcon, List, BarChart2, CheckCircle as CheckCircleIcon, Plus, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
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

    if (loading) return (
        <div className="loading-container">
            <div className="loader"></div>
            <p>Gathering project insights...</p>
        </div>
    );

    if (!project) return (
        <div className="error-container">
            <h3>Project not found</h3>
            <p>The project you're looking for might have been moved or deleted.</p>
        </div>
    );

    return (
        <div className="project-detail-container">
            {/* Sidebar */}
            <div className="project-sidebar">
                <div className="sidebar-header">
                    <h1 className="project-title">{project.title}</h1>
                    <div className="project-status-badge">active</div>
                </div>
                <p className="project-desc">{project.description}</p>

                <div className="sidebar-section">
                    <h3 className="sidebar-section-title">Tech Stack</h3>
                    <div className="tech-stack">
                        {project.techStack?.map((tech, i) => (
                            <span key={i} className="tech-badge">{tech}</span>
                        )) || <span className="text-muted">No tech stack defined</span>}
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3 className="sidebar-section-title">Timeline</h3>
                    <div className="timeline-info">
                        <div className="timeline-row">
                            <span className="label">Start</span>
                            <span className="value">{project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'Not set'}</span>
                        </div>
                        <div className="timeline-row">
                            <span className="label">End</span>
                            <span className="value">{project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : 'Not set'}</span>
                        </div>
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3 className="sidebar-section-title">Progress</h3>
                    <div className="project-progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length * 100) : 0}%` }}
                        ></div>
                    </div>
                    <p className="progress-text">
                        {tasks.filter(t => t.status === 'done').length} / {tasks.length} tasks completed
                    </p>
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
                            <List size={18} />
                            <span>Tasks</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('kanban')}
                            className={`tab-button ${activeTab === 'kanban' ? 'active' : ''}`}
                        >
                            <LayoutDashboard size={18} />
                            <span>Kanban</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('gantt')}
                            className={`tab-button ${activeTab === 'gantt' ? 'active' : ''}`}
                        >
                            <BarChart2 size={18} />
                            <span>Gantt Chart</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
                        >
                            <CalendarIcon size={18} />
                            <span>Calendar</span>
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
                startDate: new Date(),
                endDate: addDays(new Date(), 1)
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
                    placeholder="Capture a new idea or task..."
                    className="task-input"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <button type="submit" className="btn-add-task">
                    <Plus size={18} />
                    <span>Add Task</span>
                </button>
            </form>

            <div className="tasks-list">
                {tasks.length === 0 ? (
                    <div className="empty-state">
                        <Zap size={40} className="empty-icon" />
                        <h3>Your task list is clean!</h3>
                        <p>Start by adding your first task above.</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task._id} className="task-item group">
                            <div className="task-left">
                                <button
                                    onClick={() => handleStatusChange(task._id, task.status)}
                                    className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                                >
                                    {task.status === 'done' && <CheckCircleIcon size={14} className="text-white" />}
                                </button>
                                <div className="task-info">
                                    <span className={`task-title ${task.status === 'done' ? 'completed' : ''}`}>{task.title}</span>
                                    {task.endDate && (
                                        <span className="task-due-date">Due {format(new Date(task.endDate), 'MMM d')}</span>
                                    )}
                                </div>
                            </div>
                            <div className="task-right">
                                <span className={`priority-badge ${task.priority}`}>
                                    {task.priority}
                                </span>
                            </div>
                        </div>
                    ))
                )}
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
                        <div className="column-header">
                            <h3 className="column-title">{column.title}</h3>
                            <span className="column-count">{column.items.length}</span>
                        </div>
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
                                                        <div className={`priority-tag ${task.priority}`}>
                                                            <span className="dot"></span>
                                                            {task.priority}
                                                        </div>
                                                        {task.endDate && (
                                                            <span className="due-date">{format(new Date(task.endDate), 'MMM d')}</span>
                                                        )}
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
    const [viewMode, setViewMode] = useState(ViewMode.Week);
    const [columnWidth, setColumnWidth] = useState(100);

    const getTaskProgress = (task) => {
        switch (task.status) {
            case 'done': return 100;
            case 'doing': return 50;
            default: return 0;
        }
    };

    const getTaskColor = (task) => {
        switch (task.priority) {
            case 'high': return { progressColor: '#ef4444', progressSelectedColor: '#dc2626', barColor: 'rgba(239, 68, 68, 0.2)' };
            case 'medium': return { progressColor: '#f59e0b', progressSelectedColor: '#d97706', barColor: 'rgba(245, 158, 11, 0.2)' };
            case 'low': return { progressColor: '#10b981', progressSelectedColor: '#059669', barColor: 'rgba(16, 185, 129, 0.2)' };
            default: return { progressColor: '#8b5cf6', progressSelectedColor: '#7c3aed', barColor: 'rgba(139, 92, 246, 0.2)' };
        }
    };

    const ganttTasks = tasks
        .filter(t => t.startDate && t.endDate)
        .map(t => ({
            start: new Date(t.startDate),
            end: new Date(t.endDate),
            name: t.title,
            id: t._id,
            type: 'task',
            progress: getTaskProgress(t),
            isDisabled: false,
            styles: getTaskColor(t),
            dependencies: t.dependencies || [],
            fontSize: '12px',
            project: 'Project'
        }));

    if (ganttTasks.length === 0) {
        return (
            <div className="empty-state-gantt">
                <BarChart2 size={60} className="empty-icon" />
                <h3>No Timeline Data</h3>
                <p>Add start and end dates to your tasks to visualize them here.</p>
            </div>
        );
    }

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        switch (mode) {
            case ViewMode.Day: setColumnWidth(60); break;
            case ViewMode.Week: setColumnWidth(100); break;
            case ViewMode.Month: setColumnWidth(150); break;
            case ViewMode.Quarter: setColumnWidth(200); break;
        }
    };

    return (
        <div className="gantt-wrapper">
            <div className="gantt-header-controls">
                <div className="view-mode-selector">
                    {Object.values(ViewMode).filter(v => ['Day', 'Week', 'Month', 'Quarter'].includes(v)).map(mode => (
                        <button
                            key={mode}
                            className={`mode-btn ${viewMode === mode ? 'active' : ''}`}
                            onClick={() => handleViewModeChange(mode)}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
                <div className="gantt-summary">
                    <span>{ganttTasks.length} tasks scheduled</span>
                </div>
            </div>

            <div className="gantt-chart-container">
                <Gantt
                    tasks={ganttTasks}
                    viewMode={viewMode}
                    columnWidth={columnWidth}
                    listCellWidth="280px"
                    headerHeight={60}
                    rowHeight={50}
                    barCornerRadius={8}
                    handleSize={8}
                />
            </div>

            <div className="gantt-footer">
                <div className="legend">
                    <div className="legend-item"><span className="dot high"></span> High</div>
                    <div className="legend-item"><span className="dot medium"></span> Medium</div>
                    <div className="legend-item"><span className="dot low"></span> Low</div>
                </div>
            </div>
        </div>
    );
};

const CalendarView = ({ tasks }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = calendarStart;

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    while (day <= calendarEnd) {
        for (let i = 0; i < 7; i++) {
            const cloneDay = day;
            const dayTasks = tasks.filter(t => 
                t.startDate && isSameDay(new Date(t.startDate), cloneDay)
            );

            days.push(
                <div
                    className={`calendar-day ${!isSameMonth(day, monthStart) ? "outside" : ""} ${isSameDay(day, new Date()) ? "today" : ""}`}
                    key={day.toString()}
                >
                    <span className="day-number">{format(day, "d")}</span>
                    <div className="day-tasks">
                        {dayTasks.map(t => (
                            <div key={t._id} className={`task-indicator priority-${t.priority}`} title={t.title}></div>
                        ))}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className="calendar-week" key={day.toString()}>
                {days}
            </div>
        );
        days = [];
    }

    return (
        <div className="calendar-custom-container">
            <div className="calendar-header">
                <button className="nav-btn" onClick={prevMonth}><ChevronLeft size={20} /></button>
                <h2>{format(currentDate, "MMMM yyyy")}</h2>
                <button className="nav-btn" onClick={nextMonth}><ChevronRight size={20} /></button>
            </div>
            <div className="calendar-grid">
                <div className="weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="calendar-body">{rows}</div>
            </div>
        </div>
    );
};

export default ProjectDetail;
