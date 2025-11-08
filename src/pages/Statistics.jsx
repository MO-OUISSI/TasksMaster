import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Folder, ListChecks, Circle, CircleDot, CircleCheck, AlertTriangle } from 'lucide-react';

export default function Statistics() {
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

    const today = new Date();
    const overdueProjects = projectList.filter(p => {
        if (!p.finishDate) return false;
        const finishDate = new Date(p.finishDate);
        // An overdue project's finish date is in the past, and it's not 100% complete.
        const total = Object.values(p.boards).reduce((sum, board) => sum + board.length, 0);
        const completed = p.boards.completed.length;
        const progress = total > 0 ? (completed / total) * 100 : 0;
        return finishDate < today && progress < 100;
    });

    const StatCard = ({ icon, label, value, color }) => (
        <div className="stat-card section">
            <div className="stat-icon" style={{ backgroundColor: color }}>
                {icon}
            </div>
            <div className="stat-info">
                <p className="stat-value">{value}</p>
                <p className="stat-label">{label}</p>
            </div>
        </div>
    );

    return (
        <>
            <div className="content">
                <div className="stats-grid">
                    <StatCard icon={<Folder size={24} />} label="Total Projects" value={totalProjects} color="#3b82f6" />
                    <StatCard icon={<ListChecks size={24} />} label="Total Tasks" value={totalTasks} color="#8b5cf6" />
                </div>

                <div className="section">
                    <h3>Task Breakdown</h3>
                    <div className="task-breakdown-grid">
                        <StatCard icon={<Circle size={24} />} label="New Tasks" value={taskCounts.new} color="#3b82f6" />
                        <StatCard icon={<CircleDot size={24} />} label="In Progress" value={taskCounts.inProgress} color="#f97316" />
                        <StatCard icon={<CircleCheck size={24} />} label="Completed" value={taskCounts.completed} color="#22c55e" />
                    </div>
                </div>

                {overdueProjects.length > 0 && (
                    <div className="section">
                        <h3><AlertTriangle size={20} style={{ verticalAlign: 'bottom', marginRight: '8px', color: 'var(--danger-color)' }} />Overdue Projects</h3>
                        <ul className="overdue-list">
                            {overdueProjects.map(p => (
                                <li key={p.id}>
                                    <strong>{p.name}</strong>
                                    <span> - Finish Date: {new Date(p.finishDate).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {totalProjects === 0 && (
                    <div className="section empty-state">
                        <p>No project data available yet. Create some projects and tasks to see your statistics!</p>
                    </div>
                )}
            </div>
        </>
    );
}