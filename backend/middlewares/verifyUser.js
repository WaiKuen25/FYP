const jwt = require("jsonwebtoken");

const verifyUser = async (token) => {
  if (!token) return false;

  try {
    await jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (err) {
    console.error("Token verification error:", err);
    return false;
  }
};

module.exports = verifyUser;
