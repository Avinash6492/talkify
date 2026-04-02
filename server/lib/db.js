import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('✅ Database Connected'));
        mongoose.connection.on('error', (err) => console.log('❌ Database Error:', err));
        
        // Use the URI from .env
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.log("❌ Connection Error:", error);
    }
}