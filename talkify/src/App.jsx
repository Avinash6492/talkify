import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CreateGroup from './pages/CreateGroup.jsx';
import InviteQR from './Component/InviteQR'; 
import PersonalInfo from './pages/PersonalInfo.jsx'; 
import AboutUs from './pages/AboutUs';

import "./App.css"; 

const App = () => {
  const token = localStorage.getItem("token");
  
  // ✅ Safe parsing - won't crash if localStorage is corrupted
  const userData = (() => {
    try {
      const data = localStorage.getItem("userData");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  const isProfileComplete = userData?.profilePic && userData?.fullName;

  return (
    <div className="app-container">
      <div className="page-fade-enter">
        <Routes>
          <Route 
            path='/login' 
            element={!token ? <LoginPage /> : <Navigate to="/" replace />} 
          />
          <Route 
            path='/' 
            element={
              token ? (
                isProfileComplete ? <HomePage /> : <Navigate to="/profile" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path='/profile' element={token ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path='/createGroup' element={token ? <CreateGroup /> : <Navigate to="/login" replace />} />
          <Route path='/qr' element={token ? <InviteQR /> : <Navigate to="/login" replace />} />
          <Route path='/personal-info' element={token ? <PersonalInfo /> : <Navigate to="/login" replace />} />
          <Route path='/about' element={token ? <AboutUs /> : <Navigate to="/login" replace />} />
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App;