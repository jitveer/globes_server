const User = require("../users/user.model");
const Property = require("../properties/properties.model");
const ApiResponse = require("../../shared/utils/ApiResponse.util");
const asyncHandler = require("../../shared/utils/asyncHandler.util");
const mongoose = require("mongoose");

// @desc    Get global platform stats
// @route   GET /api/superadmin/stats
// @access  Private/SuperAdmin
exports.getPlatformStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProperties = await Property.countDocuments();

  const roleBreakdown = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  const stats = {
    totalUsers,
    totalProperties,
    roleBreakdown,
    systemInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
  };

  res
    .status(200)
    .json(new ApiResponse(200, stats, "Platform stats fetched successfully"));
});

// @desc    Get all users with advanced filtering
// @route   GET /api/superadmin/users
// @access  Private/SuperAdmin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort("-createdAt");
  res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});

// @desc    Update user role
// @route   PATCH /api/superadmin/users/:id/role
// @access  Private/SuperAdmin
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  user.role = role;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, user, `User role updated to ${role}`));
});

// @desc    Delete user
// @route   DELETE /api/superadmin/users/:id
// @access  Private/SuperAdmin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  // Prevent deleting self
  if (user._id.toString() === req.user._id.toString()) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "You cannot delete yourself"));
  }

  await user.deleteOne();
  res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

// @desc    Check system health
// @route   GET /api/superadmin/health
// @access  Private/SuperAdmin
exports.getSystemHealth = asyncHandler(async (req, res) => {
  const health = {
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    server: "Running",
    timestamp: new Date(),
  };
  res.status(200).json(new ApiResponse(200, health, "System health report"));
});

// @desc    Approve/Verify property
// @route   PATCH /api/superadmin/properties/:id/verify
// @access  Private/SuperAdmin
exports.verifyProperty = asyncHandler(async (req, res) => {
  const { isVerified } = req.body;
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Property not found"));
  }

  property.isVerified = isVerified;
  await property.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        property,
        `Property verification status updated to ${isVerified}`,
      ),
    );
});

// @desc    Create a new admin
// @route   POST /api/superadmin/admins
// @access  Private/SuperAdmin
exports.createAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User with this email already exists"));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role: "admin", // Explicitly setting role to admin
    isVerified: true,
    isActive: true,
  });

  // Remove password from response
  const createdAdmin = await User.findById(admin._id).select("-password");

  res
    .status(201)
    .json(
      new ApiResponse(201, createdAdmin, "Admin account created successfully"),
    );
});

// @desc    Get all admins
// @route   GET /api/superadmin/admins
// @access  Private/SuperAdmin
exports.getAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: "admin" })
    .select("-password")
    .sort("-createdAt");
  res
    .status(200)
    .json(new ApiResponse(200, admins, "Admins fetched successfully"));
});
// @desc    Toggle admin status (Active/Inactive)
// @route   PATCH /api/superadmin/admins/:id/status
// @access  Private/SuperAdmin
exports.toggleAdminStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "Admin not found"));
  }

  // Prevent self-deactivation
  if (user._id.toString() === req.user._id.toString()) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "You cannot deactivate your own account"),
      );
  }

  user.isActive = !user.isActive;
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isActive: user.isActive },
        `Admin status changed to ${user.isActive ? "Active" : "Inactive"}`,
      ),
    );
});

// @desc    Delete admin
// @route   DELETE /api/superadmin/admins/:id
// @access  Private/SuperAdmin
exports.deleteAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "Admin not found"));
  }

  // Prevent self-deactivation
  if (user._id.toString() === req.user._id.toString()) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "You cannot deactivate your own account"),
      );
  }

  await user.deleteOne();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Admin deleted successfully"));
});

// @desc    Update admin
// @route   PATCH /api/superadmin/admins/:id
// @access  Private/SuperAdmin
exports.updateAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "Admin not found"));
  }

  // Check if current user is trying to update themselves (allowed) or another admin
  // For superadmin, this is fine.

  // Update fields if provided in body
  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;

  // Handle password update if provided
  if (req.body.password && req.body.password.trim() !== "") {
    user.password = req.body.password;
  }

  await user.save();

  // Return user without password
  const updatedUser = await User.findById(user._id).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Admin updated successfully"));
});
