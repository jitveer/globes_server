/**
 * Custom NoSQL Injection Protection Middleware
 * Designed to work with Express 5 where req.query might be read-only (getter-only)
 */

const sanitize = (obj) => {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (obj[key] instanceof Object) {
        sanitize(obj[key]);
      }
    }
  }
  return obj;
};

const mongoSanitize = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

module.exports = mongoSanitize;
