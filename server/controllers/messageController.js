import Message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// 1. Get ONLY users with existing chat history for sidebar
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const communicatedUsers = await Message.distinct("senderId", { receiverId: userId });
        const sentToUsers = await Message.distinct("receiverId", { senderId: userId });
        const chatPartnerIds = [...new Set([...communicatedUsers, ...sentToUsers])];

        const filteredUsers = await User.find({ 
            _id: { $in: chatPartnerIds, $ne: userId } 
        }).select("-password");

        const unseenCounts = await Message.aggregate([
            { $match: { receiverId: userId, seen: false } },
            { $group: { _id: "$senderId", count: { $sum: 1 } } }
        ]);

        const unseenMessages = {};
        unseenCounts.forEach(item => {
            unseenMessages[item._id.toString()] = item.count;
        });

        res.json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 2. Search Users by Username
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const myId = req.user._id;
        if (!query) return res.json({ success: true, users: [] });

        const users = await User.find({
            _id: { $ne: myId },
            username: { $regex: query, $options: "i" } 
        }).select("-password").limit(10);

        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 3. Get chat history
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;
        
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ]
        }).sort({ createdAt: -1 }).limit(50); 

        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false }, 
            { seen: true }
        );

        res.json({ success: true, messages: messages.reverse() }); 
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 4. Send a new message (Keeps your full logic)
export const sendMessage = async (req, res) => {
    try {
        const { text, image, fileUrl, fileName, groupId } = req.body;
        const { id: receiverId } = req.params; 
        const senderId = req.user._id;

        let uploadedImageUrl = "";
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            uploadedImageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId: groupId ? null : receiverId,
            groupId: groupId || null,
            text,
            image: uploadedImageUrl,
            fileUrl: fileUrl || null,
            fileName: fileName || null
        });

        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json({ success: true, newMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Delete single message
export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id);
        if (message.senderId.toString() !== req.user._id.toString()) return res.status(401).json({ message: "Unauthorized" });
        await Message.findByIdAndDelete(id);
        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Clear Chat history (New)
export const clearChat = async (req, res) => {
    try {
        const { id: contactId } = req.params;
        const myId = req.user._id;
        await Message.deleteMany({
            $or: [
                { senderId: myId, receiverId: contactId },
                { senderId: contactId, receiverId: myId }
            ]
        });
        res.json({ success: true, message: "Cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Block User (New)
export const toggleBlockUser = async (req, res) => {
    try {
        const { id: contactId } = req.params;
        const user = await User.findById(req.user._id);
        const isBlocked = user.blockedUsers.includes(contactId);
        isBlocked ? user.blockedUsers.pull(contactId) : user.blockedUsers.push(contactId);
        await user.save();
        res.json({ success: true, isBlocked: !isBlocked });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// 8. Edit an existing message
export const editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { newText } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Ensure only the sender can edit
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        message.text = newText;
        message.isEdited = true;
        await message.save();

        // Notify the receiver via Socket.io if they are online
        const receiverSocketId = userSocketMap[message.receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageUpdated", message);
        }

        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 9. Mark a specific message as seen
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};