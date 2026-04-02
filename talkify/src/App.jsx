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
  // We pull these values on every render to keep the guard accurate
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData"));

  // 🛡️ Logic: Profile is complete ONLY if they have a name AND a profile picture
  // This is what prevents new users from seeing the chat list until they finish setup.
  const isProfileComplete = userData?.profilePic && userData?.fullName;

  return (
    <div className="app-container">
      <div className="page-fade-enter">
        <Routes>
          {/* 🚪 Public Route: If already logged in, redirect to the Home check logic at "/" */}
          <Route 
            path='/login' 
            element={!token ? <LoginPage /> : <Navigate to="/" replace />} 
          />

          {/* 🏠 Home Route: The main logic gate */}
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
          
          {/* 👤 Profile Route: Accessible if logged in */}
          <Route 
            path='/profile' 
            element={token ? <ProfilePage /> : <Navigate to="/login" replace />} 
          />
          
          {/* 🔐 Other Protected Routes */}
          <Route path='/createGroup' element={token ? <CreateGroup /> : <Navigate to="/login" replace />} />
          <Route path='/qr' element={token ? <InviteQR /> : <Navigate to="/login" replace />} />
          <Route path='/personal-info' element={token ? <PersonalInfo /> : <Navigate to="/login" replace />} />
          <Route path='/about' element={token ? <AboutUs /> : <Navigate to="/login" replace />} />

          {/* ↩️ Fallback: Redirect any unknown path to the Home logic */}
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App;