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
  // Using token to check auth status
  const token = localStorage.getItem("token");
  
  // ✅ Safe parsing - stays robust if localStorage is cleared or corrupted
  const userData = (() => {
    try {
      const data = localStorage.getItem("userData");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  // Logic to force profile setup if it's a new user
  const isProfileComplete = userData?.profilePic && userData?.fullName;

  return (
    <div className="app-container">
      <div className="page-fade-enter">
        <Routes>
          {/* 🔐 Authentication Gate: If logged in, don't show login page */}
          <Route 
            path='/login' 
            element={!token ? <LoginPage /> : <Navigate to="/" replace />} 
          />

          {/* 🏠 Home: Redirects to Login if no token, or Profile if incomplete */}
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

          {/* 👤 Profile Setup/View */}
          <Route path='/profile' element={token ? <ProfilePage /> : <Navigate to="/login" replace />} />

          {/* 🚀 Create Group: Updated path to match Sidebar.jsx navigate("/create-group") */}
          <Route path='/create-group' element={token ? <CreateGroup /> : <Navigate to="/login" replace />} />

          {/* 📱 Invite QR: Updated to match Sidebar.jsx navigate("/qr") */}
          <Route path='/qr' element={token ? <InviteQR /> : <Navigate to="/login" replace />} />

          {/* 📋 Additional Info Pages */}
          <Route path='/personal-info' element={token ? <PersonalInfo /> : <Navigate to="/login" replace />} />
          <Route path='/about' element={token ? <AboutUs /> : <Navigate to="/login" replace />} />

          {/* 🔄 Fallback: Redirect any unknown URL to Home */}
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App;