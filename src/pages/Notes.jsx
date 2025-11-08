import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, Edit3, Copy } from 'lucide-react';
import './Notes.css';

export default function Notes() {
    const { theme, primaryColor, updateStorage } = useAppContext();
    const [notes, setNotes] = useLocalStorage('user_notes_v1', []);
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editedText, setEditedText] = useState('');
    const [copyMessage, setCopyMessage] = useState('');

    // 🔹 Keep storage logic — update when notes change
    useEffect(() => {
        updateStorage();
    }, [notes, updateStorage]);

    const handleAddNote = () => {
        if (newNote.trim() === '') return;
        const note = {
            id: Date.now(),
            text: newNote.trim(),
            date: new Date().toLocaleString(),
        };
        setNotes([...notes, note]);
        setNewNote('');
    };

    const handleDelete = (id) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    const handleEdit = (id, text) => {
        setEditingId(id);
        setEditedText(text);
    };

    const handleSaveEdit = () => {
        setNotes(notes.map(n => (n.id === editingId ? { ...n, text: editedText } : n)));
        setEditingId(null);
        setEditedText('');
    };

    const handleCopy = async (text) => {
        await navigator.clipboard.writeText(text);
        setCopyMessage('Note copied!');
        setTimeout(() => setCopyMessage(''), 2000);
    };

    return (
        <div className="content notes-page">
            {/* Copy Message */}
            {copyMessage && <div className="copy-toast">{copyMessage}</div>}

            {/* Notes Section */}
            <div className="section">
                <div className="section-header">
                    <h3>Your Notes</h3>
                </div>

                <div className="notes-input-area">
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Write a new note..."
                        className="note-input"
                    ></textarea>
                    <button className="btn" onClick={handleAddNote}>
                        <Plus size={18} /> Create Note
                    </button>
                </div>

                {notes.length === 0 ? (
                    <div className="empty-state-text">
                        <p>No notes yet. Start by writing one above!</p>
                    </div>
                ) : (
                    <div className="notes-grid">
                        {notes.map(note => (
                            <div key={note.id} className="note-card">
                                {editingId === note.id ? (
                                    <>
                                        <textarea
                                            value={editedText}
                                            onChange={(e) => setEditedText(e.target.value)}
                                            className="note-edit-input"
                                        ></textarea>
                                        <div className="note-actions">
                                            <button className="note-btn save" onClick={handleSaveEdit}>Save</button>
                                            <button className="note-btn cancel" onClick={() => setEditingId(null)}>Cancel</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="note-text">{note.text}</p>
                                        <div className="note-footer">
                                            <span className="note-date">{note.date}</span>
                                            <div className="note-buttons">
                                                <button onClick={() => handleCopy(note.text)} className="note-btn icon">
                                                    <Copy size={16} />
                                                </button>
                                                <button onClick={() => handleEdit(note.id, note.text)} className="note-btn icon">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(note.id)} className="note-btn icon delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
