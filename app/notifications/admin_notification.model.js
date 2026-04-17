const mongoose = require("mongoose");

const adminNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "visit_scheduled",
        "inquiry_received",
        "system",
        "user_registered",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    recipientRole: {
      type: String,
      enum: ["admin", "superadmin", "all"],
      default: "all",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "admin_notifications", // Explicitly set collection name
  },
);

adminNotificationSchema.index({ recipientRole: 1, isRead: 1 });

module.exports = mongoose.model("AdminNotification", adminNotificationSchema);
