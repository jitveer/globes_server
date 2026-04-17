const ScheduleVisit = require("./scheduleVisit.model");
const asyncHandler = require("../../shared/utils/asyncHandler.util");
const ApiResponse = require("../../shared/utils/ApiResponse.util");
const { createAdminNotification } = require("../notifications/admin_notification.service");

/**
 * Create a new scheduled visit
 * POST /api/v1/schedule-visit
 */
const createVisit = asyncHandler(async (req, res) => {
  const { name, email, phone, date, time, message } = req.body;

  // Validation
  if (!name || !email || !phone || !date || !time) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Name, Email, Phone, Date and Time are required",
        ),
      );
  }

  // Validate name (only letters and spaces, 2-50 chars)
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  if (!nameRegex.test(name)) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Please enter a valid name (only letters allowed)",
        ),
      );
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Please enter a valid email address"));
  }

  // Validate phone (Indian 10-digit starting with 6-9)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Please enter a valid 10-digit phone number",
        ),
      );
  }

  // Create the visit
  const visit = await ScheduleVisit.create({
    name,
    email,
    phone,
    date,
    time,
    message: message || "",
  });

  // Trigger notification for admin & superadmin
  await createAdminNotification({
    type: "visit_scheduled",
    title: "New Visit Scheduled",
    message: `${name} wants to visit on ${date} at ${time}`,
    recipientRole: "all",
    metadata: { visitId: visit._id, name, phone, email },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        visit,
        "Visit scheduled successfully! We will contact you soon.",
      ),
    );
});

/**
 * Get all scheduled visits (for Admin)
 * GET /api/v1/schedule-visit
 */
const getAllVisits = asyncHandler(async (req, res) => {
  const visits = await ScheduleVisit.find().sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, visits, "All scheduled visits fetched successfully"),
    );
});

/**
 * Update visit status (for Admin)
 * PATCH /api/v1/schedule-visit/:id
 */
const updateVisitStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid status value"));
  }

  const visit = await ScheduleVisit.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );

  if (!visit) {
    return res.status(404).json(new ApiResponse(404, null, "Visit not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, visit, "Visit status updated successfully"));
});

module.exports = {
  createVisit,
  getAllVisits,
  updateVisitStatus,
};
