import React, { useState, useEffect } from "react";
import "./RightSidebar.css";
import assets from "../assets/assets";
import axiosInstance from "../Config/axios";

const RightSidebar = ({ selectedUser, onClose }) => {
  const [sharedMedia, setSharedMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSharedMedia = async () => {
      if (!selectedUser?._id) {
        setSharedMedia([]);
        return;
      }

      setLoading(true);
      try {
        const res = await axiosInstance.get(`/messages/${selectedUser._id}`);
        if (res.data.success) {
          const media = res.data.messages.filter(
            (msg) => msg.image || msg.fileUrl
          );
          setSharedMedia(media);
        }
      } catch (err) {
        console.error("Error fetching media:", err);
        setSharedMedia([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchSharedMedia();
  }, [selectedUser]);

  if (!selectedUser) {
    return (
      <div className="right-sidebar empty">
        <button className="rs-close-btn" onClick={onClose}>
          <span className="material-symbols-rounded">close</span>
        </button>
        <p>Select a chat to see details</p>
      </div>
    );
  }

  return (
    <div className="right-sidebar">
      <button className="rs-close-btn" onClick={onClose}>
        <span className="material-symbols-rounded">close</span>
      </button>

      {/* --- Profile Info --- */}
      <div className="rs-profile">
        <img 
          src={selectedUser.profilePic || assets.avatar_icon} 
          alt="profile" 
          className="rs-avatar"
        />
        <h3>{selectedUser.fullName}</h3>
        {/* Added fallback for missing username */}
        <p className="rs-handle">
          {selectedUser.username ? `@${selectedUser.username}` : "No username set"}
        </p>
        
        {/* --- New Bio Section --- */}
        {selectedUser.bio && <p className="rs-bio">{selectedUser.bio}</p>}
      </div>

      <hr className="rs-divider" />

      {/* --- NEW Link Section --- */}
      {selectedUser.link && (
        <div className="rs-link-section">
          <p className="rs-title">Website / Link</p>
          <a 
            href={selectedUser.link.startsWith('http') ? selectedUser.link : `https://${selectedUser.link}`} 
            target="_blank" 
            rel="noreferrer" 
            className="rs-external-link"
          >
            <span className="material-symbols-rounded">link</span>
            {selectedUser.link}
          </a>
          <hr className="rs-divider" />
        </div>
      )}

      {/* --- Shared Media --- */}
      <div className="rs-media">
        <p className="rs-title">Shared Media</p>
        <div className="rs-media-grid">
          {loading ? (
            <div className="loader-mini-spinner"></div>
          ) : sharedMedia.length > 0 ? (
            sharedMedia.map((msg, index) => (
              <img 
                key={index} 
                src={msg.image || msg.fileUrl} 
                alt="shared-content" 
                className="rs-grid-image"
                onClick={() => window.open(msg.image || msg.fileUrl, "_blank")}
              />
            ))
          ) : (
            <div className="no-media-container">
               <p className="no-media-text">No media shared yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="rs-actions">
        <button className="rs-btn block">Block User</button>
      </div>
    </div>
  );
};

export default RightSidebar;