import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: false }, // Recipient
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: false }, // Sender actor
        message: { type: String, required: true },
        type: { type: String, enum: ["registration", "comment", "like", "follow", "mention", "reply", "approval", "publication"], required: true },
        isRead: { type: Boolean, default: false },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user", default: [] }],
        link: { type: String },
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

