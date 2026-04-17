const userService = require("./user.service");
const asyncHandler = require("../../shared/utils/asyncHandler.util");
const ApiResponse = require("../../shared/utils/ApiResponse.util");
const fs = require("fs");
const path = require("path");
const { processImage } = require("../../shared/utils/imageProcessor.util");

// @desc    Update user avatar
// @route   PATCH /api/v1/users/avatar
// @access  Private
exports.updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Please upload an image"));
  }

  try {
    const user = await userService.getUserById(req.user.id);

    // 1. Process and Optimize image (Convert to WebP, Compress, keep dimensions)
    const processedFileName = await processImage(req.file.path, "profile");
    const avatarPath = `uploads/profile_img/${processedFileName}`;

    // 2. Delete old avatar if it exists and is different from the new one
    if (
      user.avatar &&
      user.avatar !== avatarPath &&
      user.avatar.startsWith("uploads/profile_img/")
    ) {
      const oldPath = path.join(process.cwd(), user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // 3. Update database with the new optimized path
    const updatedUser = await userService.updateUser(req.user.id, {
      avatar: avatarPath,
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedUser,
          "Profile image updated and optimized successfully",
        ),
      );
  } catch (error) {
    // If processing fails, clean up the original uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw error;
  }
});

// @desc    Get current user profile
// @route   GET /api/v1/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

// @desc    Update current user profile
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user.id, req.body);
  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});
