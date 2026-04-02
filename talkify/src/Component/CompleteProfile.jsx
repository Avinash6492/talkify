import React, { useState } from 'react';
import assets from '../assets/assets';
import "./CompleteProfile.css";

const CompleteProfile = ({ currentUser, onSave, onClose }) => {
    // 💡 Initialize state with current user data (The "Current Details")
    const [formData, setFormData] = useState({
        fullName: currentUser?.fullName || "",
        bio: currentUser?.bio || "",
        profilePic: currentUser?.profilePic || assets.avatar_icon
    });

    const [tempFile, setTempFile] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTempFile(file);
            setFormData({ ...formData, profilePic: URL.createObjectURL(file) });
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        // 🚀 Only here does the data actually "Update"
        onSave(formData); 
        onClose();
    };

    return (
        <div className='profile-modal-overlay'>
            <div className='profile-modal-card animate-in-up'>
                <div className='modal-header'>
                    <h2>Edit Profile</h2>
                    <button className='close-modal-btn' onClick={onClose}>
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>

                <form onSubmit={handleUpdate}>
                    <div className='profile-upload-section'>
                        <label htmlFor="avatar-upload" className='avatar-label'>
                            <img 
                                src={formData.profilePic} 
                                alt="preview" 
                                className='profile-preview-img' 
                            />
                            <div className='upload-overlay'>
                                <span className="material-symbols-rounded">photo_camera</span>
                            </div>
                        </label>
                        <input type="file" id="avatar-upload" hidden onChange={handleImageChange} />
                    </div>

                    <div className='input-group-premium'>
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <div className='input-group-premium'>
                        <label>Bio</label>
                        <textarea 
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            placeholder="Tell us about yourself..."
                            rows="3"
                        />
                    </div>

                    <div className='modal-footer'>
                        {/* ❌ Clicking Close/Cancel doesn't trigger onSave */}
                        <button type="button" className='btn-secondary' onClick={onClose}>Cancel</button>
                        <button type="submit" className='btn-primary'>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;