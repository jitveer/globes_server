const express = require("express");
const router = express.Router();

const userController = require("./user.controller");
const {
  protect,
  authorize,
} = require("../../shared/middlewares/auth.middleware");
const profileUpload = require("../../shared/middlewares/profileUpload.middleware");

// Protected routes - require authentication
router.use(protect);

// Update profile avatar
router.patch(
  "/avatar",
  profileUpload.single("avatar"),
  userController.updateAvatar,
);

// Get current user profile
router.get("/profile", userController.getProfile);

// Update current user profile
router.put("/profile", userController.updateProfile);

// Admin only routes
router.get("/", authorize("admin"), userController.getAllUsers);
router.get("/:id", authorize("admin"), userController.getUserById);
router.put("/:id", authorize("admin"), userController.updateUser);
router.delete("/:id", authorize("admin"), userController.deleteUser);

module.exports = router;
