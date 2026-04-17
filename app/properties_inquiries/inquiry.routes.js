const express = require("express");
const router = express.Router();
const inquiryController = require("./inquiry.controller");
const {
  contactLimiter,
} = require("../../shared/middlewares/rateLimiter.middleware");
const {
  protect,
  authorize,
} = require("../../shared/middlewares/auth.middleware");

// Route to request OTP (leads start here)
// Applied contactLimiter to prevent bot spamming OTP requests
router.post("/request-otp", contactLimiter, inquiryController.requestOTP);

// Route to verify OTP and submit the final inquiry
router.post("/verify-otp", contactLimiter, inquiryController.verifyOTP);

/**
 * Admin Routes
 */
router.use(protect);
router.use(authorize("admin", "superadmin"));

router.get("/", inquiryController.getAllInquiries);
router.patch("/:id/status", inquiryController.updateInquiryStatus);

module.exports = router;
