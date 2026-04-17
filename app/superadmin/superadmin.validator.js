const { body, validationResult } = require("express-validator");
const ApiResponse = require("../../shared/utils/ApiResponse.util");

/**
 * Validator for Admin Creation by Super Admin
 */
exports.createAdminValidator = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .trim()
    .isAlpha()
    .withMessage("First name should only contain letters"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .trim()
    .isAlpha()
    .withMessage("Last name should only contain letters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("en-IN")
    .withMessage("Please provide a valid Indian phone number"),

  body("password")
    .if(
      (value, { req }) =>
        req.method === "POST" || (req.method === "PATCH" && value),
    )
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter"),

  // Middleware to handle the validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        new ApiResponse(
          400,
          { errors: errors.array() },
          errors.array()[0].msg, // Send the first error message for simplicity
        ),
      );
    }
    next();
  },
];
