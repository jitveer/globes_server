const inquiryService = require("./inquiry.service");
const asyncHandler = require("../../shared/utils/asyncHandler.util");
const ApiResponse = require("../../shared/utils/ApiResponse.util");

/**
 * Controller to handle OTP request
 * POST /api/v1/inquiries/request-otp
 */
const requestOTP = asyncHandler(async (req, res) => {
  const { name, email, phone, message, propertyId } = req.body;

  // 1. Basic check if all fields are present
  if (!name || !email || !phone || !message) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All fields are required"));
  }

  // 2. Call service to generate and send OTP
  const result = await inquiryService.generateAndSendOTP({
    name,
    email,
    phone,
    message,
    propertyId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verification OTP sent to your email"));
});

/**
 * Controller to verify OTP and submit inquiry
 * POST /api/v1/inquiries/verify-otp
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Email and OTP are required"));
  }

  // 1. Verify OTP using service
  const inquiry = await inquiryService.verifyAndFinalizeInquiry(email, otp);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        inquiry,
        "Inquiry submitted successfully. We will contact you soon!",
      ),
    );
});

/**
 * Controller to get all verified inquiries (Admin Only)
 * GET /api/v1/inquiries
 */
const getAllInquiries = asyncHandler(async (req, res) => {
  const inquiries = await inquiryService.getAllInquiries();

  return res
    .status(200)
    .json(new ApiResponse(200, inquiries, "Inquiries fetched successfully"));
});

/**
 * Controller to update inquiry status
 * PATCH /api/v1/inquiries/:id/status
 */
const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Status is required"));
  }

  const inquiry = await inquiryService.updateInquiryStatus(id, status);

  return res
    .status(200)
    .json(new ApiResponse(200, inquiry, "Inquiry status updated successfully"));
});

module.exports = {
  requestOTP,
  verifyOTP,
  getAllInquiries,
  updateInquiryStatus,
};