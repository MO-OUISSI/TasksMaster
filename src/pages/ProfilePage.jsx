import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppContext } from '../context/AppContext';
import { User, Upload } from 'lucide-react';
import '../pages/ProfilePage.css'; 

export default function ProfilePage() {
    const { userName: currentUserName, userAvatar: currentAvatar, setUserName, setUserAvatar } = useAppContext();
    const [userName, setUserNameInStorage] = useLocalStorage('userName', 'User');
    const [avatar, setAvatarInStorage] = useLocalStorage('userAvatarDataUrl', '');
    
    const [nameInput, setNameInput] = useState(userName);
    const [avatarPreview, setAvatarPreview] = useState(avatar);

    useEffect(() => {
        setNameInput(userName);
        setAvatarPreview(avatar);
    }, [userName, avatar]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        const newName = nameInput.trim() || 'User';
        // Update context state
        setUserName(newName);
        setUserAvatar(avatarPreview);
        // Update local storage
        setUserNameInStorage(newName);
        setAvatarInStorage(avatarPreview);
        alert('Profile updated successfully!');
    };

    return (
        <>
            <div className="content">
                <form onSubmit={handleSave} className="section">
                    <h3>Personal Information</h3>
                    <div className="settings-row">
                        <label htmlFor="userName">Name</label>
                        <div className="input-group">
                            <input
                                id="userName"
                                type="text"
                                className="text-input"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>
                    </div>
                    <div className="settings-row">
                        <label>Avatar</label>
                        <div className="input-group">
                            <div className="avatar avatar-preview" style={{ width: '80px', height: '80px' }}>
                                {avatarPreview ? <img src={avatarPreview} alt="Avatar" /> : <User size={40} />}
                            </div>
                            <label htmlFor="avatarUpload" className="btn secondary">
                                <Upload size={16} />
                                <span>Change Avatar</span>
                            </label>
                            <input
                                id="avatarUpload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                            />
                             {avatarPreview && (
                                <button type="button" className="btn danger-outline" onClick={() => setAvatarPreview('')}>
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <button type="submit" className="btn">Save Changes</button>
                    </div>
                </form>
            </div>
        </>
    );
}