import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Folder, ListChecks, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [projects] = useLocalStorage('todolist_projects_v5', {});

    const projectList = Object.values(projects);
    const totalProjects = projectList.length;

    const taskCounts = projectList.reduce((acc, project) => {
        acc.new += project.boards.new.length;
        acc.inProgress += project.boards.inProgress.length;
        acc.completed += project.boards.completed.length;
        return acc;
    }, { new: 0, inProgress: 0, completed: 0 });

    const totalTasks = taskCounts.new + taskCounts.inProgress + taskCounts.completed;
    const overallCompletion = totalTasks > 0 ? (taskCounts.completed / totalTasks) * 100 : 0;

    const today = new Date();
    const overdueProjects = projectList.filter(p => {
        if (!p.finishDate) return false;
        const finishDate = new Date(p.finishDate);
        const total = Object.values(p.boards).reduce((sum, board) => sum + board.length, 0);
        const completed = p.boards.completed.length;
        const progress = total > 0 ? (completed / total) * 100 : 0;
        return finishDate < today && progress < 100;
    });

    const StatCard = ({ icon, label, value, color, extra }) => (
        <div className="stat-card section">
            <div className="stat-icon" style={{ backgroundColor: color }}>
                {icon}
            </div>
            <div className="stat-info">
                <p className="stat-value">{value}</p>
                <p className="stat-label">{label}</p>
                {extra && <p className="stat-extra">{extra}</p>}
            </div>
        </div>
    );

    const taskDistribution = [
        { label: 'New', value: taskCounts.new, color: '#3b82f6' },
        { label: 'In Progress', value: taskCounts.inProgress, color: '#f97316' },
        { label: 'Completed', value: taskCounts.completed, color: '#22c55e' },
    ];

    return (
        <>
            <div className="content-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back! Here's a summary of your projects.</p>
            </div>
            <div className="content">
                <div className="stats-grid">
                    <StatCard icon={<Folder size={24} />} label="Total Projects" value={totalProjects} color="#3b82f6" />
                    <StatCard icon={<ListChecks size={24} />} label="Total Tasks" value={totalTasks} color="#8b5cf6" />
                    <StatCard icon={<CheckCircle size={24} />} label="Completed Tasks" value={taskCounts.completed} color="#22c55e" />
                    <StatCard icon={<Clock size={24} />} label="In Progress" value={taskCounts.inProgress} color="#f97316" />
                </div>

                <div className="dashboard-columns">
                    <div className="section">
                        <h3><TrendingUp size={20} className="section-header-icon" />Task Distribution</h3>
                        {totalTasks > 0 ? (
                            <div className="chart-container">
                                {taskDistribution.map(item => (
                                    <div key={item.label} className="chart-bar-wrapper">
                                        <div className="chart-bar" style={{ height: `${(item.value / totalTasks) * 100}%`, backgroundColor: item.color }}>
                                            <span className="chart-bar-value">{item.value}</span>
                                        </div>
                                        <p className="chart-bar-label">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-state-text">No tasks yet to show distribution.</p>
                        )}
                    </div>

                    <div className="section">
                        <h3><AlertTriangle size={20} className="section-header-icon" style={{ color: 'var(--danger-color)' }} />Overdue Projects</h3>
                        {overdueProjects.length > 0 ? (
                            <ul className="overdue-list">
                                {overdueProjects.map(p => (
                                    <li key={p.id}>
                                        <Link to="/todolist" className="overdue-link">
                                            <strong>{p.name}</strong>
                                            <span>Finish Date: {new Date(p.finishDate).toLocaleDateString()}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-state-text">No overdue projects. Great job!</p>
                        )}
                    </div>
                </div>

                {totalProjects === 0 && (
                    <div className="section empty-state">
                        <h3>Welcome!</h3>
                        <p>You don't have any projects yet. Get started by creating one.</p>
                        <Link to="/todolist" className="btn" style={{ marginTop: '16px' }}>Create a Project</Link>
                    </div>
                )}
            </div>
        </>
    );
}