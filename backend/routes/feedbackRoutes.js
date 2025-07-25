const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const feedbackController = require("../controllers/feedbackController");

// Apply auth middleware
router.use(authMiddleware);

// Report routes
router.post("/report", feedbackController.createReport);

// Admin routes
router.get("/all", feedbackController.getAllReports);
router.put("/:feedbackId/status", feedbackController.updateReportStatus);

module.exports = router;