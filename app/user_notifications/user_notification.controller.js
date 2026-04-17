const UserNotification = require("./user_notification.model");
const asyncHandler = require("../../shared/utils/asyncHandler.util");
const ApiResponse = require("../../shared/utils/ApiResponse.util");
const { getIO } = require("../../shared/config/socket.config");

/**
 * Admin: Send a new notification to users
 */
const sendNotification = asyncHandler(async (req, res) => {
  const { title, message, type, targetType, recipients, image, link } =
    req.body;

  if (!title || !message) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Title and Message are required"));
  }

  const notification = await UserNotification.create({
    title,
    message,
    type: type || "info",
    targetType: targetType || "all",
    recipients: targetType === "specific" ? recipients : [],
    image,
    link,
  });

  // Emit Real-time via Socket.io
  const io = getIO();
  if (targetType === "all") {
    io.emit("new-notification", notification);
  } else if (recipients && Array.isArray(recipients)) {
    recipients.forEach((uid) => {
      io.to(uid.toString()).emit("new-notification", notification);
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, notification, "Notification sent successfully"));
});

/**
 * User: Get notifications for logged-in user
 */
const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log(`Fetching notifications for: ${userId}`);

  const notifications = await UserNotification.find({
    $or: [{ targetType: "all" }, { recipients: { $in: [userId] } }],
  }).sort({ createdAt: -1 });

  console.log(`Fetched ${notifications.length} notifications`);
  if (notifications.length > 0) {
    console.log(
      `First Notif readBy include ${userId}?: ${notifications[0].readBy.includes(userId)}`,
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notifications, "Notifications fetched"));
});

/**
 * User: Mark a notification as read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  console.log(`Marking as read: notifId=${id}, userId=${userId}`);

  const notification = await UserNotification.findByIdAndUpdate(
    id,
    { $addToSet: { readBy: userId } },
    { new: true },
  );

  if (!notification) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Notification not found"));
  }

  console.log(
    `Updated notification readBy length: ${notification.readBy.length}`,
  );

  // Emit Real-time via Socket.io to all user's devices
  const io = getIO();
  io.to(userId.toString()).emit("notification-read", {
    userId: userId.toString(),
    notificationId: id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Marked as read"));
});

module.exports = {
  sendNotification,
  getMyNotifications,
  markAsRead,
};
