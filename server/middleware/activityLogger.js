import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async (userId, action, details = "") => {
    try {
        await ActivityLog.create({
            user: userId || null,
            action,
            details,
        });
        console.log(`Activity logged: [${action}] by user ${userId || "Guest"}. Details: ${details}`);
    } catch (error) {
        console.error("Failed to log activity:", error.message);
    }
};
