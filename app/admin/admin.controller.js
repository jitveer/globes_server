const asyncHandler = require("../../shared/utils/asyncHandler.util");
const ApiResponse = require("../../shared/utils/ApiResponse.util");
const User = require("../users/user.model");

/**
 * Get simple stats for the Admin Dashboard
 */
exports.getAdminStats = asyncHandler(async (req, res) => {
  // Typical admin might only see their assigned properties or general platform stats
  // For now, let's return some dummy data to simulate a working dashboard
  const stats = {
    totalProperties: 124,
    newLeads: 12,
    activeTasks: 5,
    systemStatus: "Healthy",
  };

  res
    .status(200)
    .json(new ApiResponse(200, stats, "Admin stats fetched successfully"));
});
