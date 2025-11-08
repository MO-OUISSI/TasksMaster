import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppContext } from '../context/AppContext';
import { Folder, Plus, ArrowRight, User, Settings, Zap, X, Calendar, Star, Sun, Moon, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // Import the new CSS file

const PREDEFINED_COLORS = [
    '#3a6ea5', '#5c46beff', '#be8947ff', '#8f2432ff',
    '#684675ff', '#b64b89ff', '#296954ff'
];

const ALL_SHORTCUTS = [
    { id: 'calendar', label: 'Calendar', path: '/calendar', icon: <Calendar size={22} /> },
    { id: 'weekly', label: 'Weekly', path: '/weekly', icon: <Star size={22} /> },
    { id: 'projects', label: 'Projects', path: '/projects', icon: <Folder size={22} /> },
    { id: 'notes', label: 'Notes', path: '/notes', icon: <FileText size={22} /> }, 
    { id: 'profile', label: 'Profile', path: '/profile', icon: <User size={22} /> },
    { id: 'settings', label: 'Settings', path: '/settings', icon: <Settings size={22} /> },
];

export default function Dashboard() {
    const [projects] = useLocalStorage('todolist_projects_v5', {});
    const [isThemeSetupDone, setIsThemeSetupDone] = useLocalStorage('theme_setup_complete_v2', false);
    const [showThemeSetup, setShowThemeSetup] = useState(!isThemeSetupDone);
    const [userShortcuts, setUserShortcuts] = useLocalStorage('dashboard_shortcuts_v1', ['calendar', 'projects']);
    const [isEditing, setIsEditing] = useState(false);

    const { theme, setTheme, primaryColor, setPrimaryColor } = useAppContext();

    const projectList = Object.values(projects);
    const totalProjects = projectList.length;

    const displayedShortcuts = useMemo(() => {
        return ALL_SHORTCUTS.filter(s => userShortcuts.includes(s.id));
    }, [userShortcuts]);

    const handleToggleShortcut = (shortcutId) => {
        if (userShortcuts.includes(shortcutId)) {
            setUserShortcuts(userShortcuts.filter(id => id !== shortcutId));
        } else {
            setUserShortcuts([...userShortcuts, shortcutId]);
        }
    };

    const WelcomeModal = () => {
        const handleFinishSetup = () => {
            setIsThemeSetupDone(true);
            setShowThemeSetup(false);
        };

        return (
            <div className="modal-backdrop welcome-modal-backdrop">
                <div className="modal-content welcome-modal-content">
                    <div className="welcome-modal-header">
                        <h2>Welcome!</h2>
                        <p>Let's customize your experience.</p>
                    </div>
                    <div className="welcome-modal-body">
                        <div className="theme-option">
                            <h4>Choose a theme</h4>
                            <div className="theme-buttons">
                                <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                                    <Sun size={18} /> Light
                                </button>
                                <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                                    <Moon size={18} /> Dark
                                </button>
                            </div>
                        </div>
                        <div className="theme-option">
                            <h4>Select an accent color</h4>
                            <div className="color-swatch-container">
                                {PREDEFINED_COLORS.map(color => (
                                    <div
                                        key={color}
                                        className={`color-swatch ${primaryColor === color ? 'active' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setPrimaryColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <button className="btn welcome-save-btn" onClick={handleFinishSetup}>Get Started</button>
                </div>
            </div>
        );
    };

    const ShortcutEditor = () => (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header-new">
                    <h3>Edit Quick Access</h3>
                    <button onClick={() => setIsEditing(false)} className="modal-close-btn"><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <ul className="shortcut-editor-list">
                        {ALL_SHORTCUTS.map(shortcut => (
                            <li key={shortcut.id} onClick={() => handleToggleShortcut(shortcut.id)}>
                                <div className={`shortcut-icon-wrapper ${shortcut.id}`}>{shortcut.icon}</div>
                                <span className="shortcut-editor-label">{shortcut.label}</span>
                                <div className={`toggle-switch ${userShortcuts.includes(shortcut.id) ? 'active' : ''}`}>
                                    <div className="toggle-knob"></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {showThemeSetup && <WelcomeModal />}

            <div className="content">
                <div className="card_container">
                    <div className="card_triangle-1"></div>
                    <div className="card_triangle-2"></div>

                    <div className="card_content">
                        <div className="card_header">
                            <h1 className="card_title">Dashboard Overview</h1>
                        </div>

                        <p className="card_description">
                            Gain real-time insights and track your performance metrics easily with our
                            intelligent dashboard tools designed to help you stay organized and efficient.
                        </p>

                        <div className="card_buttons">
                            <Link to="/calendar" className="card_btn card_btn-primary" id='btn_dash1'>
                                Calendar
                            </Link>
                            <Link to="/projects" className="card_btn card_btn-secondary" id='btn_dash1'>
                                Create project <span className="card_arrow">→</span>
                            </Link>
                        </div>
                    </div>

                </div>
                <div className="section">
                    <div className="section-header">
                        <h3><Zap size={20} className="section-header-icon" />Quick Access</h3>
                    </div>
                    <div className="shortcuts-list">
                        {displayedShortcuts.map(shortcut => (
                            <Link to={shortcut.path} key={shortcut.id} className="shortcut-card">
                                <div className={`shortcut-icon-wrapper ${shortcut.id}`}>{shortcut.icon}</div>
                                <div className="shortcut-text-wrapper">
                                    <strong>{shortcut.label}</strong>
                                    <span>Go to your {shortcut.label.toLowerCase()} page.</span>
                                </div>
                                <ArrowRight size={18} className="shortcut-arrow" />
                            </Link>
                        ))}
                        <button onClick={() => setIsEditing(true)} className="shortcut-card add-shortcut-card">
                            <Plus size={24} />
                            <span>Add Shortcut</span>
                        </button>
                        {displayedShortcuts.length === 0 && (
                            <div className="empty-state-text">
                                <p>No shortcuts added yet. Click the '+' card to add some!</p>
                            </div>
                        )}
                    </div>
                    {isEditing && <ShortcutEditor />}
                </div>
            </div>
        </>
    );
}