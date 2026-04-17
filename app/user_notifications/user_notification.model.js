const mongoose = require("mongoose");

const userNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["new_property", "offer", "info", "system"],
      default: "info",
    },
    targetType: {
      type: String,
      enum: ["all", "specific"],
      default: "all",
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
    image: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

userNotificationSchema.index({ targetType: 1, createdAt: -1 });

module.exports = mongoose.model("UserNotification", userNotificationSchema);
