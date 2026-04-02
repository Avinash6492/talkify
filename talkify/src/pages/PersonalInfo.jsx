import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import "./PersonalInfo.css";

const PersonalInfo = () => {
    const navigate = useNavigate();
    
    // 🕵️‍♂️ Pulling real data from localStorage
    const userData = JSON.parse(localStorage.getItem("userData"));
    
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState("");

    // Fallback if data is missing
    if (!userData) return <div className="personal-info-container">Loading...</div>;

    return (
        <div className='personal-info-container'>
            <div className='info-card animate-in'>
                <div className='info-header'>
                    <button className='back-btn' onClick={() => navigate(-1)}>
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <h2>Account Details</h2>
                </div>

                <div className='info-body'>
                    {/* Profile Summary Section */}
                    <div className='info-profile-summary'>
                        <img 
                            src={userData.profilePic || assets.avatar_icon} 
                            alt="Profile" 
                            className='info-avatar-large' 
                        />
                        <div className='info-status-box'>
                            <label>Account Status</label>
                            {/* Logic: if user has a profile pic and name, they are "Verified" in our app flow */}
                            <div className={`status-badge ${userData.profilePic ? 'verified' : 'unverified'}`}>
                                <span className="material-symbols-rounded">
                                    {userData.profilePic ? 'verified' : 'pending'}
                                </span>
                                {userData.profilePic ? 'Verified Profile' : 'Pending Setup'}
                            </div>
                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className='info-grid'>
                        <div className='info-item'>
                            <p className='label'>Full Name</p>
                            <p className='value'>{userData.fullName || "Not Set"}</p>
                        </div>

                        <div className='info-item'>
                            <p className='label'>Username</p>
                            <p className='value'>@{userData.username}</p>
                        </div>

                        <div className='info-item'>
                            <p className='label'>Email Address</p>
                            <p className='value'>{userData.email}</p>
                        </div>

                        <div className='info-item'>
                            <p className='label'>Bio</p>
                            <p className='value bio-text'>{userData.bio || "No bio available."}</p>
                        </div>
                    </div>

                    {/* Verification / OTP Section */}
                    {!showOTP ? (
                        <div className='unverified-container'>
                            <p className='otp-text'>Secure your account with 2FA</p>
                            <button className='verify-now-btn' onClick={() => setShowOTP(true)}>
                                Enable
                            </button>
                        </div>
                    ) : (
                        <div className='otp-form animate-pop'>
                            <p className='otp-text'>Enter the code sent to your email</p>
                            <input 
                                type="text" 
                                className='otp-input' 
                                maxLength="4" 
                                placeholder="0000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <div className='otp-actions'>
                                <button className='cancel-btn' onClick={() => setShowOTP(false)}>Cancel</button>
                                <button className='confirm-btn'>Verify</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className='info-footer'>
                    <p>Your data is encrypted and used only for Talkify services.</p>
                    <button className='support-btn' onClick={() => navigate('/about')}>
                        <span className="material-symbols-rounded">help_outline</span>
                        Talkify Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfo;