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
    const [link, setLink] = useState(currentUser?.link || ""); //  Added Link state
    const [loading, setLoading] = useState(false);
    
    const [isAvailable, setIsAvailable] = useState(null); 
    const [checkingUsername, setCheckingUsername] = useState(false);

    //  Real-time Username Availability Check
    useEffect(() => {
        if (!username || username === currentUser?.username) {
            setIsAvailable(null);
            return;
        }

        const cleanUsername = username.replace(/\s/g, "").toLowerCase();
        if (username !== cleanUsername) setUsername(cleanUsername);

        const delayDebounceFn = setTimeout(async () => {
            setCheckingUsername(true);
            try {
                const res = await axiosInstance.get(`/users/check-username?username=${cleanUsername}`);
                setIsAvailable(res.data.available);
            } catch (err) {
                console.error("Availability check failed", err);
            } finally {
                setCheckingUsername(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [username, currentUser?.username]);

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

            //  Updated Payload with Link
            const res = await axiosInstance.put('/users/update-profile', {
                fullName: name,
                username: username,
                bio: bio,
                link: link, //  Added Link to payload
                profilePic: base64Image || currentUser.profilePic 
            });

            if (res.data.success) {
    localStorage.setItem("userData", JSON.stringify(res.data.user));
    alert("Profile successfully updated!");
    navigate("/chat"); // This sends you back to the Chat
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
            {/* Back Button for Settings feel */}
            <button className="back-to-chat" onClick={() => navigate("/")}>
                <span className="material-symbols-rounded">arrow_back</span>
                Back to Chat
            </button>

            <div className='profile-minimal-card animate-in'>
                <form onSubmit={handleUpdateProfile} className='profile-main-form'>
                    <h1 className='profile-main-title'>Edit Profile</h1>
                    <p className='profile-subtitle'>Manage your public identity on Talkify</p>

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
                            Change Photo
                        </label>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id='avatar' hidden accept="image/*" />
                    </div>

                    <div className='input-stack'>
                        <div className='input-box'>
                            <label>Username</label>
                            <div className="username-input-container">
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`clean-input ${isAvailable === false ? 'input-error' : ''}`}
                                />
                                <div className="availability-indicator">
                                    {checkingUsername && <div className="loader-mini"></div>}
                                    {!checkingUsername && isAvailable === true && <span className="status-available">Available</span>}
                                    {!checkingUsername && isAvailable === false && <span className="status-taken">Taken</span>}
                                </div>
                            </div>
                        </div>

                        <div className='input-box'>
                            <label>Full Name*</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className='clean-input'
                                required
                            />
                        </div>

                        {/* 🆕 NEW Link Input */}
                        <div className='input-box'>
                            <label>Website / Link</label>
                            <input 
                                type="text" 
                                placeholder="e.g. portfolio.com"
                                value={link} 
                                onChange={(e) => setLink(e.target.value)}
                                className='clean-input'
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
                            {loading ? "Saving Changes..." : "Save Profile Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;