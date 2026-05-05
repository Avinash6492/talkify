import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import axiosInstance from '../Config/axios';
import "./ProfilePage.css";

const ProfilePage = () => {
    const navigate = useNavigate();
    
    const getInitialData = () => JSON.parse(localStorage.getItem("userData")) || {};
    const currentUser = getInitialData();

    const [image, setImage] = useState(null);
    const [name, setName] = useState(currentUser?.fullName || "");
    const [username, setUsername] = useState(currentUser?.username || "");
    const [bio, setBio] = useState(currentUser?.bio || "");
    const [loading, setLoading] = useState(false);
    
    // 🆕 State for username validation
    const [isAvailable, setIsAvailable] = useState(null); // null = original, true = available, false = taken
    const [checkingUsername, setCheckingUsername] = useState(false);

    // 🔍 1. Real-time Username Availability Check
    useEffect(() => {
        // Don't check if the username hasn't changed from the original
        if (!username || username === currentUser?.username) {
            setIsAvailable(null);
            return;
        }

        // Clean username: No spaces, allow symbols and numbers
        const cleanUsername = username.replace(/\s/g, "").toLowerCase();
        if (username !== cleanUsername) setUsername(cleanUsername);

        const delayDebounceFn = setTimeout(async () => {
            setCheckingUsername(true);
            try {
                // Adjust this URL to match your backend route for checking availability
                const res = await axiosInstance.get(`/users/check-username?username=${cleanUsername}`);
                setIsAvailable(res.data.available);
            } catch (err) {
                console.error("Availability check failed", err);
            } finally {
                setCheckingUsername(false);
            }
        }, 500); // 500ms delay to prevent excessive API calls

        return () => clearTimeout(delayDebounceFn);
    }, [username]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) return alert("Full Name is required!");
        if (isAvailable === false) return alert("This username is already taken!");
        
        setLoading(true);

        try {
            let base64Image = null;
            if (image) {
                const reader = new FileReader();
                reader.readAsDataURL(image);
                base64Image = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                });
            }

            // 📤 Send updated username along with other details
            const res = await axiosInstance.put('/users/update-profile', {
                fullName: name,
                username: username, // Pass the new username
                bio: bio,
                profilePic: base64Image 
            });

            if (res.data.success) {
                localStorage.setItem("userData", JSON.stringify(res.data.user));
                alert("Profile successfully updated!");
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Update Error:", error);
            alert(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='profile-page-container'>
            <div className='profile-minimal-card animate-in'>
                <form onSubmit={handleUpdateProfile} className='profile-main-form'>
                    <h1 className='profile-main-title'>Complete your profile</h1>
                    <p className='profile-subtitle'>Set up your identity to start chatting on Talkify</p>

                    <div className='profile-pic-uploader'>
                        <div className="avatar-preview-wrapper">
                            <img 
                                src={image ? URL.createObjectURL(image) : (currentUser?.profilePic || assets.avatar_icon)} 
                                alt="profile" 
                                className='main-avatar-img'
                            />
                        </div>
                        <label htmlFor="avatar" className='change-photo-btn'>
                            <span className="material-symbols-rounded">add_a_photo</span>
                            {image ? "Photo Selected" : "Upload Profile Photo"}
                        </label>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id='avatar' hidden accept="image/*" />
                    </div>

                    <div className='input-stack'>
                        <div className='input-box'>
                            <label>Username (Must be unique)</label>
                            <div className="username-input-container">
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`clean-input ${isAvailable === false ? 'input-error' : ''}`}
                                    placeholder="e.g. avinash_123!"
                                />
                                {/* 🛠️ Status Indicator */}
                                <div className="availability-indicator">
                                    {checkingUsername && <div className="loader-mini"></div>}
                                    {!checkingUsername && isAvailable === true && <span className="status-available">Available</span>}
                                    {!checkingUsername && isAvailable === false && <span className="status-taken">Taken</span>}
                                </div>
                            </div>
                            <span className='input-hint'>Use letters, numbers, and symbols like _ ! @</span>
                        </div>

                        <div className='input-box'>
                            <label>Full Name*</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Avinash Maurya"
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className='clean-input'
                                required
                            />
                        </div>

                        <div className='input-box'>
                            <label>Bio</label>
                            <textarea 
                                placeholder='Tell the world about yourself...' 
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className='clean-input bio-area'
                                maxLength={250}
                            />
                            <span className='char-counter'>{bio.length} / 250</span>
                        </div>
                    </div>

                    <div className="profile-form-actions">
                        <button 
                            type='submit' 
                            className="update-profile-btn" 
                            disabled={loading || checkingUsername || isAvailable === false}
                        >
                            {loading ? "Saving Changes..." : "Finish Setup & Enter"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;