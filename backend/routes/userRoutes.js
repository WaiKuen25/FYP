const express = require("express");
const router = express.Router();
const { checkUser, checkAdmin, getUserId, generateUserReport, getAllUsers, getProfile, changePassword, updateProfile } = require("../controllers/userController");
const optionalAuthenticate = require('../middlewares/authMiddleware');

router.get("/profile", optionalAuthenticate, getProfile);

router.get("/getUser", checkUser);

router.get("/getAdmin", checkAdmin);

router.get("/getUserId", optionalAuthenticate, getUserId);

router.get("/generate/:userId", optionalAuthenticate, generateUserReport);

router.get("/profile", optionalAuthenticate, getProfile);

router.get("/getAllUsers", optionalAuthenticate, getAllUsers);

// Add new route for password change
router.put("/password", optionalAuthenticate, changePassword);

// Add route for updating profile
router.put("/profile", optionalAuthenticate, updateProfile);

module.exports = router;