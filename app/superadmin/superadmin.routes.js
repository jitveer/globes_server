const express = require("express");
const router = express.Router();
const superAdminController = require("./superadmin.controller");
const { createAdminValidator } = require("./superadmin.validator");
const {
  protect,
  authorize,
} = require("../../shared/middlewares/auth.middleware");

// Apply authentication and authorization middleware to all routes
router.use(protect);
router.use(authorize("superadmin"));

// Super Admin Routes
router.get("/stats", superAdminController.getPlatformStats);
router.get("/health", superAdminController.getSystemHealth);

// User Management Routes
router.get("/users", superAdminController.getAllUsers);
router.patch("/users/:id/role", superAdminController.updateUserRole);
router.delete("/users/:id", superAdminController.deleteUser);

// Property Management Routes
router.patch("/properties/:id/verify", superAdminController.verifyProperty);

// Admin Management Routes
router.get("/admins", superAdminController.getAdmins);
router.post("/admins", createAdminValidator, superAdminController.createAdmin);
router.patch("/admins/:id/status", superAdminController.toggleAdminStatus);
router.delete("/admins/:id", superAdminController.deleteAdmin);
router.patch(
  "/admins/:id",
  createAdminValidator,
  superAdminController.updateAdmin,
);

module.exports = router;
