const jwt = require("jsonwebtoken");

const optionalAuthenticate = (req, res, next) => {
    const userToken = req.header("Authorization") ?.replace("Bearer ", "");
    const adminToken = req.header("AdminAuthorization") ?.replace("Bearer ", "");

    if (userToken) {
        try {
            const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET);
            req.userId = decodedUser.userId; // Attach userId to the request
            console.log("User token verified successfully:", decodedUser);
        } catch (error) {
            console.log("User token verification failed:", error.message);
        }
    } else {
        console.log("AuthMiddleware: No user token provided.");
    }

    if (adminToken) {
        try {
            const decodedAdmin = jwt.verify(adminToken, process.env.JWT_ADMIN_SECRET);
            req.isAdmin = true; // Attach admin flag to the request
            req.adminId = decodedAdmin.adminId; // Attach adminId to the request
            console.log("Admin token verified successfully:", decodedAdmin);
        } catch (error) {
            console.log("Admin token verification failed:", error.message);
        }
    } else {
        req.isAdmin = false; // Default to non-admin if no admin token provided
        console.log("AuthMiddleware: No admin token provided.");
    }

    next();
};

module.exports = optionalAuthenticate;