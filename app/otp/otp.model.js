const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    },
  },
  { timestamps: true }
);

// Add TTL index to automatically delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
