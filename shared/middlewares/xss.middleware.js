const xss = require("xss");

/**
 * Fields that must NEVER be XSS-sanitized.
 * Sanitizing passwords corrupts them before bcrypt comparison → causes 401 errors.
 */
const SKIP_SANITIZE_KEYS = new Set([
  "password",
  "confirmPassword",
  "oldPassword",
  "newPassword",
  "currentPassword",
]);

/**
 * Middleware to sanitize user input against XSS attacks.
 * Recursively sanitizes all string values EXCEPT sensitive fields like passwords.
 */
const sanitize = (data, key = null) => {
  // Skip sanitization for password fields
  if (key && SKIP_SANITIZE_KEYS.has(key)) {
    return data;
  }
  if (typeof data === "string") {
    return xss(data);
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item));
  }
  if (typeof data === "object" && data !== null) {
    const sanitizedObject = {};
    for (const objKey in data) {
      sanitizedObject[objKey] = sanitize(data[objKey], objKey);
    }
    return sanitizedObject;
  }
  return data;
};

const xssMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  next();
};

module.exports = xssMiddleware;
