const express = require("express");
const router = express.Router();
const adminNotificationController = require("./admin_notification.controller");
const { protect, authorize } = require("../../shared/middlewares/auth.middleware");

// Unified admin notification center (internal logs only)
router.use(protect);
router.use(authorize("admin", "superadmin"));

router.get("/", adminNotificationController.getAdminNotifications);
router.get("/unread-count", adminNotificationController.getUnreadCount);
router.patch("/:id/read", adminNotificationController.markAsRead);
router.patch("/mark-all-read", adminNotificationController.markAllAsRead);

module.exports = router;
