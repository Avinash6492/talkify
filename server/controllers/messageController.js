import Message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// 1. Get all users for sidebar with optimized unseen counts
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find all users except the logged-in user
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        // 🚀 High-Performance Aggregation: Get all unseen counts in one database call
        const unseenCounts = await Message.aggregate([
            { 
                $match: { 
                    receiverId: userId, 
                    seen: false 
                } 
            },
            { 
                $group: { 
                    _id: "$senderId", 
                    count: { $sum: 1 } 
                } 
            }
        ]);

        // Convert aggregation array to a clean mapping object: { senderId: count }
        const unseenMessages = {};
        unseenCounts.forEach(item => {
            unseenMessages[item._id.toString()] = item.count;
        });

        res.json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        console.error("Error in getUsersForSidebar:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// 2. Get chat history between two users
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;
        
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ]
        })
        .sort({ createdAt: -1 }) // Get latest first for limiting
        .limit(50); 

        // Mark all messages from the selected user to me as 'seen'
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false }, 
            { seen: true }
        );

        // Reverse to return in chronological order (oldest -> newest)
        res.json({ success: true, messages: messages.reverse() }); 
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 3. Send a new message (Private or Group)
export const sendMessage = async (req, res) => {
    try {
        const { text, image, groupId } = req.body;
        const { id: receiverId } = req.params; 
        const senderId = req.user._id;

        let imageUrl = "";
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId: groupId ? null : receiverId,
            groupId: groupId || null,
            text,
            image: imageUrl
        });

        // 📡 Real-time Emission
        if (groupId) {
            // Emit to the room (Everyone in the group)
            io.to(groupId).emit("newGroupMessage", newMessage);
        } else {
            // Emit to the specific receiver if online
            const receiverSocketId = userSocketMap[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", newMessage);
            }
        }

        res.status(201).json({ success: true, newMessage });
    } catch (error) {
        console.error("Error in sendMessage:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Mark a specific message as seen
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 5. Edit an existing message
export const editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { newText } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Security check: Only sender can edit
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        message.text = newText;
        message.isEdited = true;
        await message.save();

        // 📡 Real-time Update Emission
        if (message.groupId) {
            io.to(message.groupId.toString()).emit("messageUpdated", message);
        } else {
            const receiverSocketId = userSocketMap[message.receiverId];
            if (receiverSocketId) io.to(receiverSocketId).emit("messageUpdated", message);
        }

        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Delete a message
export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Security check: Only sender can delete
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await Message.findByIdAndDelete(id);

        // 📡 Real-time Delete Emission
        if (message.groupId) {
            io.to(message.groupId.toString()).emit("messageDeleted", id);
        } else {
            const receiverSocketId = userSocketMap[message.receiverId];
            if (receiverSocketId) io.to(receiverSocketId).emit("messageDeleted", id);
        }

        res.json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};