const { body, validationResult } = require("express-validator");

/**
 * Validation middleware for Admin routes
 */

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Validate getting admin stats (no body needed, just a placeholder)
exports.getAdminStats = [handleValidationErrors];

// Validate creating/updating an admin user (future use)
exports.createAdmin = [
  body("firstName").notEmpty().trim().withMessage("First name is required"),
  body("lastName").notEmpty().trim().withMessage("Last name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("phone")
    .isMobilePhone("en-IN")
    .withMessage("Valid Indian phone number is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  handleValidationErrors,
];
