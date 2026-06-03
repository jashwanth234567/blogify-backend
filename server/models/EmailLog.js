import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
    {
        to: { type: String, required: true },
        subject: { type: String, required: true },
        body: { type: String, required: true },
        status: { type: String, enum: ["success", "failed"], default: "success" },
        error: { type: String },
    },
    { timestamps: true }
);

const EmailLog = mongoose.model("EmailLog", emailLogSchema);

export default EmailLog;
