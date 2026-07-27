import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    adminName: { type: String, required: true },
    adminRole: { type: String, default: "Admin" },
    action: { type: String, required: true }, // e.g. SUSPEND_USER, DELETE_POST, UPDATE_SETTINGS
    targetType: {
      type: String,
      enum: ["user", "post", "comment", "report", "setting", "system"],
      required: true
    },
    targetId: { type: String, default: "" },
    targetName: { type: String, default: "" },
    details: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    device: { type: String, default: "" },
    browser: { type: String, default: "" }
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ admin: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ targetType: 1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
