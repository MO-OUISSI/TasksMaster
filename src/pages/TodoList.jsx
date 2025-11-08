import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';
import { Edit, Trash2, Plus, ArrowLeft, Check, Search } from 'lucide-react';

export default function TodoList() {
    const { updateStorage, theme } = useAppContext();
    const location = useLocation();
    // Restore state for multiple projects
    const [projects, setProjects] = useLocalStorage('todolist_projects_v5', {});
    const [currentProjectId, setCurrentProjectId] = useState(location.state?.projectId || null);
    
    // State for project modal (create/edit)
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null); // null for create, project object for edit
    const [projectName, setProjectName] = useState('');
    const [projectIdea, setProjectIdea] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt_desc');

    const handleCreateProject = (e) => {
        e.preventDefault();
        if (!projectName.trim()) return;
        const id = Date.now().toString();

        if (editingProject) {
            // Update existing project
            const updatedProjects = { ...projects };
            updatedProjects[editingProject.id].name = projectName;
            updatedProjects[editingProject.id].idea = projectIdea;
            setProjects(updatedProjects);
        } else {
            // Create new project
            const newProject = {
                id,
                name: projectName,
                createdAt: new Date().toISOString(),
                idea: projectIdea,
                boards: { new: [], inProgress: [], completed: [] }
            };
            setProjects(prev => ({ ...prev, [id]: newProject }));
        }
        
        handleCloseProjectModal();
    };

    const handleDeleteProject = (e, projectId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project?')) {
            const newProjects = { ...projects };
            delete newProjects[projectId];
            setProjects(newProjects);
            if (currentProjectId === projectId) {
                setCurrentProjectId(null);
            }
            updateStorage();
        }
    };

    const handleEditProjectName = (e, projectId, currentName) => {
        e.stopPropagation(); // Prevent the card's onClick from firing
        const projectToEdit = projects[projectId];
        handleOpenProjectModal(projectToEdit);
    };

    const handleOpenProjectModal = (project = null) => {
        setEditingProject(project);
        if (project) {
            setProjectName(project.name);
            setProjectIdea(project.idea || '');
        }
        setIsProjectModalOpen(true);
    };

    const handleCloseProjectModal = () => {
        setIsProjectModalOpen(false);
        setEditingProject(null);
        setProjectName('');
        setProjectIdea('');
    };

    const handleDeleteTask = (boardName, taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        const updatedProjects = { ...projects };
        const project = updatedProjects[currentProjectId];
        project.boards[boardName] = project.boards[boardName].filter(t => t.id !== taskId);
        setProjects(updatedProjects);
        updateStorage();
    };

    const handleEditTask = (boardName, taskId, currentText) => {
        const newText = prompt('Enter new task text:', currentText);
        if (newText && newText.trim() !== '') {
            const updatedProjects = { ...projects };
            const project = updatedProjects[currentProjectId];
            const task = project.boards[boardName].find(t => t.id === taskId);
            if (task) {
                task.text = newText.trim();
                setProjects(updatedProjects);
                updateStorage();
            }
        }
    };

    const handleChangeTaskStatus = (taskId, newStatus) => {
        const updatedProjects = { ...projects };
        const project = updatedProjects[currentProjectId];
        let taskToMove;
        let sourceBoardName;

        // Find the task and its source board
        for (const boardName in project.boards) {
            const taskIndex = project.boards[boardName].findIndex(t => t.id === taskId);
            if (taskIndex > -1) {
                taskToMove = project.boards[boardName][taskIndex];
                sourceBoardName = boardName;
                break;
            }
        }

        if (taskToMove && sourceBoardName !== newStatus) {
            // Remove task from the source board
            project.boards[sourceBoardName] = project.boards[sourceBoardName].filter(t => t.id !== taskId);
            // Add task to the new board
            project.boards[newStatus].push(taskToMove);

            setProjects(updatedProjects);
            updateStorage();
        }
    };

    const currentProject = currentProjectId ? projects[currentProjectId] : null;

    // State for the project idea and add task modal
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [modalTaskText, setModalTaskText] = useState('');

    const handleOpenAddTaskModal = () => {
        setModalTaskText('');
        setIsAddTaskModalOpen(true);
    };

    const handleModalAddTask = (e) => {
        e.preventDefault();
        if (!modalTaskText.trim() || !currentProjectId) return;

        const newTask = {
            id: Date.now().toString(),
            text: modalTaskText
        };
        const updatedProjects = { ...projects };
        updatedProjects[currentProjectId].boards.new.push(newTask);
        setProjects(updatedProjects);

        updateStorage();
        setModalTaskText('');
        setIsAddTaskModalOpen(false);
    };

    // Main project view with task table
    if (currentProject) {
        const totalTasks = Object.values(currentProject.boards).reduce((acc, board) => acc + board.length, 0);
        const completedTasks = currentProject.boards.completed.length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const startDate = new Date(currentProject.createdAt);
        return (
            <>
                <div className="content-header project-list-header">
                    
                        <div className="project-controls">
                        <button className="btn secondary" onClick={() => setCurrentProjectId(null)}>
                            <ArrowLeft size={16} /> Back to Projects
                        </button>
                        <h1 className="page-title">{currentProject.name}</h1>
                        </div> 
                        <div className="project-controls">
                            <button className="btn secondary" onClick={(e) => handleOpenProjectModal(currentProject)}><Edit size={16} /> Edit Project</button>
                            <button className="btn danger-outline" onClick={(e) => handleDeleteProject(e, currentProjectId)}><Trash2 size={16} /> Delete Project</button>
                        </div>
                   
                </div>
                
                <div className="content">
                    
                    <div className="section timeline-section">
                        <div className="timeline-header">
                            <h4>Project Completion</h4>
                            <p>{completedTasks} of {totalTasks} tasks completed</p>
                        </div>
                        <div className="timeline-container">
                            <div
                                className="timeline-bar"
                                style={{ width: `${progress}%`, backgroundColor: 'var(--success-color)' }}
                            ></div>
                        </div>
                        <p className="progress-text">{Math.round(progress)}% complete</p>
                    </div>
                    <div className="boards">
                        {[{
                            id: 'new', title: 'New', 
                            colors: { light: {backgroundColor: '#d4cdff', color: '#2d1c8c'}, dark: {backgroundColor: '#28233f', color: '#a799ff'} }
                        }, {
                            id: 'inProgress', title: 'In Progress', 
                            colors: { light: {backgroundColor: '#faecd2', color: '#c66800'}, dark: {backgroundColor: '#3d2d1b', color: '#ffb74d'} }
                        }, {
                            id: 'completed', title: 'Completed', 
                            colors: { light: {backgroundColor: '#c3f8e6', color: '#369253'}, dark: {backgroundColor: '#1d4638ff', color: '#4afc82ff'} }
                        }].map(board => (
                            <div 
                                key={board.id} 
                                className="board section" 
                                onDragOver={(e) => e.preventDefault()} 
                                onDrop={(e) => {
                                    const taskId = e.dataTransfer.getData("taskId");
                                    handleChangeTaskStatus(taskId, board.id);
                                }}
                                style={{
                                    backgroundColor: theme === 'dark' ? board.colors.dark.backgroundColor : board.colors.light.backgroundColor
                                }}
                            >
                                <h3
                                style={{
                                    color: theme === 'dark' ? board.colors.dark.color : board.colors.light.color
                                }}
                                >{board.title}</h3>
                                <div className="task-list">
                                    {currentProject.boards[board.id].map(task => (
                                        <div 
                                            key={task.id} 
                                            className="task-item" 
                                            id='task-item-projects'
                                            draggable 
                                            onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                                            style={{ cursor: 'grab' }}
                                        >
                                            <span className="task-text">{task.text}</span>
                                            <div className="task-actions">
                                                <button
                                                    className="task-action-btn"
                                                    onClick={() => handleEditTask(board.id, task.id, task.text)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="task-action-btn"
                                                    onClick={() => handleDeleteTask(board.id, task.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
                {!isProjectModalOpen && (
                <button className="fab" onClick={handleOpenAddTaskModal}>
                    <Plus size={24} />
                </button>
                    )}
                {isAddTaskModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsAddTaskModalOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add New Task</h2>
                            </div>
                            <form onSubmit={handleModalAddTask} className="modal-form">
                                <div className="form-group">
                                    <label htmlFor="task-text">Task</label>
                                    <textarea id="task-text" className="text-input1" value={modalTaskText} onChange={(e) => setModalTaskText(e.target.value)} placeholder="Task description..." required rows="3"></textarea>
                                </div>
                                <button type="submit" className="btn">
                                    <Plus size={16} /> Add Task
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {isProjectModalOpen && (
                    <div className="modal-overlay" onClick={handleCloseProjectModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
                            </div>
                            <form onSubmit={handleCreateProject} className="modal-form">
                                <div className="form-group">
                                    <label htmlFor="project-name">Project Name</label>
                                    <input 
                                        id="project-name" 
                                        className="text-input" 
                                        value={projectName} 
                                        onChange={(e) => setProjectName(e.target.value)} 
                                        placeholder="My awesome project" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="project-idea">Project Idea</label>
                                    <textarea id="project-idea" className="text-input1" value={projectIdea} onChange={(e) => setProjectIdea(e.target.value)} placeholder="What's the big idea?" rows="4"></textarea>
                                </div>
                                <button type="submit" className="btn">
                                    {editingProject ? <><Check size={16} /> Save Changes</> : <><Plus size={16} /> Create Project</>}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Project selection/creation view
    return (
        <>
            <div className="content-header project-list-header">
                <div className="project-controls">
                        <input 
                            type="text" 
                            className="text-input" 
                            placeholder="Search projects..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                <div className="project-controls">
                    <button className="btn" onClick={() => handleOpenProjectModal()}>
                        <Plus size={16} /> Create Project
                    </button>
                </div>
            </div>
            <div className="content">
                <div className="projects-grid">
                    {Object.values(projects)
                        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .sort((a, b) => {
                            switch (sortBy) {
                                case 'name_asc':
                                    return a.name.localeCompare(b.name);
                                case 'name_desc':
                                    return b.name.localeCompare(a.name);
                                case 'createdAt_asc':
                                    return new Date(a.createdAt) - new Date(b.createdAt);
                                case 'createdAt_desc':
                                default:
                                    return new Date(b.createdAt) - new Date(a.createdAt);
                            }
                        })
                        .map(p => {
                            const totalTasks = Object.values(p.boards).reduce((acc, board) => acc + board.length, 0);
                            const completedTasks = p.boards.completed.length;
                            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                            const startDate = new Date(p.createdAt);
                            return (
                        <div key={p.id} className="project-card section" onClick={() => setCurrentProjectId(p.id)}>
                            <div className="project-card-header">
                                <h3>{p.name}</h3>
                                <div className="project-card-actions">
                                    <button className="task-action-btn" onClick={(e) => handleEditProjectName(e, p.id, p.name)}>
                                        <Edit size={16} /> 
                                    </button>
                                    <button className="task-action-btn" onClick={(e) => handleDeleteProject(e, p.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="project-card-info">
                                <p>Created: {startDate.toLocaleDateString()}</p>
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="progress-text">{Math.round(progress)}% complete ({completedTasks}/{totalTasks})</p>
                            </div>
                        </div>
                    )})}
                </div>
            </div>
            {isProjectModalOpen && (
                <div className="modal-overlay" onClick={handleCloseProjectModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
                        </div>
                        <form onSubmit={handleCreateProject} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="project-name">Project Name</label>
                                <input 
                                    id="project-name" 
                                    className="text-input" 
                                    value={projectName} 
                                    onChange={(e) => setProjectName(e.target.value)} 
                                    placeholder="My awesome project" 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="project-idea">Project Idea</label>
                                <textarea id="project-idea" className="text-input1" value={projectIdea} onChange={(e) => setProjectIdea(e.target.value)} placeholder="What's the big idea?" rows="4"></textarea>
                            </div>
                            <button type="submit" className="btn">
                                {editingProject ? <><Check size={16} /> Save Changes</> : <><Plus size={16} /> Create Project</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
