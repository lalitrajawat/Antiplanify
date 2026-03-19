import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../utils/api";
import { format } from "date-fns";
import "./Home.css";

/* ── tiny productivity sparkline data ─────────────── */
const SPARK = [120, 180, 90, 260, 200, 310, 250, 295, 180, 340, 250, 310, 270];

function ProductivityChart({ data }) {
    const W = 300, H = 90;
    const max = Math.max(...data);
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - (v / max) * (H - 10);
        return `${x},${y}`;
    }).join(" ");
    const area = `0,${H} ` + pts + ` ${W},${H}`;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="spark-svg" preserveAspectRatio="none">
            <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={area} fill="url(#sparkGrad)" />
            <polyline points={pts} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    );
}

function DonutChart({ completed, inProgress, notStarted }) {
    const total = completed + inProgress + notStarted || 1;
    const pct = Math.round((completed / total) * 100);
    const r = 44, cx = 56, cy = 56, stroke = 10;
    const circumference = 2 * Math.PI * r;

    const segments = [
        { value: completed,  color: "var(--color-primary)" },
        { value: inProgress, color: "var(--color-accent-orange)" },
        { value: notStarted, color: "var(--border-color)" },
    ];

    let offset = 0;
    const arcs = segments.map(seg => {
        const dash = (seg.value / total) * circumference;
        const arc = { dash, offset, color: seg.color };
        offset += dash;
        return arc;
    });

    return (
        <div className="donut-wrap">
            <svg width="112" height="112" viewBox="0 0 112 112">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-color)" strokeWidth={stroke} />
                {arcs.map((arc, i) => (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={arc.color}
                        strokeWidth={stroke}
                        strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
                        strokeDashoffset={-arc.offset + circumference * 0.25}
                        strokeLinecap="round"
                    />
                ))}
                <text x={cx} y={cy - 6} textAnchor="middle" className="donut-pct">{pct}%</text>
                <text x={cx} y={cy + 10} textAnchor="middle" className="donut-label">Completed</text>
            </svg>
        </div>
    );
}

