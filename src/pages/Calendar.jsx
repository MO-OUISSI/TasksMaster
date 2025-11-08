import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Trash2, Edit2, Check } from 'lucide-react';

// Note: For a full implementation, you would create separate components 
// for the modal, task items, etc. This is a simplified, single-file version.

const toDateOnly = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

export default function Calendar() {
    const { updateStorage } = useAppContext();
    const [tasks, setTasks] = useLocalStorage('calendar_tasks', {});
    const [currentDate, setCurrentDate] = useState(toDateOnly(new Date()));
    const [selectedDate, setSelectedDate] = useState(toDateOnly(new Date()));
    const [editingTask, setEditingTask] = useState(null); // { id, text }
    const [taskInput, setTaskInput] = useState('');
    const [colorInput, setColorInput] = useState('#3a6ea5');

    useEffect(() => {
        updateStorage();
    }, [tasks, updateStorage]);

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const text = taskInput.trim();
        if (!text) return;

        const dateKey = selectedDate.toISOString().split('T')[0];
        const newTask = { id: Date.now(), text, color: colorInput, completed: false };
        
        setTasks(prev => ({
            ...prev,
            [dateKey]: [...(prev[dateKey] || []), newTask]
        }));
        setTaskInput('');
    };
    
    const toggleTaskCompletion = (taskId) => {
        const dateKey = selectedDate.toISOString().split('T')[0];
        setTasks(prev => {
            const newTasksForDay = (prev[dateKey] || []).map(task => 
                task.id === taskId ? { ...task, completed: !task.completed } : task
            );
            return { ...prev, [dateKey]: newTasksForDay };
        });
    };

    const handleDeleteTask = (taskId) => {
        const dateKey = selectedDate.toISOString().split('T')[0];
        setTasks(prev => {
            const newTasksForDay = (prev[dateKey] || []).filter(task => task.id !== taskId);
            if (newTasksForDay.length === 0) {
                const newTasks = { ...prev };
                delete newTasks[dateKey];
                return newTasks;
            }
            return { ...prev, [dateKey]: newTasksForDay };
        });
    };

    const handleUpdateTask = (taskId, newText) => {
        if (!newText.trim()) {
            handleDeleteTask(taskId);
            return;
        }
        const dateKey = selectedDate.toISOString().split('T')[0];
        setTasks(prev => {
            const newTasksForDay = (prev[dateKey] || []).map(task => 
                task.id === taskId ? { ...task, text: newText } : task
            );
            return { ...prev, [dateKey]: newTasksForDay };
        });
        setEditingTask(null);
    };

    const getDominantColor = (tasksForDay) => {
        if (!tasksForDay || tasksForDay.length === 0) return null;
        const colorCount = {};
        tasksForDay.forEach(task => {
            const color = task.color || '#3a6ea5';
            colorCount[color] = (colorCount[color] || 0) + 1;
        });
        let dominantColor = null;
        let maxCount = 0;
        for (const color in colorCount) {
            if (colorCount[color] > maxCount) {
                maxCount = colorCount[color];
                dominantColor = color;
            }
        }
        return dominantColor;
    };

    const calendarGrid = useMemo(() => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        // Adjust for Sunday start
        const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday is 0, Sunday is 6

        // Previous month's days
        for (let i = startDay; i > 0; i--) {
            const date = new Date(year, month, 1 - i);
            days.push(<div key={date.toISOString()} className="calendar-day other-month"><div className="day-number">{date.getDate()}</div></div>);
        }

        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = date.toISOString().split('T')[0];
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const tasksForDay = tasks[dateKey] || [];
            const dominantColor = getDominantColor(tasksForDay);

            days.push(
                <div 
                    key={date.toISOString()} 
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => setSelectedDate(toDateOnly(date))}
                >
                    {dominantColor && (
                        <div className="color-background" style={{ backgroundColor: dominantColor }}></div>
                    )}
                    <div className="day-number">{day}</div>
                    {tasksForDay.length > 0 && (
                        <div className="task-count">{tasksForDay.length}</div>
                    )}
                </div>
            );
        }
        
        // Next month's days
        const totalDays = days.length;
        for (let i = 1; i <= 42 - totalDays; i++) {
             const date = new Date(year, month + 1, i);
             days.push(<div key={date.toISOString()} className="calendar-day other-month"><div className="day-number">{date.getDate()}</div></div>);
        }

        return days;
    }, [currentDate, selectedDate, tasks]); // eslint-disable-line react-hooks/exhaustive-deps

    const selectedDateKey = selectedDate.toISOString().split('T')[0];
    const tasksForSelectedDate = tasks[selectedDateKey] || [];

    return (
        <>
            <div className="content" style={{flexDirection: 'row', alignItems: 'flex-start', gap: '30px'}}>
                <div className="calendar-container">
                    <div className="month-header">
                        <button onClick={handlePrevMonth} aria-label="Previous month"><ChevronLeft /></button>
                        <div className="month-title">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                        <button onClick={handleNextMonth} aria-label="Next month"><ChevronRight /></button>
                    </div>
                    <div className="weekdays">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="calendar-grid">
                        {calendarGrid}
                    </div>
                </div>
                <div className="tasks-container">
                    <h2 className="selected-date">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                    <form onSubmit={handleFormSubmit} className="task-form">
                        <input 
                            name="taskInput" 
                            type="text" 
                            className="text-input" 
                            placeholder="Add a new task" 
                            value={taskInput}
                            onChange={(e) => setTaskInput(e.target.value)}
                            required 
                        />
                        <input 
                            name="colorInput" 
                            type="color" 
                            value={colorInput}
                            onChange={(e) => setColorInput(e.target.value)}
                        />
                        <button type="submit" className="btn">Add</button>
                    </form>
                    <div className="task-list">
                        {tasksForSelectedDate.length > 0 ? tasksForSelectedDate.map(task => (
                            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`} style={{borderLeftColor: task.color}}>
                                <div 
                                    className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                                    onClick={() => toggleTaskCompletion(task.id)}
                                >
                                    {task.completed && <Check size={14} />}
                                </div>
                                <div className="task-content">
                                    {editingTask?.id === task.id ? (
                                        <input
                                            type="text"
                                            className="text-input"
                                            value={editingTask.text}
                                            onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                                            onBlur={() => handleUpdateTask(editingTask.id, editingTask.text)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateTask(editingTask.id, editingTask.text)}
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="task-text">{task.text}</span>
                                    )}
                                </div>
                                <div className="task-actions">
                                    <button className="task-action-btn" onClick={() => setEditingTask({ id: task.id, text: task.text })}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="task-action-btn" onClick={() => handleDeleteTask(task.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )) : <p style={{textAlign: 'center', color: 'var(--light-text)', padding: '20px 0'}}>No tasks for this day.</p>}
                    </div>
                    
                </div>
            </div>
        </>
    );
}
