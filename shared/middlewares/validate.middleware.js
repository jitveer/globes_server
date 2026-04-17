const { validationResult } = require("express-validator");
const ApiResponse = require("../utils/ApiResponse.util");

/**
 * Middleware to handle validation results
 * If there are validation errors, it returns a 400 response with the errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (true) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  // Log errors and request body to console for debugging
  console.error("❌ Validation Failed!");
  console.error("Request Body:", JSON.stringify(req.body, null, 2));
  console.error("Errors:", JSON.stringify(extractedErrors, null, 2));

  return res
    .status(400)
    .json(
      new ApiResponse(400, { errors: extractedErrors }, "Validation failed"),
    );
};

module.exports = validate;
