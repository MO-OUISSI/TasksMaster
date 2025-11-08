import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppContext = createContext();

// Helper to calculate localStorage usage
function getLocalStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
        if (!localStorage.hasOwnProperty(key)) continue;
        let value = localStorage.getItem(key);
        total += key.length + (value ? value.length : 0);
    }
    return total * 2; // Each char is 2 bytes in UTF-16
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
export function AppProvider({ children }) {
    const [theme, setTheme] = useLocalStorage('darkMode', 'light');
    const [primaryColor, setPrimaryColor] = useLocalStorage('themePrimaryColor', '#3a6ea5');
    const [userName, setUserName] = useLocalStorage('userName', 'User');
    const [userAvatar, setUserAvatar] = useLocalStorage('userAvatarDataUrl', null);
    const [storageUsage, setStorageUsage] = useState('0 B / 5 MB');

    // ✅ Add these two lines
    const [isSidebarSmall, setIsSidebarSmall] = useLocalStorage('isSidebarSmall', false);

    const updateStorage = useCallback(() => {
        const usage = getLocalStorageUsage();
        setStorageUsage(`${formatBytes(usage)} / 5 MB`);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark-mode');
        } else {
            root.classList.remove('dark-mode');
        }
    }, [theme]);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', primaryColor);
        root.style.setProperty('--secondary-color', primaryColor);
    }, [primaryColor]);

    useEffect(() => {
        updateStorage();
    }, [userName, userAvatar, primaryColor, theme, updateStorage]);

    const value = {
        theme,
        setTheme,
        primaryColor,
        setPrimaryColor,
        userName,
        setUserName,
        userAvatar,
        setUserAvatar,
        storageUsage,
        updateStorage,
        // ✅ Add them here too
        isSidebarSmall,
        setIsSidebarSmall,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}


export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
