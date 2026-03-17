import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../utils/api";
import "./Calendar.css";

const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // Fetch all tasks for the user (can optimize later)
                const { data: projects } = await api.get('/projects');
                const allTasks = [];
                for (const project of projects) {
                    const { data: projectTasks } = await api.get(`/tasks/project/${project._id}`);
                    allTasks.push(...projectTasks);
                }
                setTasks(allTasks);
            } catch (err) {
                console.error("Error fetching tasks for calendar:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const renderHeader = () => {
        return (
            <div className="calendar-header">
                <div className="header-left">
                    <CalendarIcon size={24} />
                    <h2>{format(currentMonth, "MMMM yyyy")}</h2>
                </div>
                <div className="header-right">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentMonth(new Date())} className="today-btn">Today</button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return (
            <div className="calendar-days-grid">
                {days.map((day) => (
                    <div className="calendar-day-name" key={day}>{day}</div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const tasksOnDay = tasks.filter(task => 
                    (task.startDate && isSameDay(new Date(task.startDate), cloneDay)) ||
                    (task.endDate && isSameDay(new Date(task.endDate), cloneDay))
                );

                days.push(
                    <div
                        className={`calendar-cell ${!isSameMonth(day, monthStart) ? "disabled" : isSameDay(day, new Date()) ? "today" : ""}`}
                        key={day.toString()}
                    >
                        <span className="number">{format(day, dateFormat)}</span>
                        <div className="tasks-container">
                            {tasksOnDay.map(task => (
                                <div key={task._id} className={`calendar-task priority-${task.priority}`}>
                                    {task.title}
                                </div>
                            ))}
                        </div>
                    </div>
                );
                day = new Date(day.getTime() + 24 * 60 * 60 * 1000);
            }
            rows.push(
                <div className="calendar-row" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="calendar-body">{rows}</div>;
    };

    if (loading) return <div className="loading-state">Loading Calendar...</div>;

    return (
        <div className="calendar-page">
            <div className="calendar-container">
                {renderHeader()}
                {renderDays()}
                {renderCells()}
            </div>
        </div>
    );
};

export default Calendar;
