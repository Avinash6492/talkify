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

// --- Socket.io Setup ---
export const io = new Server(httpServer, {
    cors: { 
        origin: "http://localhost:5173", // 👈 Ensure this matches your Vite port
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

    // --- GROUP CHAT ROOMS ---
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

    // --- TYPING INDICATORS ---
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

// --- Middleware ---
app.use(express.json({ limit: "4mb" }));

// 🛠️ Fixed CORS: Required for withCredentials: true in Axios
app.use(cors({
    origin: "http://localhost:5173", // 👈 Change to your frontend URL
    credentials: true
}));

// --- Database Connection ---
connectDB(); 

// --- API Routes ---
app.get("/api/status", (req, res) => res.send("Server is live"));

// 🚀 Option B: Updated prefix from /api/auth to /api/users
app.use("/api/users", userRouter); 
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log("🚀 Server running on PORT: " + PORT));