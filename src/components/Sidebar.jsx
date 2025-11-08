import React from 'react';
import { NavLink } from 'react-router-dom';
import { Clock ,Calendar, ListTodo, BarChart3, Settings, User, View, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Sidebar({ isOpen }) {
    const {
        userName,
        userAvatar,
        storageUsage,
        isSidebarSmall,
        setIsSidebarSmall,
    } = useAppContext();

    const getNavLinkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''} ${isSidebarSmall ? 'small' : ''}`} id="sidebar">
            <div className="sidebar-header">
                <div className="brand">
                    <div className="brand-logo">
                    </div>
                    {!isSidebarSmall && <span>TaskMaster</span>}
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-item">
                    <NavLink className={getNavLinkClass} to="/">
                        <BarChart3 className="nav-icon" />
                        <span>Dashboard</span>
                    </NavLink>
                </div>
                <div className="nav-item">
                    <NavLink className={getNavLinkClass} to="/calendar">
                        <Calendar className="nav-icon" />
                        <span>Calendar</span>
                    </NavLink>
                </div>
                <div className="nav-item">
                    <NavLink className={getNavLinkClass} to="/weekly">
                        <View className="nav-icon" />
                        <span>Weekly</span>
                    </NavLink>
                </div>
                <div className="nav-item">
                    <NavLink className={getNavLinkClass} to="/notes">
                        <FileText className="nav-icon" />
                        <span>Notes</span>
                    </NavLink>
                </div>
                <div className="nav-item">
                    <NavLink className={getNavLinkClass} to="/projects">
                        <ListTodo className="nav-icon" />
                        <span>Projects</span>
                    </NavLink>
                </div>
                <div className="nav-item">
                    <NavLink className={getNavLinkClass} to="/profile" >
                        <User className="nav-icon" />
                        <span>Profile</span>
                    </NavLink >
                </div>
                <div className="nav-item">
                    <NavLink className={getNavLinkClass} to="/settings">
                        <Settings className="nav-icon" />
                        <span>Settings</span>
                    </NavLink>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">
                        {userAvatar ? (
                            <img src={userAvatar} alt="User Avatar" />
                        ) : (
                            userName.charAt(0)
                        )}
                    </div>
                    <div className="user-details">
                        <div className="user-name">{userName}</div>
                        <div className="storage-badge">{storageUsage}</div>
                    </div>
                </div>
            </div>
            <button className="sidebar-toggle-btn" onClick={() => setIsSidebarSmall(!isSidebarSmall)}>
                {isSidebarSmall ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
        </aside>
    );
}
