const express = require("express");
const router = express.Router();

const propertyController = require("./properties.controller");
const propertyValidator = require("./properties.validator");
const validate = require("../../shared/middlewares/validate.middleware");
const {
  protect,
  authorize,
} = require("../../shared/middlewares/auth.middleware");
const upload = require("../../shared/middlewares/upload.middleware");
const {
  uploadLimiter,
} = require("../../shared/middlewares/rateLimiter.middleware");

// Public routes
router.get("/", propertyController.getAllProperties);
router.get("/:id", propertyController.getPropertyById);

// Protected routes - require authentication
router.use(protect);

// Property Super admin /Admin routes
const propertyUploads = upload.fields([
  { name: "images", maxCount: 15 },
  { name: "brochure", maxCount: 1 },
]);

// Middleware to parse data if sent as a JSON string in FormData
const parseData = (req, res, next) => {
  if (req.body.data) {
    try {
      const parsed = JSON.parse(req.body.data);
      // Merge parsed data into req.body for express-validator
      Object.assign(req.body, parsed);
    } catch (e) {
      // If parsing fails, we just continue and let validator handle it
    }
  }
  next();
};

router.post(
  "/",
  authorize("admin", "superadmin"),
  uploadLimiter,
  propertyUploads,
  parseData,
  propertyValidator.propertyValidationRules,
  validate,
  propertyController.createProperty,
);
router.post(
  "/bulk",
  authorize("admin", "superadmin"),
  propertyController.bulkCreateProperties,
);
router.patch(
  "/:id",
  authorize("admin", "superadmin"),
  uploadLimiter,
  propertyUploads,
  parseData,
  propertyValidator.propertyUpdateValidationRules,
  validate,
  propertyController.updateProperty,
);
router.put(
  "/:id",
  authorize("admin", "superadmin"),
  uploadLimiter,
  propertyUploads,
  parseData,
  propertyValidator.propertyUpdateValidationRules,
  validate,
  propertyController.updateProperty,
);
router.delete(
  "/:id",
  authorize("admin", "superadmin"),
  propertyController.deleteProperty,
);

module.exports = router;
