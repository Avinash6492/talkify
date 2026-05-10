import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import assets from "../assets/assets";
import axiosInstance from "../Config/axios";
import { io } from "socket.io-client";
import OnboardingModal from "../Component/OnboardingModal";
import "./ChatContainer.css";

// Socket initialization

const userData = JSON.parse(localStorage.getItem("userData"));

const socket = io("http://localhost:5000", {
  query: {
    userId: userData?._id,
  },
});

const ChatContainer = ({
  selectedUser,
  setSelectedUser,
  onHeaderDoubleClick,
}) => {
  // =========================================
  // STATES
  // =========================================

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [showChatMenu, setShowChatMenu] = useState(false);

  const [filePreview, setFilePreview] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("userData")),
  );

  // =========================================
  // REFS
  // =========================================

  const scrollEnd = useRef();

  const chatMenuRef = useRef(null);

  // =========================================
  // FETCH MESSAGES
  // =========================================

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(`/messages/${selectedUser._id}`);

        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Load error:", err);
      }
    };

    fetchMessages();

    setShowChatMenu(false);

    setFilePreview(null);

    setSelectedFile(null);
  }, [selectedUser]);

  // =========================================
  // SOCKET LISTENER
  // =========================================

  useEffect(() => {
    if (!selectedUser || !currentUser?._id) return;

    const handleNewMessage = (newMsg) => {
      const isRelevant =
        (newMsg.senderId === selectedUser._id &&
          newMsg.receiverId === currentUser._id) ||
        (newMsg.senderId === currentUser._id &&
          newMsg.receiverId === selectedUser._id);

      if (isRelevant) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);
  }, [selectedUser, currentUser?._id]);

  // =========================================
  // AUTO SCROLL
  // =========================================

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, filePreview]);

  // =========================================
  // CLOSE MENU OUTSIDE CLICK
  // =========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target)) {
        setShowChatMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================================
  // FILE CHANGE
  // =========================================

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file || file.size > 10 * 1024 * 1024) {
      return alert("File too large (Max 10MB)");
    }

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onloadend = () => setFilePreview(reader.result);

    reader.readAsDataURL(file);
  };

  // =========================================
  // DELETE MESSAGE
  // =========================================

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      const res = await axiosInstance.delete(`/messages/delete/${messageId}`);

      if (res.data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // =========================================
  // SEND MESSAGE
  // =========================================

  const handleSendMessage = async () => {
    if (!message.trim() && !filePreview) return;

    const messageText = message;

    const fileData = filePreview;

    const fileObj = selectedFile;

    setMessage("");

    setFilePreview(null);

    setSelectedFile(null);

    setShowEmojiPicker(false);

    try {
      const isImage = fileObj?.type.startsWith("image/");

      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        {
          text: messageText,

          image: isImage ? fileData : null,

          fileUrl: !isImage ? fileData : null,

          fileName: fileObj?.name || null,
        },
      );

      if (res.data.newMessage) {
        setMessages((prev) => [...prev, res.data.newMessage]);
      }
    } catch (err) {
      console.error("Send error:", err);

      setMessage(messageText);
    }
  };

  // =========================================
  // CLEAR CHAT
  // =========================================

  const handleClearChat = async () => {
    if (!window.confirm("Delete all messages and media?")) return;

    try {
      const res = await axiosInstance.delete(
        `/messages/clear/${selectedUser._id}`,
      );

      if (res.data.success) {
        setMessages([]);

        setShowChatMenu(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================
  // REMOVE CONTACT
  // =========================================

  const handleRemoveContact = async () => {
    if (!window.confirm("Remove this user?")) return;

    try {
      const res = await axiosInstance.delete(
        `/messages/clear/${selectedUser._id}`,
      );

      if (res.data.success) {
        setSelectedUser(null);

        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================
  // BLOCK USER
  // =========================================

  const handleBlockUser = async () => {
    try {
      const res = await axiosInstance.post(
        `/messages/block/${selectedUser._id}`,
      );

      if (res.data.success) {
        alert(res.data.isBlocked ? "User Blocked" : "User Unblocked");

        setShowChatMenu(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================
  // WELCOME SCREEN
  // =========================================

  if (!selectedUser) {
    return (
      <div className="welcome-screen">
        {currentUser && !currentUser.isProfileComplete && (
          <OnboardingModal
            onComplete={(updatedUser) => setCurrentUser(updatedUser)}
          />
        )}

        <div className="welcome-content">
          <img src={assets.logo_icon} alt="logo" className="welcome-logo" />

          <h2>Talkify</h2>

          <p>Select a friend to start chatting.</p>
        </div>
      </div>
    );
  }

  // =========================================
  // MAIN RETURN
  // =========================================

  return (
    <div className="chat-wrapper-flex">
      {currentUser && !currentUser.isProfileComplete && (
        <OnboardingModal
          onComplete={(updatedUser) => setCurrentUser(updatedUser)}
        />
      )}

      <div className="chat-container">
        {/* =========================================
                    HEADER
                ========================================= */}

        <div className="chat-header" onDoubleClick={onHeaderDoubleClick}>
          <div className="header-left">
            <img
              src={assets.arrow_icon}
              alt="back"
              className="mobile-back-icon"
              onClick={() => setSelectedUser(null)}
            />

            <div className="avatar-wrapper">
              <img
                src={selectedUser?.profilePic || assets.avatar_icon}
                alt="pfp"
                className="header-avatar"
              />

              <div className="online-indicator"></div>
            </div>

            <div className="header-info">
              <h3>{selectedUser?.fullName}</h3>

              <p className="header-subtitle">Active now</p>
            </div>
          </div>

          <div className="header-right" ref={chatMenuRef}>
            <button
              className="menu-dot-btn"
              onClick={() => setShowChatMenu(!showChatMenu)}
            >
              <span className="material-symbols-rounded">more_vert</span>
            </button>

            {showChatMenu && (
              <div className="chat-menu animate-pop">
                <div className="menu-item" onClick={handleClearChat}>
                  <span className="material-symbols-rounded">mop</span>
                  Clear Chat
                </div>

                <div className="menu-item" onClick={handleRemoveContact}>
                  <span className="material-symbols-rounded">
                    person_remove
                  </span>
                  Remove Contact
                </div>

                <div className="menu-divider"></div>

                <div className="menu-item logout" onClick={handleBlockUser}>
                  <span className="material-symbols-rounded">block</span>
                  Block User
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================
                    MESSAGES AREA
                ========================================= */}

        <div className="messages-area">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-group ${
                msg.senderId === currentUser._id ? "sent" : "received"
              }`}
            >
              <div className="message-content">
                <div className="message-bubble-premium">
                  {/* IMAGE */}

                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="sent"
                      className="bubble-sent-image"
                    />
                  )}

                  {/* FILE */}

                  {msg.fileUrl && !msg.image && (
                    <div
                      className="file-attachment-bubble"
                      onClick={() => window.open(msg.fileUrl, "_blank")}
                    >
                      <span className="material-symbols-rounded">
                        description
                      </span>

                      <span>{msg.fileName || "View Attachment"}</span>
                    </div>
                  )}

                  {/* TEXT */}

                  {msg.text && <p className="bubble-text">{msg.text}</p>}

                  {/* TIME */}

                  <span className="msg-time-inline">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  {/* DELETE */}

                  {msg.senderId === currentUser._id && (
                    <button
                      className="bubble-delete-btn"
                      onClick={() => handleDeleteMessage(msg._id)}
                    >
                      <span className="material-symbols-rounded">delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={scrollEnd} />
        </div>

        {/* =========================================
                    FILE PREVIEW
                ========================================= */}

        {filePreview && (
          <div className="file-preview-container animate-slide-up">
            <div className="preview-card">
              {selectedFile?.type.startsWith("image/") ? (
                <img src={filePreview} alt="preview" />
              ) : (
                <div className="generic-file-preview">
                  <span className="material-symbols-rounded">description</span>

                  <p>{selectedFile?.name}</p>
                </div>
              )}

              <button
                className="remove-preview"
                onClick={() => {
                  setFilePreview(null);

                  setSelectedFile(null);
                }}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================
                    INPUT AREA
                ========================================= */}

        <div className="chat-input-area">
          <div className="input-actions-left">
            <button
              className="action-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <span className="material-symbols-rounded">mood</span>
            </button>

            <label className="action-btn">
              <span className="material-symbols-rounded">attach_file</span>

              <input type="file" hidden onChange={handleFileChange} />
            </label>
          </div>

          <div className="input-wrapper">
            <textarea
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();

                  handleSendMessage();
                }
              }}
            />
          </div>

          <button
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!message.trim() && !filePreview}
          >
            <span className="material-symbols-rounded">send</span>
          </button>

          {showEmojiPicker && (
            <div className="emoji-picker-wrapper">
              <EmojiPicker
                theme="dark"
                onEmojiClick={(emojiData) =>
                  setMessage((prev) => prev + emojiData.emoji)
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
