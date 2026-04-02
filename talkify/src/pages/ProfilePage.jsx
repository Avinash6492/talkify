import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import axiosInstance from '../Config/axios';
import "./ProfilePage.css";

const ProfilePage = () => {
    const navigate = useNavigate();
    
    // Get the initial data from localStorage
    const getInitialData = () => JSON.parse(localStorage.getItem("userData")) || {};
    const currentUser = getInitialData();

    const [image, setImage] = useState(null);
    const [name, setName] = useState(currentUser?.fullName || "");
    const [username] = useState(currentUser?.username || "");
    const [bio, setBio] = useState(currentUser?.bio || "");
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) return alert("Full Name is required!");
        
        setLoading(true);

        try {
            let base64Image = null;
            
            // Convert file to Base64 if a new image was selected
            if (image) {
                const reader = new FileReader();
                reader.readAsDataURL(image);
                base64Image = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                });
            }

            // Send update to backend
            const res = await axiosInstance.put('/users/update-profile', {
                fullName: name,
                bio: bio,
                profilePic: base64Image 
            });

            if (res.data.success) {
                // ✅ UPDATE LOCAL STORAGE: Overwrite with fresh data from server
                localStorage.setItem("userData", JSON.stringify(res.data.user));
                
                alert("Profile successfully updated!");
                
                // 🚀 REFRESH & NAVIGATE: 
                // Using window.location.href forces the App to re-run its guard logic
                // with the brand-new localStorage data.
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Update Error:", error);
            alert(error.response?.data?.message || "Failed to update profile. Please try again.");
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
                        <input 
                            onChange={(e) => setImage(e.target.files[0])} 
                            type="file" 
                            id='avatar' 
                            hidden 
                            accept="image/*" 
                        />
                    </div>

                    <div className='input-stack'>
                        <div className='input-box'>
                            <label>Username</label>
                            <input 
                                type="text" 
                                value={username} 
                                className='clean-input disabled-input' 
                                disabled 
                            />
                            <span className='input-hint'>Usernames cannot be changed</span>
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
                        <button type='submit' className="update-profile-btn" disabled={loading}>
                            {loading ? "Saving Changes..." : "Finish Setup & Enter"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;