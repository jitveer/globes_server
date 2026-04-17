const xss = require("xss");

/**
 * Middleware to sanitize user input against XSS attacks
 * It recursively scans objects and arrays to sanitize all string values
 */
const sanitize = (data) => {
  if (typeof data === "string") {
    return xss(data);
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item));
  }
  if (typeof data === "object" && data !== null) {
    const sanitizedObject = {};
    for (const key in data) {
      sanitizedObject[key] = sanitize(data[key]);
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
