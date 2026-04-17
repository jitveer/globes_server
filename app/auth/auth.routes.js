const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authValidator = require("./auth.validator");
const { authLimiter } = require("../../shared/middlewares/rateLimiter.middleware");



//routes
router.post("/register", authLimiter, authValidator.register, authController.register);
router.post("/login", authLimiter, authValidator.login, authController.login);
router.post("/super-admin/login", authLimiter, authValidator.login, authController.superAdminLogin);
router.post("/admin/login", authLimiter, authValidator.login, authController.adminLogin);

module.exports = router;
