const { dbConnection } = require("../config/db");
const pool = dbConnection();

const adminAuthMiddleware = async(req, res, next) => {
    // Skip auth check if it's an optional authenticate route
    if (req.skipAuth) {
        return next();
    }

    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    try {
        // Check if user is an admin
        const [adminResults] = await pool.promise().query(
            'SELECT adminId, permission FROM adminUsers WHERE userId = ?', [userId]
        );

        if (adminResults.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Admin privileges required'
            });
        }

        // Add admin info to request object
        req.isAdmin = true;
        req.adminId = adminResults[0].adminId;
        req.adminPermission = adminResults[0].permission;

        next();
    } catch (error) {
        console.error('Admin authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication'
        });
    }
};

module.exports = adminAuthMiddleware;