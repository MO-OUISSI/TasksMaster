import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus } from 'lucide-react';

// --- Constants ---
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOUR_HEIGHT = 60;
const TASK_COLORS = [
    '#3a6ea5', '#5eb6c2ff', '#be8947', '#c24d4d', '#684675', '#b64b89', '#296954'
];

// --- Task Edit Modal ---
const TaskEditModal = ({ task, day, onUpdate, onDelete, onClose }) => {
    const [text, setText] = useState(task.text);
    const [color, setColor] = useState(task.color);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]); 

    const handleSave = () => {
        onUpdate(day, { ...task, text, color });
        onClose();
    };

    const handleDelete = () => {
        onDelete(day, task.id);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Edit Task</h3>
                <textarea
                    className="modal-textarea"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    autoFocus
                />
                <div className="modal-color-palette">
                    {TASK_COLORS.map(color => (
                        <div
                            key={color}
                            className={`modal-color-dot ${color === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setColor(color)}
                        />
                    ))}
                </div>
                <div className="modal-actions">
                    <button className="btn danger" onClick={handleDelete}>Delete</button>
                    <button className="btn" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

// --- Add Task Modal ---
const AddTaskModal = ({ onAddTask, onClose }) => {
    const { primaryColor } = useAppContext();
    const [text, setText] = useState('');
    const [day, setDay] = useState(DAYS[0]);
    const [start, setStart] = useState(9); // Default to 9 AM
    const [duration, setDuration] = useState(1);
    const [color, setColor] = useState(primaryColor || TASK_COLORS[0]);

    const handleAddTask = () => {
        if (!text.trim()) {
            alert('Please enter a task description.');
            return;
        }
        onAddTask({
            id: Date.now(),
            text,
            day,
            start,
            duration,
            color,
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Add New Task</h3>
                <textarea
                    className="modal-textarea"
                    placeholder="Task description..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    autoFocus
                />
                <div className="modal-form-grid">
                    <label>Day</label>
                    <select className="text-input" value={day} onChange={(e) => setDay(e.target.value)}>
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <label>Start Time</label>
                    <select className="text-input" value={start} onChange={(e) => setStart(Number(e.target.value))}>
                        {HOURS.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                    <label>Duration (hours)</label>
                    <input type="number" className="text-input" min="1" max="24" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                </div>
                <div className="modal-color-palette">
                    {TASK_COLORS.map(c => (
                        <div
                            key={c}
                            className={`modal-color-dot ${color === c ? 'selected' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>
                <div className="modal-actions">
                    <button className="btn" onClick={handleAddTask}>Add Task</button>
                </div>
            </div>
        </div>
    );
};

// --- Current Time Indicator ---
const TimeIndicator = () => {
    const [top, setTop] = useState(0);

    useEffect(() => {
        const updatePosition = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const totalMinutes = hours * 60 + minutes;
            const percentageOfDay = totalMinutes / (24 * 60);
            setTop(percentageOfDay * (24 * HOUR_HEIGHT));
        };

        updatePosition();
        const interval = setInterval(updatePosition, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return <div className="time-indicator" style={{ top: `${top}px` }} />;
};

// --- Main Weekly View Component ---
export default function WeeklyView() {
    const { primaryColor } = useAppContext();
    const [tasks, setTasks] = useState(() => {
        try {
            const savedTasks = localStorage.getItem('weeklyTasks');
            return savedTasks ? JSON.parse(savedTasks) : {};
        } catch (error) {
            console.error("Failed to parse weekly tasks from localStorage", error);
            return {};
        }
    });
    const [editingTask, setEditingTask] = useState(null); // { day, task }
    const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);

    const gridRef = useRef(null);
    const containerRef = useRef(null);
    const dragInfo = useRef(null);

    useEffect(() => {
        localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
    }, [tasks]);

    // Scroll to current time on initial load
    useEffect(() => {
        const now = new Date();
        const currentHour = now.getHours();
        if (containerRef.current) {
            const scrollTo = Math.max(0, (currentHour - 1) * HOUR_HEIGHT);
            containerRef.current.scrollTop = scrollTo;
        }
    }, []);

    const handleAddTask = (taskData) => {
        const { day, ...newTask } = taskData;
        setTasks(prev => ({
            ...prev,
            [day]: [...(prev[day] || []), newTask]
        }));
    };
    const handleUpdateTask = useCallback((day, updatedTask) => {
        setTasks(prev => ({
            ...prev,
            [day]: prev[day].map(t => (t.id === updatedTask.id ? updatedTask : t))
        }));
    }, []);

    const handleDeleteTask = useCallback((day, taskId) => {
        setTasks(prev => ({
            ...prev,
            [day]: prev[day].filter(t => t.id !== taskId)
        }));
    }, []);

    const handleMouseDown = (e, day, task) => {
        // Prevent drag from starting when clicking to open modal
        if (e.target.closest('.task-text-content')) return;

        if (e.target.classList.contains('resizer')) {
            dragInfo.current = { type: 'resize', day, task, startY: e.clientY, startDuration: task.duration };
        } else if (e.target.closest('.task-wrapper')) {
            dragInfo.current = { type: 'move', day, task, startY: e.clientY, startTop: task.start };
        }
    };

    const handleMouseMove = useCallback((e) => {
        if (!dragInfo.current || !gridRef.current) return;

        const { type, day, task, startY, startTop, startDuration } = dragInfo.current;
        const dy = e.clientY - startY;
        const hourDelta = Math.round(dy / HOUR_HEIGHT);

        if (type === 'move') {
            const newStart = Math.max(0, Math.min(24 - task.duration, startTop + hourDelta));
            if (newStart !== task.start) {
                dragInfo.current.task.start = newStart;
                handleUpdateTask(day, { ...task, start: newStart });
            }
        } else if (type === 'resize') {
            const newDuration = Math.max(1, Math.min(24 - task.start, startDuration + hourDelta));
            if (newDuration !== task.duration) {
                dragInfo.current.task.duration = newDuration;
                handleUpdateTask(day, { ...task, duration: newDuration });
            }
        }
    }, [handleUpdateTask]);

    const handleMouseUp = useCallback(() => {
        // Prevent modal from opening after a drag
        if (dragInfo.current) {
            setTimeout(() => { dragInfo.current = null; }, 0);
        }
    }, []);

    const handleTaskClick = (e, day, task) => {
        if (dragInfo.current) return;
        e.stopPropagation();
        setEditingTask({ day, task });
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const handleCloseModal = () => {
        setEditingTask(null);
        dragInfo.current = null;
    };

    return (
        <>
            <div className="content" ref={containerRef} style={{ overflow: 'auto', height: 'calc(100vh - 160px)' }}>
                <div className="weekly-view-container" ref={gridRef}>
                    <div className="time-column">
                        <div className="day-header placeholder"></div>
                        {HOURS.map(hour => (
                            <div key={hour} className="hour-label" style={{ height: HOUR_HEIGHT, position: 'relative' }}>
                                <span>{hour}</span>
                            </div>
                        ))}
                    </div>
                    <div className="days-container">
                        {DAYS.map(day => (
                            <div key={day} className="day-column">
                                <div className="day-header">{day}</div>
                                <div className="hour-slots">
                                    {HOURS.map((_, index) => (
                                        <div
                                            key={index}
                                            className="hour-slot"
                                            style={{ height: HOUR_HEIGHT }}
                                        ></div>
                                    ))}
                                    <TimeIndicator />
                                </div>
                                <div className="tasks-container-week">
                                    {(tasks[day] || []).map(task => (
                                        <div
                                            key={task.id}
                                            className="task-wrapper"
                                            style={{
                                                top: `${task.start * HOUR_HEIGHT}px`,
                                                height: `${task.duration * HOUR_HEIGHT}px`,
                                            }}
                                            onMouseDown={(e) => handleMouseDown(e, day, task)}
                                        >
                                            <div
                                                className="task"
                                                style={{ backgroundColor: task.color }}
                                                onClick={(e) => handleTaskClick(e, day, task)}
                                            >
                                                <div className="task-text-content">{task.text}</div>
                                                <div className="resizer"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {editingTask && (
                <TaskEditModal
                    day={editingTask.day}
                    task={editingTask.task}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    onClose={handleCloseModal}
                />
            )}
            {isAddTaskModalOpen && (
                <AddTaskModal onAddTask={handleAddTask} onClose={() => setAddTaskModalOpen(false)} />
            )}
            <button className="fab" onClick={() => setAddTaskModalOpen(true)} aria-label="Add new task">
                <Plus size={24} />
            </button>
        </>
    );
}
