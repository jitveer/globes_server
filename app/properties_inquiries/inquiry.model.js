const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: false, // Optional, can be a general inquiry
    },
    otp: {
      type: String,
      select: false, // Don't return OTP in API responses by default
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "closed"],
      default: "pending",
    },
    ipAddress: String, // For bot protection tracking
    userAgent: String,
  },
  {
    timestamps: true,
  },
);

// Indexing for faster searches
inquirySchema.index({ email: 1, phone: 1 });
inquirySchema.index({ status: 1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
