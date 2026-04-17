const User = require("../users/user.model");
const jwt = require("../../shared/utils/jwt.util");
const { createAdminNotification } = require("../notifications/admin_notification.service");

exports.register = async (userData) => {
  const existingUser = await User.findOne({
    $or: [{ email: userData.email }, { phone: userData.phone }],
  });
  if (existingUser) {
    throw new Error("User already exists with this email or phone");
  }
  const user = await User.create(userData);

  // Send notification to admin
  await createAdminNotification({
    type: "user_registered",
    title: "New User Registered",
    message: `${user.firstName} ${user.lastName} has registered on the platform.`,
    recipientRole: "admin",
    metadata: {
      userId: user._id,
      email: user.email,
      phone: user.phone,
    },
  });
  const accessToken = jwt.generateAccessToken(user._id);
  const refreshToken = jwt.generateRefreshToken(user._id);
  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  // Prevent admin and superadmin from logging in through regular user login
  if (user.role === "admin" || user.role === "superadmin") {
    const error = new Error(
      "Access denied. Admin and Superadmin must use their respective login portals.",
    );
    error.statusCode = 403;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Account is deactivated");
    error.statusCode = 403;
    throw error;
  }
  user.lastLogin = Date.now();
  user.loginCount += 1;
  await user.save();
  const accessToken = jwt.generateAccessToken(user._id);
  const refreshToken = jwt.generateRefreshToken(user._id);
  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};

exports.superAdminLogin = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  console.log("Login attempt for:", email);
  if (!user) {
    console.log("User not found in DB");
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  console.log("Password match result:", isMatch);

  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  if (user.role !== "superadmin") {
    const error = new Error("Access denied. Not a super admin.");
    error.statusCode = 403;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Account is deactivated");
    error.statusCode = 403;
    throw error;
  }

  user.lastLogin = Date.now();
  user.loginCount += 1;
  await user.save();

  const accessToken = jwt.generateAccessToken(user._id);
  const refreshToken = jwt.generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};
exports.adminLogin = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  // Strict role check for Admin
  if (user.role !== "admin") {
    const error = new Error("Access denied. Not an administrator.");
    error.statusCode = 403;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Account is deactivated");
    error.statusCode = 403;
    throw error;
  }

  // Update tracking info
  user.lastLogin = Date.now();
  user.loginCount += 1;
  await user.save();

  const accessToken = jwt.generateAccessToken(user._id);
  const refreshToken = jwt.generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};
