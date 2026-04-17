const AdminNotification = require("./admin_notification.model");
const asyncHandler = require("../../shared/utils/asyncHandler.util");
const ApiResponse = require("../../shared/utils/ApiResponse.util");

/**
 * Get unified notifications for admin/superadmin
 * Support both internal logs (visited, inquiry) and custom broadcasts
 */
const getAdminNotifications = asyncHandler(async (req, res) => {
  const userRole = req.user.role;

  const filter = {
    recipientRole: { $in: [userRole, "all"] },
  };

  const notifications = await AdminNotification.find(filter)
    .sort({ createdAt: -1 })
    .limit(100);

  return res.status(200).json(new ApiResponse(200, notifications, "Admin Notifications fetched"));
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const userRole = req.user.role;

  const count = await AdminNotification.countDocuments({
    recipientRole: { $in: [userRole, "all"] },
    isRead: false,
  });

  return res.status(200).json(new ApiResponse(200, { count }, "Unread count fetched"));
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await AdminNotification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true },
  );

  if (!notification) {
    return res.status(404).json(new ApiResponse(404, null, "Notification not found"));
  }

  return res.status(200).json(new ApiResponse(200, notification, "Marked as read"));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const userRole = req.user.role;

  await AdminNotification.updateMany(
    {
      recipientRole: { $in: [userRole, "all"] },
      isRead: false,
    },
    { isRead: true },
  );

  return res.status(200).json(new ApiResponse(200, null, "All marked read"));
});

module.exports = {
  getAdminNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
