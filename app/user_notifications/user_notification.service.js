const UserNotification = require("./user_notification.model");

/**
 * Broadcast a notification to all users or specific ones
 */
const sendUserNotification = async ({
  title,
  message,
  type = "info",
  targetType = "all",
  recipients = [],
  image = "",
  link = "",
}) => {
  try {
    const notification = await UserNotification.create({
      title,
      message,
      type,
      targetType,
      recipients,
      image,
      link,
    });
    return notification;
  } catch (error) {
    console.error("Failed to send user notification:", error.message);
    return null;
  }
};

module.exports = { sendUserNotification };
