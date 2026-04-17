const { body } = require("express-validator");

/**
 * Validation rules for creating a property
 */
const propertyValidationRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Property title is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters long"),

  body("priceRange")
    .notEmpty()
    .withMessage("Price range is required")
    .isString()
    .withMessage("Price range must be a string"),

  body("location.address")
    .trim()
    .notEmpty()
    .withMessage("Full address is required"),

  body("type")
    .notEmpty()
    .withMessage("Property type is required")
    .isIn(["Apartment", "Villa", "Plot", "Commercial", "Other"])
    .withMessage("Invalid property type"),

  body("status")
    .optional()
    .isIn(["active", "inactive", "sold"])
    .withMessage("Invalid status"),
];

/**
 * Validation rules for updating a property (Partial update)
 */
const propertyUpdateValidationRules = [
  body("title")
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage("Property title cannot be empty")
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters long"),

  body("priceRange")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("Price range cannot be empty")
    .isString()
    .withMessage("Price range must be a string"),

  body("location.address")
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage("Full address cannot be empty"),

  body("type")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("Property type cannot be empty")
    .isIn(["Apartment", "Villa", "Plot", "Commercial", "Other"])
    .withMessage("Invalid property type"),

  body("status")
    .optional({ checkFalsy: true })
    .isIn(["active", "inactive", "sold", "rented"])
    .withMessage("Invalid status"),
];

module.exports = {
  propertyValidationRules,
  propertyUpdateValidationRules,
};
