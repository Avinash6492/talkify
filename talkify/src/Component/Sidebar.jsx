import React, { useState, useEffect, useRef } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import LogoutModal from './LogoutModal';
import axiosInstance from '../Config/axios'; 
import { io } from "socket.io-client"; 
import "./Sidebar.css"; 

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const navigate = useNavigate();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [users, setUsers] = useState([]); 
  const [unseenCounts, setUnseenCounts] = useState({}); 
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("userData"));

  // --- 1. Fetch only users with existing chat history ---
  const fetchActiveChats = async () => {
    try {
      // Endpoint should return users you have already communicated with
      const res = await axiosInstance.get('/messages/users'); 
      if (res.data.success) {
        setUsers(res.data.users || []);
        setUnseenCounts(res.data.unseenMessages || {});
      }
    } catch (err) { 
      console.error("Load error:", err); 
    }
  };

  useEffect(() => {
    fetchActiveChats();
  }, []);

  // --- 2. Real-time Message Notifications ---
  useEffect(() => {
    if (!currentUser?._id) return;
    const socket = io("http://localhost:5000", {
        query: { userId: currentUser._id }
    });

    socket.on("newMessage", (newMsg) => {
        // Increment badge if the sender is NOT the currently open chat
        if (selectedUser?._id !== newMsg.senderId) {
            setUnseenCounts(prev => ({
                ...prev,
                [newMsg.senderId]: (prev[newMsg.senderId] || 0) + 1
            }));
        }
    });

    return () => socket.disconnect();
  }, [currentUser?._id, selectedUser?._id]);

  // --- 3. Search Logic: Filter Active vs Search Results ---
  useEffect(() => {
    if (!searchTerm.trim()) {
        fetchActiveChats(); 
        return;
    }

    const delayDebounceFn = setTimeout(async () => {
        setLoading(true);
        try {
          // Hits the new searchUsers controller function
          const res = await axiosInstance.get(`/users/search?query=${searchTerm}`);
          if (res.data.success) {
              setUsers(res.data.users);
          }
        } catch (err) { 
          console.error("Search error:", err); 
        } finally { 
          setLoading(false); 
        }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelectUser = (item) => {
    setSelectedUser(item);
    setSearchTerm(""); // Reset search to return to "Recent Chats" view
    setUnseenCounts(prev => ({ ...prev, [item._id]: 0 })); // Clear badge locally
  };

  return (
    <div className={`sidebar ${selectedUser ? "hide-mobile" : ""}`}>
      
      <div className="sidebar-top">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={assets.logo_icon} alt="logo" className="sidebar-logo-img" />
            <span className="sidebar-logo-text">Talkify</span>
          </div>
          <div className="header-actions">
            <ThemeToggle />
            <div className="account-menu-wrapper" ref={menuRef}>
              <div className="profile-entry" onClick={() => setShowAccountMenu(!showAccountMenu)}>
                <img 
                  src={currentUser?.profilePic || assets.avatar_icon} 
                  className={`header-user-img ${showAccountMenu ? 'active-ring' : ''}`} 
                  alt="profile"
                />
                <div className="online-dot"></div>
              </div>

              {showAccountMenu && (
  <div className="bespoke-dropdown animate-pop">
    <div className="menu-item" onClick={() => { setShowAccountMenu(false); navigate("/profile"); }}>
      <span className="material-symbols-rounded">person</span> Profile
    </div>
    
    <div className="menu-item" onClick={() => { setShowAccountMenu(false); navigate("/create-group"); }}>
      <span className="material-symbols-rounded">group_add</span> Create Group
    </div>

    <div className="menu-item" onClick={() => { setShowAccountMenu(false); navigate("/qr"); }}>
      <span className="material-symbols-rounded">qr_code_2</span> Invite QR
    </div>
    
    <div className="menu-divider"></div>
    
   <div className="menu-item" onClick={() => { setShowAccountMenu(false); navigate("/personal-info"); }}>
      <span className="material-symbols-rounded">badge</span> Personal Info
    </div>

    <div className="menu-item" onClick={() => { setShowAccountMenu(false); navigate("/settings"); }}>
      <span className="material-symbols-rounded">settings</span> Settings
    </div>
    
    <div className="menu-item logout" onClick={() => { setShowAccountMenu(false); setIsLogoutModalOpen(true); }}>
      <span className="material-symbols-rounded">logout</span> Logout
    </div>
  </div>
)}
            </div>
          </div>
        </div>

        <div className="search-container">
          <span className="material-symbols-rounded search-icon-font">search</span>
          <input 
              type="text" 
              className="search-input" 
              placeholder="Find friends by username..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
          />
          {loading && <div className="loader-mini-spinner"></div>}
        </div>
      </div>

      <div className="user-list">
        <p className="list-label">{searchTerm ? "Search Results" : "Recent Chats"}</p>
        
        {users.length > 0 ? (
            users.map((item) => (
              <div 
                key={item._id} 
                onClick={() => handleSelectUser(item)} 
                className={`user-item ${selectedUser?._id === item._id ? "active" : ""}`}
              >
                <div className="avatar-rel">
                  <img src={item.profilePic || assets.avatar_icon} className="user-avatar" alt="pfp" />
                </div>
                <div className="user-info">
                  <p className="user-fullname">{item.fullName}</p>
                  <span className="user-handle">@{item.username}</span>
                </div>
                {/* 🔴 Notification Badge */}
                {unseenCounts[item._id] > 0 && (
                  <div className="unseen-badge animate-pop">{unseenCounts[item._id]}</div>
                )}
              </div>
            ))
        ) : (
            /* Empty State for New Users */
            <div className="search-placeholder">
               <img src={assets.logo_icon} alt="search" className="placeholder-icon" />
               <p className="empty-text">
                  {searchTerm 
                    ? "We couldn't find anyone with that username." 
                    : "No conversations yet. Search for a friend to start your first chat!"}
               </p>
            </div>
        )}
      </div>
      
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => { 
          localStorage.clear(); 
          navigate('/login'); 
        }} 
      />
    </div>
  );
};

export default Sidebar;