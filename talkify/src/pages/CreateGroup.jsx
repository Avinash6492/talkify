import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import axiosInstance from '../Config/axios'; // 👈 Connected to real API
import "./CreateGroup.css";

const CreateGroup = () => {
    const [groupImage, setGroupImage] = useState(null);
    const [groupName, setGroupName] = useState("");
    const [availableUsers, setAvailableUsers] = useState([]); // 👈 Real Users
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 1. Fetch real contacts from DB to invite
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axiosInstance.get('/users/contacts');
                if (res.data.success) setAvailableUsers(res.data.users);
            } catch (err) { console.error("Error fetching users:", err); }
        };
        fetchUsers();
    }, []);

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    // 2. Real Group Creation Logic
    const handleCreateGroup = async (e) => {
        e.preventDefault();

        if (!groupName.trim()) return alert("Please enter a group name.");
        if (selectedUsers.length === 0) return alert("Please add at least one member.");

        setLoading(true);
        try {
            let imageUrl = "";

            // Upload Group Icon to Cloudinary if selected
            if (groupImage) {
                const reader = new FileReader();
                reader.readAsDataURL(groupImage);
                const base64Promise = new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result);
                });
                imageUrl = await base64Promise;
            }

            const res = await axiosInstance.post('/groups/create', {
                name: groupName,
                members: selectedUsers,
                groupProfilePic: imageUrl
            });

            if (res.data.success) {
                alert(`🎉 Success! ${groupName} created.`);
                navigate('/');
            }
        } catch (error) {
            console.error("Group Creation Error:", error);
            alert("Failed to create group.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='group-page-container'>
            <div className='group-minimal-card animate-in'>
                <form onSubmit={handleCreateGroup} className='group-main-form'>
                    <h1 className='group-main-title'>Create Group</h1>

                    <div className='group-pic-uploader'>
                        <div className={`main-group-img-wrapper ${groupImage ? 'image-loaded' : ''}`}>
                            <img 
                                src={groupImage ? URL.createObjectURL(groupImage) : assets.avatar_icon} 
                                alt="group-icon" 
                                className='main-group-img'
                            />
                            <label htmlFor="groupIcon" className='upload-overlay'>
                                <span className="material-symbols-rounded">add_a_photo</span>
                            </label>
                            <input onChange={(e) => setGroupImage(e.target.files[0])} type="file" id='groupIcon' hidden accept="image/*" />
                        </div>
                        <div className='avatar-text'>
                            <p style={{fontSize: '0.9rem', fontWeight: 700}}>Group Icon</p>
                            <p style={{fontSize: '11px', color: 'var(--text-muted)'}}>Click circle to add photo</p>
                        </div>
                    </div>

                    <div className='input-stack'>
                        <div className='input-box'>
                            <label>Group Name*</label>
                            <input 
                                type="text" 
                                placeholder="e.g., Coding Squad 🚀"
                                value={groupName} 
                                onChange={(e) => setGroupName(e.target.value)}
                                className='clean-input'
                                required
                            />
                        </div>

                        <div className='input-box'>
                            <label>Add Members ({selectedUsers.length} selected)</label>
                            <div className='members-selection-list'>
                                {availableUsers.map((user) => (
                                    <div 
                                        key={user._id} 
                                        className={`member-item ${selectedUsers.includes(user._id) ? 'selected' : ''}`}
                                        onClick={() => toggleUserSelection(user._id)}
                                    >
                                        <img src={user.profilePic || assets.avatar_icon} alt="user" />
                                        <p>{user.fullName}</p>
                                        <div className='selection-check'>
                                            {selectedUsers.includes(user._id) && 
                                                <span className="material-symbols-rounded">check_circle</span>
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='group-actions'>
                        <button type='button' className="cancel-btn" onClick={() => navigate('/')}>Cancel</button>
                        <button type='submit' className="create-group-btn" disabled={loading}>
                            {loading ? "Creating..." : "Create Group"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroup;