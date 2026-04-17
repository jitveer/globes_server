const express = require("express");
const router = express.Router();

// Import feature routes
const authRoutes = require("./app/auth/auth.routes");
const userRoutes = require("./app/users/user.routes.js");
const propertyRoutes = require("./app/properties/properties.routes");
const superAdminRoutes = require("./app/superadmin/superadmin.routes");
const adminRoutes = require("./app/admin/admin.routes");
const blogRoutes = require("./app/blogs/blog.routes");
const inquiryRoutes = require("./app/properties_inquiries/inquiry.routes");
const wishlistRoutes = require("./app/wishlist/wishlist.routes");
const scheduleVisitRoutes = require("./app/schedule_visit/scheduleVisit.routes");
const adminNotificationRoutes = require("./app/notifications/admin_notification.routes");
const userNotificationRoutes = require("./app/user_notifications/user_notification.routes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/properties", propertyRoutes);
router.use("/superadmin", superAdminRoutes);
router.use("/admin", adminRoutes);
router.use("/blogs", blogRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/schedule-visit", scheduleVisitRoutes);
router.use("/admin-notifications", adminNotificationRoutes);
router.use("/user-notifications", userNotificationRoutes);

module.exports = router;
