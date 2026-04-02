import express from "express";
import { protectRoute } from "../middleware/auth.js";
// Fixed: Added sendMessage to the import list
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage } from "../controllers/messageController.js";
import { editMessage, deleteMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);

// Fixed: Added the missing "/" before mark
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen); 

// This will now work because sendMessage is imported above
messageRouter.post("/send/:id", protectRoute, sendMessage);

messageRouter.put("/edit/:id", protectRoute, editMessage);
messageRouter.delete("/delete/:id", protectRoute, deleteMessage);

export default messageRouter;