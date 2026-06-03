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
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // Only configure nodemailer if SMTP variables are provided and not placeholders
    if (host && user && pass && !isPlaceholder(user) && !isPlaceholder(pass)) {
        return nodemailer.createTransport({
            host,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
            auth: {
                user,
                pass,
            },
        });
    }
    // Fallback/Development mock transporter that logs to console
    return null;
};

// Common function to send email and log
export const sendEmail = async ({ to, subject, htmlBody }) => {
    const fromEmail = process.env.EMAIL_FROM || "no-reply@blogify.com";
    const transporter = getTransporter();

    let status = "success";
    let errorMsg = null;
    let isMock = !transporter;

    if (transporter) {
        try {
            await transporter.sendMail({
                from: `"Blogify Support" <${fromEmail}>`,
                to,
                subject,
                html: htmlBody,
            });
            console.log(`Email successfully sent to ${to}`);
        } catch (error) {
            console.error(`Failed to send email to ${to}:`, error);
            status = "failed";
            errorMsg = error.message;
        }
    } else {
        console.log(`[SMTP Not Configured/Placeholder] Logging email to database for ${to}:`);
        console.log(`Subject: ${subject}`);
        console.log(`Body Snippet: ${htmlBody.substring(0, 200)}...`);
    }

    // Save log to MongoDB EmailLog schema
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

    if (status === "failed") {
        return { success: false, error: errorMsg, mock: false };
    }
    return { success: true, mock: isMock };
};

// 1. Welcome Email Template
export const sendWelcomeEmail = async (userEmail, userName) => {
    const subject = `Welcome to Blogify, ${userName}!`;
    const htmlBody = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f3ff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.1);">
                <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 40px 20px; color: white;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">Welcome to Blogify</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">We're thrilled to have you join our creative space.</p>
                </div>
                <div style="padding: 40px 30px; text-align: left; color: #1f2937; line-height: 1.6;">
                    <p style="font-size: 18px; font-weight: 600; margin-top: 0; color: #7c3aed;">Hello ${userName},</p>
                    <p style="font-size: 15px;">Your account has been successfully created. Blogify is a premium space built for developers, writers, and thinkers to share ideas and connect.</p>
                    <p style="font-size: 15px;">Here is what you can do next:</p>
                    <ul style="padding-left: 20px; font-size: 14px; color: #4b5563; line-height: 1.8;">
                        <li>Customize your author profile page.</li>
                        <li>Use our **Gemini AI Generator** to co-write professional SEO-optimized articles.</li>
                        <li>Listen to any article via modern text-to-speech voice controls.</li>
                        <li>Translate your writing into Hindi, Tamil, Telugu, and more with one click.</li>
                    </ul>
                    <div style="text-align: center; margin: 30px 0 15px 0;">
                        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/author" style="background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; padding: 12px 30px; border-radius: 50px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">Go to Dashboard</a>
                    </div>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; border-t: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0 0 5px 0;">© 2026 Blogify GreatStack. All Rights Reserved.</p>
                    <p style="margin: 0;">If you did not register for this account, you can safely ignore this email.</p>
                </div>
            </div>
        </div>
    `;

    await sendEmail({ to: userEmail, subject, htmlBody });
};

// 2. Blog Published Template
export const sendBlogPublishedEmail = async (recipientEmail, recipientName, blogTitle, blogAuthor, blogId) => {
    const subject = `New Blog Published: "${blogTitle}"`;
    const blogUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/blog/${blogId}`;
    const htmlBody = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f3ff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.1);">
                <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 40px 20px; color: white;">
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Fresh Content</span>
                    <h1 style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; line-height: 1.3;">New Article on Blogify</h1>
                </div>
                <div style="padding: 40px 30px; text-align: left; color: #1f2937; line-height: 1.6;">
                    <p style="font-size: 16px; font-weight: 600; margin-top: 0; color: #7c3aed;">Hello ${recipientName},</p>
                    <p style="font-size: 15px;">A new article has just been published by <strong>${blogAuthor}</strong> on Blogify:</p>
                    
                    <div style="background-color: #f9fafb; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0; border-radius: 0 12px 12px 0;">
                        <h2 style="margin: 0; font-size: 18px; color: #111827;">${blogTitle}</h2>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Written by ${blogAuthor}</p>
                    </div>

                    <p style="font-size: 15px;">Be among the first to read, comment, translate, or listen to this new post!</p>
                    
                    <div style="text-align: center; margin: 30px 0 15px 0;">
                        <a href="${blogUrl}" style="background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; padding: 12px 30px; border-radius: 50px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">Read Article Now</a>
                    </div>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; border-t: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0 0 5px 0;">© 2026 Blogify GreatStack. All Rights Reserved.</p>
                    <p style="margin: 0;">You received this because you are a registered user of Blogify.</p>
                </div>
            </div>
        </div>
    `;

    await sendEmail({ to: recipientEmail, subject, htmlBody });
};

// 3. New Comment Notification Template (sent to Blog Author)
export const sendCommentAddedEmail = async (authorEmail, authorName, commentName, blogTitle, commentContent, blogId) => {
    const subject = `New Comment on your Blog: "${blogTitle}"`;
    const commentsUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/author/list-comment`;
    const htmlBody = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f3ff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.1);">
                <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 40px 20px; color: white;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">New Comment Alert</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 15px;">A reader has shared thoughts on your writing.</p>
                </div>
                <div style="padding: 40px 30px; text-align: left; color: #1f2937; line-height: 1.6;">
                    <p style="font-size: 16px; font-weight: 600; margin-top: 0; color: #7c3aed;">Hello ${authorName},</p>
                    <p style="font-size: 15px;"><strong>${commentName}</strong> left a comment on your blog post <strong style="color: #4b5563;">"${blogTitle}"</strong>:</p>
                    
                    <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0; border-radius: 0 12px 12px 0; font-style: italic; color: #4b5563;">
                        "${commentContent}"
                    </div>

                    <p style="font-size: 15px;">This comment is currently pending moderation. You can approve or delete it from your dashboard.</p>
                    
                    <div style="text-align: center; margin: 30px 0 15px 0;">
                        <a href="${commentsUrl}" style="background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; padding: 12px 30px; border-radius: 50px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">Manage Comments</a>
                    </div>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; border-t: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0 0 5px 0;">© 2026 Blogify GreatStack. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    `;

    await sendEmail({ to: authorEmail, subject, htmlBody });
};
