const userService = require("../services/userService");
const bcrypt = require("bcrypt");
const { dbConnection } = require("../config/db");
const pool = dbConnection();

exports.getProfile = async(req, res) => {
    // 如果沒有用戶ID，返回錯誤
    if (!req.userId) {
        return res.status(401).json({ message: "未授權：請先登入" });
    }

    try {
        const profile = await userService.getProfile(req.userId);
        return res.status(200).json(profile);
    } catch (error) {
        console.error("獲取個人資料時發生錯誤:", error);
        if (error.message === "找不到用戶") {
            return res.status(404).json({ message: "找不到用戶" });
        }
        return res.status(500).json({ message: "內部伺服器錯誤" });
    }
};

exports.checkUser = async(req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    try {
        const isValid = await userService.checkUser(token);
        if (!isValid) {
            return res.status(401).json({ valid: false });
        }
        res.status(200).json({ valid: true });
    } catch (error) {
        console.error("Error in checkUser:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.checkAdmin = async(req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    try {
        const result = await userService.checkAdmin(token);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in checkAdmin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getUserId = async(req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID provided" });
    }

    try {
        const userId = userService.getUserId(req.userId);
        return res.status(200).json({ userId });
    } catch (error) {
        console.error("Error fetching user ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.generateUserReport = async(req, res) => {
    const userId = req.params.userId;

    console.log("收到請求生成用戶報告。用戶ID:", userId);
    console.log("是否管理員:", req.isAdmin ? "是" : "否");
    console.log("管理員ID:", req.adminId);

    if (!req.isAdmin) {
        return res.status(401).json({ message: "未授權：需要管理員權限" });
    }

    try {
        console.log("驗證通過，獲取用戶報告數據");
        // 直接從數據庫獲取用戶報告數據
        const userReport = await userService.generateUserReport(userId);
        console.log("用戶報告生成成功");
        return res.status(200).json(userReport);
    } catch (error) {
        console.error("生成用戶報告時出錯:", error);
        return res.status(500).json({ message: "內部伺服器錯誤" });
    }
};

exports.getProfile = async(req, res) => {
    // 如果沒有用戶ID，返回錯誤
    if (!req.userId) {
        return res.status(401).json({ message: "未授權：請先登入" });
    }

    try {
        const profile = await userService.getProfile(req.userId);
        return res.status(200).json(profile);
    } catch (error) {
        console.error("獲取個人資料時發生錯誤:", error);
        if (error.message === "找不到用戶") {
            return res.status(404).json({ message: "找不到用戶" });
        }
        return res.status(500).json({ message: "內部伺服器錯誤" });
    }
};

exports.getAllUsers = async(req, res) => {
    try {
        const users = await userService.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        console.error("獲取所有用戶時發生錯誤:", error);
        return res.status(500).json({ message: "內部伺服器錯誤" });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID provided" });
    }

    try {
        // Get user's current password from database
        const [user] = await pool.promise().query(
            "SELECT password FROM users WHERE userId = ?",
            [userId]
        );

        if (!user || user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, user[0].password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in database
        await pool.promise().query(
            "UPDATE users SET password = ? WHERE userId = ?",
            [hashedPassword, userId]
        );

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateProfile = async (req, res) => {
    const userId = req.userId;
    const { nickName, department, email, phone } = req.body;

    console.log("Update profile request:", { userId, body: req.body }); // Debug log

    if (!userId) {
        console.error("No user ID provided in request");
        return res.status(401).json({ message: "Unauthorized: No user ID provided" });
    }

    // Check database connection
    try {
        await pool.promise().query('SELECT 1');
        console.log("Database connection is working");
    } catch (connError) {
        console.error("Database connection error:", connError);
        return res.status(500).json({ 
            message: "Database connection error",
            error: connError.message
        });
    }

    try {
        // First check if the user exists
        const [user] = await pool.promise().query(
            "SELECT * FROM users WHERE userId = ?",
            [userId]
        );

        console.log("Current user data:", user); // Debug log

        if (!user || user.length === 0) {
            console.error("User not found:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        // Prepare update data with proper type checking
        const updateData = {};
        if (nickName && typeof nickName === 'string') updateData.nickName = nickName.trim();
        if (department && typeof department === 'string') updateData.department = department.trim();
        if (email && typeof email === 'string') updateData.email = email.trim();
        if (phone && typeof phone === 'string') updateData.phone = phone.trim();

        // If no data to update, return early
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid data provided for update" });
        }

        console.log("Updating user data:", { userId, updateData }); // Debug log

        // Update user data with error handling
        try {
            // First, verify the data types in the database
            const [columns] = await pool.promise().query(
                "SHOW COLUMNS FROM users"
            );
            console.log("Database columns:", columns); // Debug log

            // Build the update query manually to ensure proper data types
            const updateFields = [];
            const updateValues = [];
            
            for (const [key, value] of Object.entries(updateData)) {
                // Check if the column exists
                const columnExists = columns.some(col => col.Field === key);
                if (!columnExists) {
                    console.error(`Column ${key} does not exist in users table`);
                    continue;
                }
                updateFields.push(`${key} = ?`);
                updateValues.push(value);
            }
            
            if (updateFields.length === 0) {
                return res.status(400).json({ message: "No valid fields to update" });
            }

            updateValues.push(userId);

            const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE userId = ?`;
            console.log("Update query:", updateQuery); // Debug log
            console.log("Update values:", updateValues); // Debug log

            const [result] = await pool.promise().query(
                updateQuery,
                updateValues
            );

            console.log("Update result:", result); // Debug log

            if (result.affectedRows === 0) {
                console.error("No rows affected in update");
                return res.status(404).json({ message: "User not found or no changes made" });
            }

            // Get updated user data
            const [updatedUser] = await pool.promise().query(
                "SELECT * FROM users WHERE userId = ?",
                [userId]
            );

            console.log("Updated user data:", updatedUser); // Debug log

            if (!updatedUser || updatedUser.length === 0) {
                console.error("Failed to fetch updated user data");
                return res.status(500).json({ message: "Failed to fetch updated user data" });
            }

            return res.status(200).json({ 
                message: "Profile updated successfully",
                user: updatedUser[0]
            });
        } catch (dbError) {
            console.error("Database error:", dbError);
            console.error("SQL State:", dbError.sqlState);
            console.error("Error Code:", dbError.code);
            console.error("Error Message:", dbError.message);
            
            // Handle specific database errors
            if (dbError.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ 
                    message: "Duplicate entry found. This email is already in use." 
                });
            }
            
            return res.status(500).json({ 
                message: "Database error occurred",
                error: dbError.message
            });
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        console.error("Error stack:", error.stack);
        return res.status(500).json({ 
            message: "Internal server error",
            error: error.message
        });
    }
};