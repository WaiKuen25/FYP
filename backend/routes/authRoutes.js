const express = require("express");
const router = express.Router();
const {
  login,
  register,
  verifyEmail,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register);
router.get("/emailVerify/:token", verifyEmail);
module.exports = router;