function HealthGauge({ pct }) {
    const r = 52, cx = 70, cy = 68;
    const circumference = Math.PI * r; // half circle
    const fill = (pct / 100) * circumference;
    const color = pct >= 70 ? "var(--color-accent-green)" : pct >= 40 ? "var(--color-accent-orange)" : "var(--color-accent-red)";
    const label = pct >= 70 ? "Good" : pct >= 40 ? "Risk" : "Delayed";

    return (
        <div className="gauge-wrap">
            <svg width="140" height="82" viewBox="0 0 140 82">
                <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none" stroke="var(--border-color)" strokeWidth="12" strokeLinecap="round"
                />
                <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${fill} ${circumference}`}
                />
                <text x={cx} y={cy - 4} textAnchor="middle" className="gauge-pct">{pct}%</text>
            </svg>
            <span className="gauge-pill" style={{ background: color }}>
                ✓ {label}
            </span>
            <div className="gauge-legend">
                <span><span className="dot" style={{ background: "var(--color-accent-green)" }} />Good</span>
                <span><span className="dot" style={{ background: "var(--color-accent-orange)" }} />Risk</span>
                <span><span className="dot" style={{ background: "var(--color-accent-red)" }} />Delayed</span>
            </div>
        </div>
    );
}

export default function Home() {
    useAuth();
    const [projects, setProjects] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiMsg, setAiMsg] = useState("");
    const [aiReply, setAiReply] = useState("Ask me anything about your projects...");
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [{ data: proj }, { data: tasks }, { data: notifs }] = await Promise.all([
                    api.get("/projects"),
                    api.get("/tasks/today"),
                    api.get("/notifications"),
                ]);
                setProjects(proj);
                setTodayTasks(tasks);
                setNotifications(notifs);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAiSend = async () => {
        if (!aiMsg.trim()) return;
        setAiLoading(true);
        try {
            const { data } = await api.post("/chat", { message: aiMsg });
            setAiReply(data.reply);
            setAiMsg("");
        } catch {
            setAiReply("Error - try again!");
        } finally {
            setAiLoading(false);
        }
    };

    const totalProjects = projects.length;

    const allTasksDone = projects.reduce((sum, p) => sum + (p.taskCount || 0) * ((p.progress || 0) / 100), 0);
    const totalTasks = projects.reduce((sum, p) => sum + (p.taskCount || 0), 0);
    const completedTasks = Math.round(allTasksDone);
    const pendingTasks = totalTasks - completedTasks;
    const overdueTasks = todayTasks.filter(t => t.status !== 'done').length;

    const now = new Date();
    const upcomingDeadlines = projects
        .filter(p => p.endDate && new Date(p.endDate) > now)
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
        .slice(0, 3);

    const avgProgress = projects.length > 0
        ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length)
        : 0;

    const topProjects = [...projects].sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 3);

    const taskCompletion = {
        completed: completedTasks,
        inProgress: todayTasks.filter(t => t.status === 'doing').length,
        notStarted: Math.max(0, pendingTasks - todayTasks.filter(t => t.status === 'doing').length),
    };

    const statCards = [
        { icon: "📁", label: "Total Projects", value: totalProjects, sub: totalProjects, color: "blue", badge: "+15%" },
        { icon: "✅", label: "Completed Tasks", value: completedTasks, sub: completedTasks, color: "green", badge: "+8%" },
        { icon: "🔄", label: "Pending Tasks", value: pendingTasks, sub: pendingTasks, color: "orange", badge: null },
        { icon: "⚠️", label: "Overdue Tasks", value: overdueTasks, sub: overdueTasks, color: "red", badge: null },
        { icon: "📊", label: "Avg Progress", value: `${avgProgress}%`, sub: null, color: "purple", badge: null },
    ];

    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if (loading) return <div className="loading-screen">Loading Dashboard...</div>;

    return (
        <div className="home-root">

            {/* ── STAT CARDS ─────────────────────────────── */}
            <div className="stats-row">
                {statCards.map((s, i) => (
                    <div key={i} className={`stat-card stat-card--${s.color}`}>
                        <div className="stat-top">
                            <span className="stat-icon">{s.icon}</span>
                            {s.badge && <span className="stat-badge">{s.badge}</span>}
                        </div>
                        <p className="stat-label">{s.label}</p>
                        <p className="stat-value">{s.value}</p>
                        {s.sub !== null && (
                            <div className="stat-sub">
                                <span className="stat-sub-val">{s.sub}</span>
                                <span className="stat-arrow">↗</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ── MAIN GRID ──────────────────────────────── */}
            <div className="home-grid">

                {/* Left column */}
                <div className="home-col-left">

                    {/* Task Completion donut */}
                    <div className="panel">
                        <div className="panel-head">
                            <h3>Task Completion</h3>
                            <button className="panel-action">⚙</button>
                        </div>
                        <div className="task-completion-body">
                            <DonutChart
                                completed={taskCompletion.completed}
                                inProgress={taskCompletion.inProgress}
                                notStarted={taskCompletion.notStarted}
                            />
                            <div className="tc-legend">
                                <div className="tc-legend-item">
                                    <span className="dot" style={{ background: "var(--color-primary)" }} />
                                    <span>{taskCompletion.completed}</span>
                                    <span className="tc-legend-label">Completed</span>
                                </div>
                                <div className="tc-legend-item">
                                    <span className="dot" style={{ background: "var(--color-accent-orange)" }} />
                                    <span>{taskCompletion.inProgress}</span>
                                    <span className="tc-legend-label">In Progress</span>
                                </div>
                                <div className="tc-legend-item">
                                    <span className="dot" style={{ background: "var(--border-color)" }} />
                                    <span>{taskCompletion.notStarted}</span>
                                    <span className="tc-legend-label">Not Started</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Productivity chart */}
                    <div className="panel">
                        <div className="panel-head">
                            <h3>Productivity</h3>
                            <span className="panel-trend">↗</span>
                        </div>
                        <div className="productivity-body">
                            <ProductivityChart data={SPARK} />
                            <div className="productivity-days">
                                {DAYS.map(d => (
                                    <span key={d}>{d}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Gantt / Timeline */}
                    <div className="panel panel-timeline">
                        <div className="panel-head">
                            <h3>Timeline</h3>
                            <div className="panel-head-actions">
                                <button className="tl-nav">‹</button>
                                <button className="tl-nav">›</button>
                                <button className="tl-nav">⇥</button>
                            </div>
                        </div>
                        <div className="timeline-table">
                            <div className="tl-header">
                                <span>Task name</span>
                                <span>%</span>
                                {DAYS.map(d => <span key={d}>{d}</span>)}
                            </div>
                            {topProjects.map((p, i) => {
                                const pct = p.progress || 0;
                                const barW = `${pct}%`;
                                return (
                                    <div className="tl-row" key={p._id}>
                                        <span className="tl-task-name">{p.title}</span>
                                        <span className="tl-pct">{pct}%</span>
                                        <div className="tl-bar-area">
                                            <div className="tl-bar" style={{ width: barW, marginLeft: `${i * 8}%` }}>
                                                <span>{format(new Date(p.endDate || new Date()), "MMM d")}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {topProjects.length === 0 && (
                                <p className="tl-empty">No projects yet</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Middle column */}
                <div className="home-col-mid">

                    {/* Project Progress */}
                    <div className="panel">
                        <div className="panel-head">
                            <h3>Project Progress</h3>
                            <button className="panel-action">···</button>
                        </div>
                        <div className="pp-list">
                            {topProjects.length === 0 && <p className="tc-empty">No projects yet</p>}
                            {topProjects.map(p => (
                                <div key={p._id} className="pp-item">
                                    <div className="pp-meta">
                                        <span className="pp-dot" />
                                        <span className="pp-name">{p.title}</span>
                                        <span className="pp-pct">{p.progress || 0}%</span>
                                    </div>
                                    <div className="pp-bar-bg">
                                        <div
                                            className="pp-bar-fill"
                                            style={{ width: `${p.progress || 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline mini */}
                    <div className="panel">
                        <div className="panel-head">
                            <h3>Timeline</h3>
                        </div>
                        <div className="tl-mini">
                            {topProjects.map((p, i) => (
                                <div key={p._id} className="tl-mini-row">
                                    <span className="tl-mini-name">{p.title}</span>
                                    <div className="tl-mini-bar-bg">
                                        <div
                                            className="tl-mini-bar"
                                            style={{
                                                width: `${p.progress || 0}%`,
                                                background: i === 0 ? "var(--color-accent-green)" :
                                                           i === 1 ? "var(--color-accent-orange)" :
                                                           "var(--color-primary)"
                                            }}
                                        />
                                    </div>
                                    <span className="tl-mini-pct">
                                        {p.endDate ? format(new Date(p.endDate), "MMM d") : "—"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right column */}
                <div className="home-col-right">

                    {/* Upcoming Deadlines */}
                    <div className="panel">
                        <div className="panel-head">
                            <h3>Upcoming Deadlines</h3>
                        </div>
                        <div className="deadlines-list">
                            {upcomingDeadlines.length === 0 && <p className="tc-empty">No upcoming deadlines</p>}
                            {upcomingDeadlines.map(p => (
                                <div key={p._id} className="deadline-item">
                                    <span className="deadline-name">{p.title}</span>
                                    <span className="deadline-date">
                                        {format(new Date(p.endDate), "MMM d")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Project Health */}
                    <div className="panel">
                        <div className="panel-head">
                            <h3>Project Health</h3>
                        </div>
                        <HealthGauge pct={avgProgress} />
                    </div>

                    {/* AI Assistant */}
                    <div className="panel panel-ai">
                        <div className="panel-head">
                            <h3>AI Project Assistant</h3>
                        </div>
                        <div className="ai-body">
                            {notifications.slice(0, 2).length > 0 && (
                                <div className="ai-suggestions">
                                    <p className="ai-suggestion-title">Suggestions:</p>
                                    {notifications.slice(0, 2).map(n => (
                                        <div key={n._id} className="ai-suggestion-item">
                                            • {n.message}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {notifications.length === 0 && (
                                <p className="ai-reply-text">{aiReply}</p>
                            )}
                        </div>
                        <div className="ai-input-row">
                            <input
                                className="ai-input"
                                placeholder="Ask me anything..."
                                value={aiMsg}
                                onChange={e => setAiMsg(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                            />
                            <button
                                className="ai-send-btn"
                                onClick={handleAiSend}
                                disabled={aiLoading}
                            >
                                ➤
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
