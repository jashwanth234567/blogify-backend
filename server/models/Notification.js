import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: false }, // If null, it's for all or admin
        message: { type: String, required: true },
        type: { type: String, enum: ["registration", "comment", "approval", "publication"], required: true },
        isRead: { type: Boolean, default: false },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user", default: [] }],
        link: { type: String },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
