import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage.jsx'; 
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CreateGroup from './pages/CreateGroup.jsx';
import InviteQR from './Component/InviteQR';
import PersonalInfo from './pages/PersonalInfo.jsx';
import AboutUs from './pages/AboutUs';

import "./App.css";

const App = () => {
    // =========================================
    // AUTH & THEME STATE
    // =========================================
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [isDarkMode, setIsDarkMode] = useState(true); 

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // =========================================
    // LISTEN FOR AUTH CHANGES
    // =========================================
    useEffect(() => {
        const handleAuthChange = () => {
            setToken(localStorage.getItem("token"));
        };

        window.addEventListener("authChange", handleAuthChange);
        return () => window.removeEventListener("authChange", handleAuthChange);
    }, []);

    return (
        <div className={`app-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
            <div className="page-fade-enter">
                <Routes>
                    {/* =========================================
                        1. LANDING PAGE (Entry Point)
                        Everyone starts here first.
                    ========================================= */}
                    <Route 
                        path='/' 
                        element={<LandingPage isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} 
                    />

                    {/* =========================================
                        2. LOGIN / SIGNUP PAGE
                        FIX: Removed conditional Navigate. 
                        This forces the LoginPage to load for everyone.
                    ========================================= */}
                    <Route
                        path='/login'
                        element={<LoginPage />}
                    />

                    {/* =========================================
                        3. CHAT AREA (Protected)
                        Only accessible if token is present.
                    ========================================= */}
                    <Route
                        path='/chat'
                        element={
                            token
                                ? <HomePage />
                                : <Navigate to="/login" replace />
                        }
                    />

                    {/* =========================================
                        4. OTHER PROTECTED ROUTES
                    ========================================= */}
                    <Route
                        path='/profile'
                        element={token ? <ProfilePage /> : <Navigate to="/login" replace />}
                    />

                    <Route
                        path='/create-group'
                        element={token ? <CreateGroup /> : <Navigate to="/login" replace />}
                    />

                    <Route
                        path='/qr'
                        element={token ? <InviteQR /> : <Navigate to="/login" replace />}
                    />

                    <Route
                        path='/personal-info'
                        element={token ? <PersonalInfo /> : <Navigate to="/login" replace />}
                    />

                    <Route
                        path='/about'
                        element={token ? <AboutUs /> : <Navigate to="/login" replace />}
                    />

                    {/* =========================================
                        5. FALLBACK ROUTE
                    ========================================= */}
                    <Route
                        path='*'
                        element={<Navigate to="/" replace />}
                    />
                </Routes>
            </div>
        </div>
    );
};

export default App;