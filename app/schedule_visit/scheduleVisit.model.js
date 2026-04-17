const mongoose = require("mongoose");

const scheduleVisitSchema = new mongoose.Schema(
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
    date: {
      type: String,
      required: [true, "Preferred date is required"],
    },
    time: {
      type: String,
      required: [true, "Preferred time is required"],
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
scheduleVisitSchema.index({ email: 1, phone: 1 });
scheduleVisitSchema.index({ status: 1 });
scheduleVisitSchema.index({ date: 1 });

module.exports = mongoose.model("ScheduleVisit", scheduleVisitSchema);
