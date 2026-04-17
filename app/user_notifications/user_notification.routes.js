const express = require("express");
const router = express.Router();
const userNotificationController = require("./user_notification.controller");
const {
  protect,
  authorize,
} = require("../../shared/middlewares/auth.middleware");

// All routes require authentication
router.use(protect);

// User: Get notifications & mark as read
router.get("/", userNotificationController.getMyNotifications);
router.patch("/:id/read", userNotificationController.markAsRead);

// Admin: Send custom notification
router.post(
  "/send",
  authorize("admin", "superadmin"),
  userNotificationController.sendNotification,
);

module.exports = router;
