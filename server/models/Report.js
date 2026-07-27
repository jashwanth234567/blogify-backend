import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    targetType: { type: String, enum: ["blog", "comment", "user"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: ["Spam", "Harassment", "Violence", "Fake News", "Adult Content", "Scam", "Other"],
      required: true
    },
    details: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    resolutionNotes: { type: String, default: "" },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

reportSchema.index({ targetId: 1, targetType: 1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporter: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
