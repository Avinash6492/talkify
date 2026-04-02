import React, { useState, useEffect } from 'react';
import Sidebar from '../Component/Sidebar';
import ChatContainer from '../Component/ChatContainer';
import RightSidebar from '../Component/RightSidebar';
import CompleteProfile from '../Component/CompleteProfile';
import "./HomePage.css";

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false); // 👈 New State

  useEffect(() => {
    if (localStorage.getItem("needsProfileComplete") === "true") {
      setShowCompleteModal(true);
    }
  }, []);

  // Reset sidebar when user changes
  useEffect(() => {
    setShowRightSidebar(false);
  }, [selectedUser]);

  const handleCloseModal = () => {
    localStorage.removeItem("needsProfileComplete");
    setShowCompleteModal(false);
  };

  return (
    <div className='home-container'>
      {showCompleteModal && <CompleteProfile onClose={handleCloseModal} />}
      
      <div className="glass-wrapper">
        <div className={`sidebar-section ${selectedUser ? 'hide-mobile' : ''}`}>
          <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        </div>
        
        <div className="chat-section">
          <ChatContainer 
            selectedUser={selectedUser} 
            setSelectedUser={setSelectedUser} 
            onHeaderDoubleClick={() => setShowRightSidebar(true)} // 👈 Passed prop
          />
        </div>
        
        {/* 🛠️ Improved Sidebar Logic with Animation Wrapper */}
        {showRightSidebar && selectedUser && (
          <div className="right-section rs-animate-slide">
            <RightSidebar 
                selectedUser={selectedUser} 
                onClose={() => setShowRightSidebar(false)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;