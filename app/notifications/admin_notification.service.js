const AdminNotification = require("./admin_notification.model");

/**
 * Helper to create admin-facing logs/notifications
 * (User registration, inquiries, etc.)
 */
const createAdminNotification = async ({
  type,
  title,
  message,
  recipientRole = "all",
  metadata = {},
}) => {
  try {
    const notification = await AdminNotification.create({
      type,
      title,
      message,
      recipientRole,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error("Failed to create admin notification:", error.message);
    return null;
  }
};

module.exports = { createAdminNotification };
