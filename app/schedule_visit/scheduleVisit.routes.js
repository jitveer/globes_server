const express = require("express");
const router = express.Router();
const scheduleVisitController = require("./scheduleVisit.controller");
const {
  contactLimiter,
} = require("../../shared/middlewares/rateLimiter.middleware");

// Public route - User schedules a visit
router.post("/", contactLimiter, scheduleVisitController.createVisit);

// Admin routes - Get all visits & update status
router.get("/", scheduleVisitController.getAllVisits);
router.patch("/:id", scheduleVisitController.updateVisitStatus);

module.exports = router;
