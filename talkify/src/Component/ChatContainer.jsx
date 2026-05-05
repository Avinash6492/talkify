import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import assets from "../assets/assets";
import axiosInstance from '../Config/axios';
import { io } from "socket.io-client";
import "./ChatContainer.css";

// Socket initialization
const socket = io("http://localhost:5000", {
    query: { userId: JSON.parse(localStorage.getItem("userData"))?._id }
});

const ChatContainer = ({ selectedUser, setSelectedUser, onHeaderDoubleClick }) => {
    // --- States ---
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [filePreview, setFilePreview] = useState(null); 
    const [selectedFile, setSelectedFile] = useState(null);

    // --- Refs ---
    const scrollEnd = useRef();
    const chatMenuRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem("userData"));

    // --- Effects ---
    useEffect(() => {
        if (!selectedUser) return;
        const fetchMessages = async () => {
            try {
                const res = await axiosInstance.get(`/messages/${selectedUser._id}`);
                setMessages(res.data.messages || []);
            } catch (err) { console.error("Load error:", err); }
        };
        fetchMessages();
        setShowChatMenu(false);
        setFilePreview(null);
        setSelectedFile(null);
    }, [selectedUser]);

    useEffect(() => {
        if (!selectedUser || !currentUser?._id) return;
        const handleNewMessage = (newMsg) => {
            const isRelevant = 
                (newMsg.senderId === selectedUser._id && newMsg.receiverId === currentUser._id) ||
                (newMsg.senderId === currentUser._id && newMsg.receiverId === selectedUser._id);
            if (isRelevant) {
                setMessages((prev) => [...prev, newMsg]);
            }
        };
        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);
    }, [selectedUser, currentUser?._id]);

    useEffect(() => {
        scrollEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, filePreview]);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chatMenuRef.current && !chatMenuRef.current.contains(event.target)) {
                setShowChatMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Handlers ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file || file.size > 10 * 1024 * 1024) return alert("File too large (Max 10MB)");
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            const res = await axiosInstance.delete(`/messages/delete/${messageId}`);
            if (res.data.success) {
                setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
            }
        } catch (err) { console.error("Delete error:", err); }
    };

    const handleSendMessage = async () => {
        if (!message.trim() && !filePreview) return;
        const messageText = message;
        const fileData = filePreview;
        const fileObj = selectedFile;

        setMessage(""); setFilePreview(null); setSelectedFile(null); setShowEmojiPicker(false);

        try {
            const isImage = fileObj?.type.startsWith("image/");
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, { 
                text: messageText,
                image: isImage ? fileData : null,
                fileUrl: !isImage ? fileData : null,
                fileName: fileObj?.name || null
            });
            if (res.data.newMessage) setMessages((prev) => [...prev, res.data.newMessage]);
        } catch (err) { console.error("Send error:", err); setMessage(messageText); }
    };

    const handleClearChat = async () => {
        if (!window.confirm("Delete all messages and media? This cannot be undone.")) return;
        try {
            const res = await axiosInstance.delete(`/messages/clear/${selectedUser._id}`);
            if (res.data.success) {
                setMessages([]);
                setShowChatMenu(false);
            }
        } catch (err) { console.error(err); }
    };

    const handleRemoveContact = async () => {
        if (!window.confirm("Remove this user and delete all chat history?")) return;
        try {
            const res = await axiosInstance.delete(`/messages/clear/${selectedUser._id}`);
            if (res.data.success) {
                setSelectedUser(null);
                window.location.reload(); 
            }
        } catch (err) { console.error(err); }
    };

    const handleBlockUser = async () => {
        try {
            const res = await axiosInstance.post(`/messages/block/${selectedUser._id}`);
            if (res.data.success) {
                alert(res.data.isBlocked ? "User Blocked" : "User Unblocked");
                setShowChatMenu(false);
            }
        } catch (err) { console.error(err); }
    };

    if (!selectedUser) {
        return (
            <div className='welcome-screen'>
                <div className='welcome-content'>
                    <img src={assets.logo_icon} alt="logo" className='welcome-logo'/>
                    <h2>Talkify</h2>
                    <p>Select a friend to start a secure conversation.</p>
                </div>
            </div>
        );
    }

    return (
        <div className='chat-wrapper-flex'>
            <div className='chat-container'>
                <div className='chat-header' onDoubleClick={onHeaderDoubleClick}>
                    <div className='header-left'>
                        <img src={assets.arrow_icon} alt="back" className='mobile-back-icon' onClick={() => setSelectedUser(null)} />
                        <div className='avatar-wrapper'>
                            <img src={selectedUser?.profilePic || assets.avatar_icon} alt="pfp" className='header-avatar' />
                            <div className='online-indicator'></div>
                        </div>
                        <div className='header-info'>
                            <h3>{selectedUser?.fullName}</h3>
                            <p className='header-subtitle'>Active now</p>
                        </div>
                    </div>

                    <div className="header-right" ref={chatMenuRef}>
                        <button className="menu-dot-btn" onClick={() => setShowChatMenu(!showChatMenu)}>
                            <span className="material-symbols-rounded">more_vert</span>
                        </button>

                        {showChatMenu && (
                            <div className="bespoke-dropdown chat-menu animate-pop">
                                <div className="menu-item" onClick={handleClearChat}>
                                    <span className="material-symbols-rounded">mop</span> Clear Chat
                                </div>
                                <div className="menu-item" onClick={handleRemoveContact}>
                                    <span className="material-symbols-rounded">person_remove</span> Remove Contact
                                </div>
                                <div className="menu-divider"></div>
                                <div className="menu-item logout" onClick={handleBlockUser}>
                                    <span className="material-symbols-rounded">block</span> Block User
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='messages-area'>
                    {messages.map((msg, i) => {
                        const isSender = msg.senderId === currentUser?._id;
                        return (
                            <div key={msg._id || i} className={`message-group ${isSender ? 'sent' : 'received'}`}>
                                <div className='message-content'>
                                    <div className='message-bubble-premium'>
                                        {isSender && (
                                            <button 
                                                className="bubble-delete-btn" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteMessage(msg._id);
                                                }}
                                                title="Delete message"
                                            >
                                                <span className="material-symbols-rounded">delete</span>
                                            </button>
                                        )}

                                        {msg.image && <img src={msg.image} alt="shared" className="bubble-sent-image" onClick={() => window.open(msg.image, '_blank')} />}
                                        
                                        {msg.fileUrl && (
                                            <div className="file-attachment-bubble" onClick={() => window.open(msg.fileUrl, '_blank')}>
                                                <span className="material-symbols-rounded">description</span>
                                                <div className="file-info">
                                                    <p>{msg.fileName || "Attachment"}</p>
                                                    <span>Click to view</span>
                                                </div>
                                            </div>
                                        )}

                                        {msg.text && <p className="bubble-text">{msg.text}</p>}
                                        
                                        <span className='msg-time-inline'>
                                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollEnd}></div>
                </div>

                <div className='chat-input-section'>
                    {filePreview && (
                        <div className="image-preview-bubble">
                            {selectedFile?.type.startsWith("image/") ? <img src={filePreview} alt="Preview" /> : (
                                <div className="file-preview-generic">
                                    <span className="material-symbols-rounded">description</span>
                                    <p>{selectedFile?.name}</p>
                                </div>
                            )}
                            <button className="remove-preview" onClick={() => {setFilePreview(null); setSelectedFile(null);}}>
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                    )}
                    <div className='input-bar-modern'>
                        <button type="button" className="emoji-trigger" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
                        <input 
                            type="text" 
                            placeholder='Type your message...' 
                            className='modern-chat-input'
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <label htmlFor="file-up" className="icon-btn">
                            <span className="material-symbols-rounded">attach_file</span>
                            <input type="file" id='file-up' hidden onChange={handleFileChange} />
                        </label>
                        <button className={`send-btn-main ${(message.trim() || filePreview) ? 'active' : ''}`} onClick={handleSendMessage}>
                            <span className="material-symbols-rounded">send</span>
                        </button>
                    </div>
                    {showEmojiPicker && (
                        <div className="emoji-container-pos">
                            <EmojiPicker onEmojiClick={(e) => setMessage(prev => prev + e.emoji)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatContainer;