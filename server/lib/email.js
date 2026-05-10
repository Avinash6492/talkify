import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

    port: 465,

    secure: true,

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS,

    },

});

transporter.verify((error, success) => {

    if (error) {

        console.log("SMTP ERROR:", error);

    } else {

        console.log("SMTP SERVER READY");
    }
});

export const sendOtpEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Talkify Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your Talkify Account",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #6366f1; text-align: center;">Welcome to Talkify!</h2>
                    <p>Hello,</p>
                    <p>Thank you for joining Talkify. To complete your signup, please use the following 6-digit One-Time Password (OTP):</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e1b4b; background: #f3f4f6; padding: 10px 20px; border-radius: 5px;">
                            ${otp}
                        </span>
                    </div>
                    <p style="color: #6b7280; font-size: 12px; text-align: center;">
                        This code will expire in 10 minutes. If you did not request this, please ignore this email.
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
    } catch (error) {
        console.error("Email send error:", error);
    }
};

dotenv.config();
// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS:", process.env.EMAIL_PASS);