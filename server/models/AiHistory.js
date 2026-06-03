import mongoose from "mongoose";

const aiHistorySchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: false },
        prompt: { type: String, required: true },
        generatedContent: { type: String, required: true },
        type: { type: String, enum: ["blog", "summary", "translation", "title"], required: true },
    },
    { timestamps: true }
);

const AiHistory = mongoose.model("AiHistory", aiHistorySchema);

export default AiHistory;
