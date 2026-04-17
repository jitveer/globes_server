const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const {
  protect,
  authorize,
} = require("../../shared/middlewares/auth.middleware");

// Apply protection to all Admin routes
// Only users with 'admin' or 'superadmin' roles can access these
router.use(protect);
router.use(authorize("admin", "superadmin"));

/**
 * Admin Portal Specific Routes
 */
router.get("/stats", adminController.getAdminStats);

module.exports = router;
