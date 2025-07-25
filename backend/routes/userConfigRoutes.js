const express = require("express");
const optionalAuthenticate = require("../middlewares/authMiddleware");

const router = express.Router();
const { category, history, favourite, getHistory, getFavourite, delHistory, blockUser, unblockUser, getBlockedUsers } = require("../controllers/userConfigController");

router.post("/category/:categoryId", optionalAuthenticate, category);
router.post("/history/:postId", optionalAuthenticate, history);
router.post("/favourite/:postId", optionalAuthenticate, favourite);
router.get("/getHistory", optionalAuthenticate, getHistory);
router.get("/getFavourite", optionalAuthenticate, getFavourite);
router.post("/delHistory/:postId", optionalAuthenticate, delHistory);
router.post('/block/:userId', optionalAuthenticate, blockUser);
router.post('/unblock/:userId', optionalAuthenticate, unblockUser);
router.get('/blocked', optionalAuthenticate, getBlockedUsers);

module.exports = router;
