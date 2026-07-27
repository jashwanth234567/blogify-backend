import mongoose from "mongoose";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
export const ROLES = {
  USER: "USER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
};

export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];
export const STAFF_ROLES = [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN];

const userSchema = new mongoose.Schema(
  {
    // ─── Core Identity ────────────────────────────────────────────────────────
    name:        { type: String, required: true },
    displayName: { type: String, default: "" },   // Instagram-style display name
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:    { type: String, required: true },
    username:    { type: String, unique: true, sparse: true, lowercase: true, trim: true },

    // ─── Profile ──────────────────────────────────────────────────────────────
    image:       { type: String, default: "" },
    coverPhoto:  { type: String, default: "" },
    bio:         { type: String, default: "" },
    phone:       { type: String, default: "" },
    website:     { type: String, default: "" },
    location:    { type: String, default: "" },

    // ─── Role-Based Access Control ────────────────────────────────────────────
    role: {
      type: String,
      enum: ["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"],
      default: "USER",
    },
    // Legacy field kept for backward compat — derived from role
    isAdmin: { type: Boolean, default: false },
    // Legacy admin sub-role (kept for existing admin panel compatibility)
    adminRole: {
      type: String,
      enum: ["Super Admin", "Admin", "Moderator", "Support", ""],
      default: "",
    },

    // ─── Account Status ───────────────────────────────────────────────────────
    verified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "suspended", "blocked", "pending_verification", "deleted"],
      default: "active",
    },
    isBlocked:       { type: Boolean, default: false },
    blockReason:     { type: String, default: "" },
    isSuspended:     { type: Boolean, default: false },
    suspendedUntil:  { type: Date, default: null },
    suspensionReason:{ type: String, default: "" },
    isDeleted:       { type: Boolean, default: false },
    deletedAt:       { type: Date, default: null },

    // ─── Permissions (fine-grained, for moderation overrides) ─────────────────
    permissions: {
      canPost:    { type: Boolean, default: true },
      canComment: { type: Boolean, default: true },
      canMessage: { type: Boolean, default: true },
      canFollow:  { type: Boolean, default: true },
    },

    // ─── Social Stats ─────────────────────────────────────────────────────────
    followersCount:       { type: Number, default: 0 },
    followingCount:       { type: Number, default: 0 },
    totalLikesReceived:   { type: Number, default: 0 },
    totalViewsReceived:   { type: Number, default: 0 },
    totalCommentsReceived:{ type: Number, default: 0 },

    // ─── Security / Session ───────────────────────────────────────────────────
    lastLogin:    { type: Date },
    lastActive:   { type: Date },
    deviceInfo:   { type: String, default: "" },
    browserInfo:  { type: String, default: "" },
    ipAddress:    { type: String, default: "" },
    twoFactorSecret:    { type: String, default: "" },
    isTwoFactorEnabled: { type: Boolean, default: false },
    loginHistory: [
      {
        ip:        { type: String, default: "" },
        device:    { type: String, default: "" },
        browser:   { type: String, default: "" },
        userAgent: { type: String, default: "" },
        status:    { type: String, default: "success" },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // ─── Privacy & Notifications ──────────────────────────────────────────────
    privacySettings: {
      isPrivate: { type: Boolean, default: false },
    },
    notificationSettings: {
      likes:    { type: Boolean, default: true },
      follows:  { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
userSchema.virtual("isAdminUser").get(function () {
  return ["ADMIN", "SUPER_ADMIN"].includes(this.role) || this.isAdmin;
});

userSchema.virtual("isSuperAdminUser").get(function () {
  return this.role === "SUPER_ADMIN";
});

// ─────────────────────────────────────────────────────────────────────────────
// PRE-SAVE HOOK — keep isAdmin in sync with role
// ─────────────────────────────────────────────────────────────────────────────
userSchema.pre("save", function () {
  if (["ADMIN", "SUPER_ADMIN"].includes(this.role)) {
    this.isAdmin = true;
    if (!this.adminRole) {
      this.adminRole = this.role === "SUPER_ADMIN" ? "Super Admin" : "Admin";
    }
  } else if (this.role === "MODERATOR") {
    if (!this.adminRole) this.adminRole = "Moderator";
  } else {
    // Regular USER — ensure no admin flags
    if (!this.isAdmin) {
      this.adminRole = "";
    }
  }
  // Ensure displayName defaults to name
  if (!this.displayName) this.displayName = this.name;
});

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE INDEXES
// ─────────────────────────────────────────────────────────────────────────────
userSchema.index({ name: "text", username: "text", displayName: "text" });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });
userSchema.index({ isAdmin: 1 });
userSchema.index({ status: 1, role: 1 });
userSchema.index({ isBlocked: 1, isSuspended: 1 });

const User = mongoose.model("user", userSchema);
export default User;
