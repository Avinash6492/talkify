import mongoose from "mongoose";

// Fixed variable name to userSchema
const messageSchema = new mongoose.Schema({
    senderId:{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    receiverId:{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    text:{type:String,},
    image:{type: String,},
    seen:{type: Boolean, default: false},
isEdited: { type: Boolean, default: false },
}, { timestamps: true });

// Fixed: Added the model name "User" and used the correct schema variable
const Message = mongoose.model("Message", messageSchema);
// Add this inside your messageSchema


export default Message;