import React from 'react';
import assets from '../assets/assets';
import "./RightSidebar.css";

const RightSidebar = ({ selectedUser, onClose }) => {
    const sharedMedia = [
        { id: 1, img: assets.pic1 }, 
        { id: 2, img: assets.pic2 },
        { id: 3, img: assets.pic3 },
        { id: 4, img: assets.pic4 },
        { id: 5, img: assets.img1 },
        { id: 6, img: assets.img2 },
    ];

    return (
        <div className='right-sidebar rs-animate-slide'>
            {/* ❌ Close Button */}
            <button className="rs-close-btn" onClick={onClose}>
                <span className="material-symbols-rounded">close</span>
            </button>

            <div className='rs-profile-card'>
                <div className='rs-avatar-ring'>
                    <img src={selectedUser.profilePic || assets.avatar_icon} alt="user" className='rs-main-avatar' />
                </div>
                <h3>{selectedUser.fullName}</h3>
                {/* 🟢 Status Indicator */}
                <p className='rs-status'>Active Now</p>
                
                {/* 📝 NEW: User Bio Section */}
                <div className='rs-bio-container'>
                    <p className='rs-bio-text'>
                        {selectedUser.bio || "No bio available."}
                    </p>
                </div>
            </div>

            <hr className='rs-divider' />

            <div className='rs-media-section'>
                <div className='rs-section-header'>
                    <span>Shared Media</span>
                    <button className='rs-view-all'>View All</button>
                </div>
                <div className='rs-media-grid tighter-3-cols'>
                    {sharedMedia.map(item => (
                        <div key={item.id} className='rs-media-item-small'>
                            <img src={item.img || assets.avatar_icon} alt="shared" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RightSidebar;