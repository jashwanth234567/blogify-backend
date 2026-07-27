import nodemailer from "nodemailer";
import EmailLog from "../models/EmailLog.js";

// Helper to check if a value is a placeholder
const isPlaceholder = (val) => {
    if (!val) return true;
    const lower = val.toLowerCase();
    return (
        lower.includes("your-gmail") ||
        lower.includes("your-email") ||
        lower.includes("example.com") ||
        lower === "your-gmail-address@gmail.com" ||
        lower === "your-gmail-app-password"
    );
};

// Helper to create transporter
const getTransporter = () => {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass && !isPlaceholder(user) && !isPlaceholder(pass)) {
        const cleanPass = pass.replace(/\s+/g, "");
        const port = parseInt(process.env.SMTP_PORT || "587");
        const isSecure = process.env.SMTP_SECURE === "true";

        return nodemailer.createTransport({
            host,
            port,
            secure: isSecure,
            family: 4, // Force IPv4 to avoid socket ECONNREFUSED on IPv6
            auth: {
                user: user.trim(),
                pass: cleanPass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    return null;
};

// Common function to send email and log
export const sendEmail = async ({ to, subject, htmlBody }) => {
    const sender = process.env.SMTP_USER ? `"Blogify Security" <${process.env.SMTP_USER.trim()}>` : `"Blogify Support" <${process.env.EMAIL_FROM || "no-reply@blogify.com"}>`;
    const transporter = getTransporter();

    let status = "success";
    let errorMsg = null;
    let isMock = !transporter;

    if (transporter) {
        try {
            const sendPromise = transporter.sendMail({
                from: sender,
                to,
                subject,
                html: htmlBody,
            });
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("SMTP send timed out after 5s")), 5000));
            await Promise.race([sendPromise, timeoutPromise]);
            console.log(`Email successfully sent to ${to} via Gmail SMTP`);
        } catch (error) {
            console.error(`Failed to send email to ${to}:`, error.message);
            status = "failed";
            errorMsg = error.message;
        }
    } else {
        console.log(`\n======================================================`);
        console.log(`[DEVELOPMENT EMAIL LOG] To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body Snippet: ${htmlBody.substring(0, 300)}...`);
        console.log(`======================================================\n`);
    }

    try {
        await EmailLog.create({
            to,
            subject,
            body: htmlBody,
            status,
            error: errorMsg,
        });
    } catch (dbErr) {
        console.error("Failed to write email log to database:", dbErr);
    }

    return { success: status === "success", mock: isMock };
};

// 1. OTP Email Template for Account Verification and Password Reset
export const sendOtpEmail = async (recipientEmail, recipientName, otpCode, purpose = "register") => {
    const isRegister = purpose === "register";
    const subject = isRegister 
        ? `${otpCode} is your Blogify Verification Code` 
        : `${otpCode} is your Blogify Password Reset Code`;

    const title = isRegister ? "Account Verification OTP" : "Password Reset Request";
    const message = isRegister 
        ? "Thank you for signing up for Blogify! Please use the 6-digit numeric verification code below to activate your account."
        : "We received a request to reset your Blogify account password. Use the 6-digit numeric code below to proceed.";

    const htmlBody = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f3ff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 550px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 40px rgba(124, 58, 237, 0.12);">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 36px 20px; color: white;">
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Security Verification</span>
                    <h1 style="margin: 12px 0 0 0; font-size: 24px; font-weight: 800;">${title}</h1>
                </div>
                <div style="padding: 36px 30px; text-align: center; color: #1e293b; line-height: 1.6;">
                    <p style="font-size: 16px; font-weight: 600; margin-top: 0; color: #4338ca;">Hello ${recipientName || "User"},</p>
                    <p style="font-size: 14px; color: #64748b; margin-bottom: 28px;">${message}</p>
                    
                    <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px; display: inline-block; margin: 10px 0 24px 0;">
                        <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #4f46e5; display: block; margin-left: 10px;">${otpCode}</span>
                    </div>

                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">⏱️ This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
                </div>
                <div style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
                    <p style="margin: 0 0 4px 0;">© 2026 Blogify GreatStack. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    `;

    return await sendEmail({ to: recipientEmail, subject, htmlBody });
};

// 2. Welcome Email Template
export const sendWelcomeEmail = async (userEmail, userName) => {
    const subject = `Welcome to Blogify, ${userName}!`;
    const htmlBody = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f3ff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.1);">
                <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 40px 20px; color: white;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to Blogify</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">We're thrilled to have you join our creative space.</p>
                </div>
                <div style="padding: 40px 30px; text-align: left; color: #1f2937; line-height: 1.6;">
                    <p style="font-size: 18px; font-weight: 600; margin-top: 0; color: #7c3aed;">Hello ${userName},</p>
                    <p style="font-size: 15px;">Your account has been successfully verified and activated!</p>
                    <div style="text-align: center; margin: 30px 0 15px 0;">
                        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/author" style="background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; padding: 12px 30px; border-radius: 50px; font-weight: 600; text-decoration: none; display: inline-block;">Go to Dashboard</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    return await sendEmail({ to: userEmail, subject, htmlBody });
};

// 3. Blog Published Template
export const sendBlogPublishedEmail = async (recipientEmail, recipientName, blogTitle, blogAuthor, blogId) => {
    const subject = `New Blog Published: "${blogTitle}"`;
    const blogUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/blog/${blogId}`;
    const htmlBody = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f3ff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 30px 20px; color: white;">
                    <h1 style="margin: 0; font-size: 22px;">New Article Published</h1>
                </div>
                <div style="padding: 30px; text-align: left; color: #1f2937;">
                    <p>Hello ${recipientName},</p>
                    <p>A new article <strong>"${blogTitle}"</strong> has been published by ${blogAuthor}.</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${blogUrl}" style="background: #7c3aed; color: white; padding: 10px 24px; border-radius: 30px; text-decoration: none; font-weight: bold;">Read Article</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    return await sendEmail({ to: recipientEmail, subject, htmlBody });
};

// 4. Comment Notification Template
export const sendCommentAddedEmail = async (authorEmail, authorName, commentName, blogTitle, commentContent, blogId) => {
    const subject = `New Comment on your Blog: "${blogTitle}"`;
    const commentsUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/author/list-comment`;
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Comment Alert</h2>
            <p>Hello ${authorName}, <strong>${commentName}</strong> commented on "${blogTitle}":</p>
            <blockquote style="background: #f1f5f9; padding: 10px; border-left: 3px solid #7c3aed;">${commentContent}</blockquote>
            <p><a href="${commentsUrl}">Manage Comments</a></p>
        </div>
    `;

    return await sendEmail({ to: authorEmail, subject, htmlBody });
};
