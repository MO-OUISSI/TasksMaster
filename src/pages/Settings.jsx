import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext';

const PREDEFINED_COLORS = [
    '#3a6ea5', // Default Blue
    '#5c46beff', // Teal
    '#be8947ff', // Orange
    '#8f2432ff', // Red
    '#684675ff', // Purple
    '#b64b89ff', // Bright Blue
    '#296954ff', // Green
];

export default function Settings() {
    const {
        theme, setTheme,
        primaryColor, setPrimaryColor,
        userName, setUserName,
        userAvatar, setUserAvatar,
        updateStorage
    } = useAppContext();

    const nameInputRef = useRef();
    const avatarUploadRef = useRef();
    const importFileRef = useRef();

    const handleSaveName = () => {
        setUserName(nameInputRef.current.value);
        alert('Name saved!');
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setUserAvatar(reader.result);
            alert('Avatar updated!');
        };
        reader.readAsDataURL(file);
    };

    const handleExportData = () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'calendar_app_backup.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportData = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, data[key]);
                });
                alert('Import successful! The page will now reload to apply changes.');
                window.location.reload();
            } catch (error) {
                alert('Import failed. Invalid file format.');
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        if (window.confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
            localStorage.clear();
            alert('All data has been cleared. The page will now reload.');
            window.location.reload();
        }
    };

    return (
        <>
            <div className="content">
                <div className="section">
                    <h3>Appearance</h3>
                    <div className="settings-grid">
                        <div className="settings-row">
                            <label htmlFor="theme-mode">Theme</label>
                            <select id="theme-mode" className="text-input" value={theme} onChange={(e) => setTheme(e.target.value)}>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        <div className="settings-row">
                            <label htmlFor="primary-color">Accent Color</label>
                            <div className="input-group">
                                <div className="color-swatch-container">
                                    {PREDEFINED_COLORS.map(color => (
                                        <div
                                            key={color}
                                            className="color-swatch"
                                            style={{ backgroundColor: color }}
                                            onClick={() => setPrimaryColor(color)}
                                        />
                                    ))}
                                </div>
                                <input id="primary-color" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                

                <div className="section">
                    <h3>Data & Storage</h3>
                    <div className="settings-row">
                        <label>Manage Data</label>
                        <input type="file" accept=".json" ref={importFileRef} onChange={handleImportData} style={{ display: 'none' }} />
                        <div className="input-group" style={{ justifyContent: 'flex-start' }}>
                            <button className="btn secondary" onClick={handleExportData}>Export</button>
                            <button className="btn secondary" onClick={() => importFileRef.current.click()}>Import</button>
                            <button className="btn danger" onClick={handleClearData}>Clear All</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
