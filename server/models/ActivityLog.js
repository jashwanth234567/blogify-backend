import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: false }, // Null for guest actions like registering/submitting comment
        action: { type: String, required: true }, // e.g. login, logout, blog_create, comment_approve
        details: { type: String },
    },
    { timestamps: true }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
