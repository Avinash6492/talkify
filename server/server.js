import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js"; 
import userRouter from "./Routes/userRouter.js";
import messageRouter from "./Routes/messageRouter.js";
import groupRouter from "./Routes/groupRouter.js";
import { Server } from "socket.io"; 

const app = express();
const httpServer = http.createServer(app); 

// ✅ Use environment variable with fallback
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

export const io = new Server(httpServer, {
    cors: { 
        origin: CORS_ORIGIN,
        credentials: true 
    }
});

export const userSocketMap = {}; 

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== "undefined") {
        console.log("User Connected:", userId);
        userSocketMap[userId] = socket.id;
    }

    socket.on("joinGroup", (groupId) => {
        socket.join(groupId);
        console.log(`User ${userId} joined room: ${groupId}`);
    });

    socket.on("leaveGroup", (groupId) => {
        socket.leave(groupId);
    });

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User Disconnected:", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    socket.on("typing", ({ receiverId, groupId, isGroup }) => {
        if (isGroup && groupId) {
            socket.to(groupId).emit("userTyping", { 
                userId: userId, 
                groupId: groupId, 
                isGroup: true 
            });
        } else if (receiverId) {
            const receiverSocketId = userSocketMap[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", { 
                    userId: userId, 
                    isGroup: false 
                });
            }
        }
    });

    socket.on("stopTyping", ({ receiverId, groupId, isGroup }) => {
        if (isGroup && groupId) {
            socket.to(groupId).emit("userStoppedTyping", { userId: userId, groupId });
        } else if (receiverId) {
            const receiverSocketId = userSocketMap[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userStoppedTyping", { userId: userId });
            }
        }
    });
});

app.use(express.json({ limit: "4mb" }));

// ✅ Use environment variable with fallback
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));

connectDB(); 

app.get("/api/status", (req, res) => res.send("Server is live"));

app.use("/api/users", userRouter); 
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log("🚀 Server running on PORT: " + PORT));