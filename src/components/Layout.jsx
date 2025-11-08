import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAppContext } from '../context/AppContext';

export default function Layout() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { userName, userAvatar, isSidebarSmall, theme, setTheme } = useAppContext();
    const location = useLocation();

    // Close sidebar on navigation (for mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return { title: 'Dashboard', subtitle: "Here's a summary of your activities." };
        if (path.startsWith('/todolist')) return { title: 'Todo List', subtitle: 'Manage your projects and tasks.' };
        if (path.startsWith('/statistics')) return { title: 'Statistics', subtitle: 'Visualize your progress.' };
        if (path.startsWith('/settings')) return { title: 'Settings', subtitle: 'Customize your application.' };
        if (path.startsWith('/profile')) return { title: 'My Profile', subtitle: 'View and edit your personal information.' };
        if (path.startsWith('/calendar')) return { title: 'Calendar', subtitle: 'Manage your schedule.' };
        if (path.startsWith('/weekly')) return { title: 'Weekly Planner', subtitle: 'Plan your week.' };
        if (path.startsWith('/projects')) return { title: 'Projects', subtitle: 'All your projects in one place.' };
        if (path.startsWith('/notes')) return { title: 'Notes', subtitle: 'All your note one place.' };
        return { title: 'Page Not Found', subtitle: '' };
    };

    const { title, subtitle } = getPageTitle();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="app-container">
            {/* Mobile Sidebar Toggle */}
            <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                <Menu size={20} />
            </button>

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} />

            {/* Main Content */}
            <main className={`main-content ${isSidebarSmall ? 'sidebar-small' : ''}`}>
                <header className="content-header">
                    <div className="page-title-container">
                        <div>
                            <h1 className="page-title">{title}</h1>
                        </div>
                        <div className="header-actions">
                            <button className="header-icon-btn" onClick={toggleTheme}>
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                            <button className="header-icon-btn"><Bell size={20} /></button>
                            <Link to="/profile" className="header-profile-link">
                                <div className="avatar header-avatar">
                                    {userAvatar ? (
                                        <img src={userAvatar} alt="Avatar" />
                                    ) : (
                                        userName.charAt(0)
                                    )}
                                </div>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Nested routes */}
                <Outlet />

                <Footer />
            </main>
        </div>
    );
}
