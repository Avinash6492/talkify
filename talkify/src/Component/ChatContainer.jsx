import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import assets from "../assets/assets";
import PrivacyPrompt from "./PrivacyPrompt"; 
import axiosInstance from '../Config/axios';
import { io } from "socket.io-client";
import "./ChatContainer.css";

const socket = io("http://localhost:5000", {
    query: { userId: JSON.parse(localStorage.getItem("userData"))?._id }
});

const ChatContainer = ({ selectedUser, setSelectedUser, onHeaderDoubleClick }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [privacyStatus, setPrivacyStatus] = useState("pending");
    
    const scrollEnd = useRef();
    const chatMenuRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem("userData"));

    // 🛡️ Privacy Logic
    const isReceiver = messages.length > 0 && messages[0].receiverId === currentUser?._id;
    const showPrivacy = isReceiver && privacyStatus === "pending";

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm("Delete this message for everyone?")) return;
        try {
            const res = await axiosInstance.delete(`/messages/delete/${messageId}`);
            if (res.data.success) {
                setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
            }
        } catch (err) { console.error("Delete error:", err); }
    };

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedUser) return;
            try {
                const res = await axiosInstance.get(`/messages/${selectedUser._id}`);
                setMessages(res.data.messages || []);
            } catch (err) { console.error("Load error:", err); }
        };
        fetchMessages();
        setPrivacyStatus("pending");
    }, [selectedUser]);

    useEffect(() => {
        const handleNewMessage = (newMsg) => {
            const isRelevant = 
                (newMsg.senderId === selectedUser?._id && newMsg.receiverId === currentUser?._id) ||
                (newMsg.senderId === currentUser?._id && newMsg.receiverId === selectedUser?._id);
            if (isRelevant) setMessages((prev) => [...prev, newMsg]);
        };
        socket.on("newMessage", handleNewMessage);
        socket.on("messageDeleted", (id) => setMessages((prev) => prev.filter(m => m._id !== id)));
        return () => { socket.off("newMessage"); socket.off("messageDeleted"); };
    }, [selectedUser, currentUser?._id]);

    useEffect(() => {
        scrollEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showEmojiPicker]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        try {
            await axiosInstance.post(`/messages/send/${selectedUser._id}`, { text: message });
            setMessage(""); 
            setShowEmojiPicker(false);
        } catch (err) { console.error("Send error:", err); }
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
        <div className='chat-container'>
            {/* 🔴 HEADER: flex-shrink: 0 keeps this sticky */}
            <div className='chat-header' onDoubleClick={onHeaderDoubleClick}>
                <div className='header-left' onClick={() => setSelectedUser(null)}>
                    <img src={assets.arrow_icon} alt="back" className='mobile-back-icon' />
                    <div className='avatar-wrapper'>
                        <img src={selectedUser.profilePic || assets.avatar_icon} alt="pfp" className='header-avatar' />
                        <div className='online-indicator'></div>
                    </div>
                    <div className='header-info'>
                        <h3>{selectedUser.fullName}</h3>
                        <p className='header-subtitle'>Active now</p>
                    </div>
                </div>
                <div className='header-actions' ref={chatMenuRef}>
                    <span className="material-symbols-rounded menu-trigger" onClick={() => setShowChatMenu(!showChatMenu)}>more_vert</span>
                    {showChatMenu && (
                        <div className="chat-bespoke-dropdown animate-in-up">
                            <div className="chat-menu-item danger" onClick={() => setSelectedUser(null)}>
                                <span className="material-symbols-rounded">person_remove</span> Remove Connection
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔵 MESSAGES: flex: 1 + overflow-y: auto makes this the only scrollable part */}
            <div className='messages-area'>
                <div className='date-divider'><span>Today</span></div>
                {showPrivacy && (
                    <PrivacyPrompt onAccept={() => setPrivacyStatus("accepted")} onBlock={() => setSelectedUser(null)} />
                )}
                {messages.map((msg, i) => {
                    const isSender = msg.senderId === currentUser?._id;
                    return (
                        <div key={msg._id || i} className={`message-group ${isSender ? 'sent' : 'received'}`}>
                            <div className='message-content'>
                                <div className='message-bubble-premium'>
                                    {msg.text}
                                    {isSender && (
                                        <span className="material-symbols-rounded delete-msg-btn" onClick={() => handleDeleteMessage(msg._id)}>delete</span>
                                    )}
                                    <span className='msg-time-inline'>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        {isSender && <span className="read-receipt">{msg.seen ? "✓✓" : "✓"}</span>}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollEnd}></div>
            </div>

            {/* 🟢 INPUT: flex-shrink: 0 keeps this sticky at the bottom */}
            {!showPrivacy && (
                <div className='chat-input-section'>
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
                        {/* 🛠️ RESTORED: Media/Attachment Icon */}
                        <label htmlFor="file-up" className="icon-btn">
                            <span className="material-symbols-rounded">attach_file</span>
                            <input type="file" id='file-up' hidden />
                        </label>
                        <button className={`send-btn-main ${message.trim() ? 'active' : ''}`} onClick={handleSendMessage}>
                            <span className="material-symbols-rounded">send</span>
                        </button>
                    </div>
                    {showEmojiPicker && (
                        <div className="emoji-picker-container">
                             <EmojiPicker onEmojiClick={(d) => setMessage(p => p + d.emoji)} theme="dark" width={300} height={400} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ChatContainer;