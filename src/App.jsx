import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Calendar from './pages/Calendar';
import TodoList from './pages/TodoList';
import Dashboard from './pages/Dashboard.jsx';
import Settings from './pages/Settings';
import ProfilePage from './pages/ProfilePage';
import WeeklyView from './pages/WeeklyView';
import Notes from './pages/Notes';


export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/projects" element={<TodoList />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/weekly" element={<WeeklyView />} />
                <Route path="/notes" element={<Notes />} />
            </Route>
        </Routes>
    );
}
