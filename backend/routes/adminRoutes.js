const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const optionalAuthenticate = require("../middlewares/authMiddleware");

const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");

// First apply auth middleware to get user info
router.use(optionalAuthenticate);

// User management routes
router.get("/getUserDataGrid", adminController.getUserDataGrid);
router.post("/registerTestAccount", adminController.registerAccount);

// Punishment related routes
router.post("/punishUser", adminController.punishUser);
router.get("/getUserPunishments/:userId", adminController.getUserPunishments);
router.get("/getAllPunishments", adminController.getAllPunishments);
router.post("/revokePunishment/:punishmentId", adminController.revokePunishment);

// User info routes
router.get("/getUserInfo/:userId", adminController.getUserInfo);

// Post management routes
router.get("/posts", adminController.getAllPosts);
router.put("/posts/:postId/status", adminController.updatePostStatus);

// Broadcast notification routes
router.get('/notifications/broadcast', adminController.getBroadcastNotifications);
router.post('/notifications/broadcast', adminController.createBroadcastNotification);

module.exports = router;