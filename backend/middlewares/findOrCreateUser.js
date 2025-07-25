const UserConfig = require("../models/userConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { dbConnection } = require("../config/db");

const pool = dbConnection();

const findUserInMySQL = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT userId, email, nickName, password AS passwordHash FROM users WHERE email = ?",
      [email],
      (err, userResults) => {
        if (err) {
          return reject(new Error("MySQL query error: " + err.message));
        }
        if (userResults.length === 0) {
          return resolve(null);
        }
        resolve(userResults[0]);
      }
    );
  });
};

const checkIfUserIsAdmin = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT adminId FROM adminUsers WHERE userId = ?",
      [userId],
      (err, adminResults) => {
        if (err) {
          return reject(new Error("MySQL query error: " + err.message));
        }
        resolve(adminResults.length > 0);
      }
    );
  });
};

const findOrCreateUser = async (email, password, callback) => {
  try {
    const mysqlUser = await findUserInMySQL(email);
    if (!mysqlUser) {
      return callback({ message: "User not found" }, null);
    }

    let user = await UserConfig.findOne({ userId: mysqlUser.userId });

    if (user) {
      const match = await bcrypt.compare(password, mysqlUser.passwordHash);
      if (!match) {
        return callback({ message: "Invalid credentials" }, null);
      }
      
      user.nickName = mysqlUser.nickName;
      user.isAdmin = await checkIfUserIsAdmin(mysqlUser.userId);
      return callback(null, user);
    } else {
      const match = await bcrypt.compare(password, mysqlUser.passwordHash);
      if (!match) {
        return callback({ message: "Invalid credentials" }, null);
      }

      user = new UserConfig({
        userId: mysqlUser.userId, 
        lastLogin: Date.now(),
      });


      await user.save();
      user.nickName = mysqlUser.nickName;
      user.isAdmin = await checkIfUserIsAdmin(mysqlUser.userId);
      return callback(null, user);
    }
  } catch (error) {
    console.error("Error in findOrCreateUser:", error);
    callback({ message: "Internal server error" }, null);
  }
};

module.exports = findOrCreateUser;
