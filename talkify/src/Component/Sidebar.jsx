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
  const [activeTab, setActiveTab] = useState("all");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [users, setUsers] = useState([]); 
  const [groups, setGroups] = useState([]); 
  const [unseenCounts, setUnseenCounts] = useState({}); 
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("userData"));

  // 📥 1. Fetch Initial Data (Contacts & Groups)
  const fetchData = async () => {
    try {
      const [userRes, groupRes] = await Promise.all([
        axiosInstance.get('/users/contacts'),
        axiosInstance.get('/groups/all')
      ]);
      if (userRes.data.success) {
        setUsers(userRes.data.users);
        setUnseenCounts(userRes.data.unseenMessages || {});
      }
      if (groupRes.data.success) {
        setGroups(groupRes.data.groups);
      }
    } catch (err) { 
      console.error("Load error:", err); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 📡 2. Real-time Socket Listener for Unseen Badges
  useEffect(() => {
    if (!currentUser?._id) return;

    const socket = io("http://localhost:5000", {
        query: { userId: currentUser._id }
    });
    
    socket.on("newMessage", (newMsg) => {
        // Increment count only if the message is NOT from the currently selected chat
        if (selectedUser?._id !== newMsg.senderId) {
            setUnseenCounts(prev => ({
                ...prev,
                [newMsg.senderId]: (prev[newMsg.senderId] || 0) + 1
            }));
        }
    });

    return () => socket.disconnect();
  }, [selectedUser?._id, currentUser?._id]);

  // 🖱️ 3. Close Account Menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 🔍 4. Search Logic with Debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
        fetchData(); // If search is cleared, reload normal contacts
        return;
    }

    const delayDebounceFn = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await axiosInstance.get(`/users/search?query=${searchTerm}`);
          if (res.data.success) {
              setUsers(res.data.users);
          }
        } catch (err) { 
          console.error("Search error:", err); 
        } finally { 
          setLoading(false); 
        }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelectUser = (item) => {
    setSelectedUser(item);
    // Clear unseen count locally when chat is opened
    setUnseenCounts(prev => ({ ...prev, [item._id]: 0 }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // 🗄️ 5. Combine and Filter List based on Tabs
  const getFilteredList = () => {
    let list = [];
    if (activeTab === "groups") {
        list = groups;
    } else if (activeTab === "friends") {
        list = users;
    } else {
        list = [...groups, ...users];
    }

    // Secondary client-side filter for safety
    if (!searchTerm) return list;
    return list.filter(item => 
      (item.name || item.fullName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className={`sidebar ${selectedUser ? "hide-mobile" : ""}`}>
      
      {/* 🟢 TOP SECTION: Fixed Header, Search, and Tabs */}
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
                  alt="me" 
                  className={`header-user-img ${showAccountMenu ? 'active-ring' : ''}`} 
                />
                <div className="online-dot"></div>
              </div>

              {showAccountMenu && (
                <div className="bespoke-dropdown animate-pop">
                  <div className="menu-group">
                    <div className="menu-item" onClick={() => navigate("/profile")}>
                      <span className="material-symbols-rounded">edit_square</span> Update Profile
                    </div>
                    <div className="menu-item" onClick={() => navigate("/personal-info")}>
                      <span className="material-symbols-rounded">badge</span> Personal Info
                    </div>
                  </div>
                  <div className="menu-divider"></div>
                  <div className="menu-group">
                    <div className="menu-item" onClick={() => navigate("/createGroup")}>
                      <span className="material-symbols-rounded">group_add</span> Create Group
                    </div>
                    <div className="menu-item" onClick={() => navigate("/settings")}>
                      <span className="material-symbols-rounded">settings</span> Settings
                    </div>
                  </div>
                  <div className="menu-divider"></div>
                  <div className="menu-group">
                    <div className="menu-item" onClick={() => { localStorage.clear(); navigate("/login"); }}>
                      <span className="material-symbols-rounded">person_add</span> Add New Account
                    </div>
                    <div className="menu-item logout" onClick={() => setIsLogoutModalOpen(true)}>
                      <span className="material-symbols-rounded">logout</span> Logout
                    </div>
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
              placeholder="Search chats..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
          />
          {loading && <div className="loader-mini-spinner"></div>}
        </div>

        <div className="sidebar-tabs">
          <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>All</button>
          <button className={activeTab === "friends" ? "active" : ""} onClick={() => setActiveTab("friends")}>Friends</button>
          <button className={activeTab === "groups" ? "active" : ""} onClick={() => setActiveTab("groups")}>Groups</button>
        </div>
      </div>

      {/* 🔵 LIST SECTION: Scrolls independently */}
      <div className="user-list">
        {getFilteredList().length > 0 ? (
            getFilteredList().map((item) => {
              const isGroup = !!item.admin;
              return (
                <div 
                  key={item._id} 
                  onClick={() => handleSelectUser(item)} 
                  className={`user-item ${selectedUser?._id === item._id ? "active" : ""}`}
                >
                  <div className="avatar-rel">
                    <img src={(isGroup ? item.groupProfilePic : item.profilePic) || assets.avatar_icon} className="user-avatar" alt="pfp" />
                    {!isGroup && <div className="online-dot"></div>}
                  </div>
                  <div className="user-info">
                    <p className="user-fullname">{isGroup ? `👥 ${item.name}` : item.fullName}</p>
                    <span className="user-handle">{isGroup ? `${item.members.length} members` : `@${item.username}`}</span>
                  </div>
                  {unseenCounts[item._id] > 0 && (
                    <div className="unseen-badge animate-pop">{unseenCounts[item._id]}</div>
                  )}
                </div>
              )
            })
        ) : (
            <p className="empty-text">Nothing found</p>
        )}
      </div>
      
      {/* 🚪 Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogout} 
      />
    </div>
  );
};

export default Sidebar;