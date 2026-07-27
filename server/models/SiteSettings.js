import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Blogify" },
    logoUrl: { type: String, default: "" },
    maintenanceMode: { type: Boolean, default: false },
    registrationEnabled: { type: Boolean, default: true },
    emailConfig: {
      smtpHost: { type: String, default: "smtp.gmail.com" },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: "" },
      emailFrom: { type: String, default: "noreply@blogify.com" }
    },
    securityConfig: {
      sessionTimeoutMinutes: { type: Number, default: 120 },
      maxFailedLoginAttempts: { type: Number, default: 5 },
      enable2FA: { type: Boolean, default: false }
    },
    storageConfig: {
      provider: { type: String, default: "Cloudinary" },
      maxUploadSizeMb: { type: Number, default: 10 }
    },
    backupHistory: [
      {
        fileName: { type: String },
        sizeBytes: { type: Number },
        status: { type: String, default: "completed" },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettings;
