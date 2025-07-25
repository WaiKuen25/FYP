const adminService = require("../services/adminService");
const { dbConnection } = require("../config/db");
const pool = dbConnection();

// User management controllers
exports.getUserDataGrid = async(req, res) => {
    try {
        await adminService.getUserDataGridService(req, res);
    } catch (error) {
        console.error("adminController: getUserDataGrid error", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.registerAccount = async(req, res) => {
    try {
        await adminService.registerAccountService(req, res);
    } catch (error) {
        console.error("adminController: registerAccount error", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 處罰用戶
exports.punishUser = async(req, res) => {
    if (!req.isAdmin) {
        return res.status(401).json({ message: "未授權：需要管理員權限" });
    }

    const { userId, reason, duration } = req.body;

    if (!userId || !reason || !duration) {
        return res.status(400).json({ message: "請提供所有必要的資訊" });
    }

    try {
        // 計算結束日期
        let endDate = null;
        let isPermanent = false;

        if (duration === 'forever') {
            isPermanent = true;
        } else {
            const days = parseInt(duration);
            if (isNaN(days)) {
                return res.status(400).json({ message: "無效的處罰時間" });
            }

            endDate = new Date();
            endDate.setDate(endDate.getDate() + days);
        }

        // 新增處罰記錄
        const result = await new Promise((resolve, reject) => {
            const query = `
        INSERT INTO punishments 
        (userId, adminId, reason, endDate, isPermanent) 
        VALUES (?, ?, ?, ?, ?)
      `;

            pool.query(
                query, [userId, req.adminId, reason, endDate, isPermanent],
                (err, results) => {
                    if (err) {
                        console.error("新增處罰記錄錯誤:", err);
                        return reject(err);
                    }
                    resolve(results);
                }
            );
        });

        return res.status(201).json({
            message: "處罰成功",
            punishmentId: result.insertId
        });
    } catch (error) {
        console.error("處罰用戶時出錯:", error);
        return res.status(500).json({ message: "內部伺服器錯誤" });
    }
};

// 獲取用戶處罰記錄
exports.getUserPunishments = async(req, res) => {
    if (!req.isAdmin) {
        return res.status(401).json({ message: "未授權：需要管理員權限" });
    }

    const { userId } = req.params;

    try {
        const punishments = await new Promise((resolve, reject) => {
            const query = `
        SELECT p.*, a.userId as adminUserId, u.email as userEmail, u.nickName as userNickName 
        FROM punishments p
        JOIN adminUsers a ON p.adminId = a.adminId
        JOIN users u ON p.userId = u.userId
        WHERE p.userId = ?
        ORDER BY p.createdAt DESC
      `;

            pool.query(query, [userId], (err, results) => {
                if (err) {
                    console.error("獲取用戶處罰記錄錯誤:", err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        return res.status(200).json(punishments);
    } catch (error) {
        console.error("獲取用戶處罰記錄時出錯:", error);
        return res.status(500).json({ message: "內部伺服器錯誤" });
    }
};

// 獲取所有處罰記錄
exports.getAllPunishments = async(req, res) => {
    if (!req.isAdmin) {
        return res.status(401).json({ message: "未授權：需要管理員權限" });
    }

    try {
        const punishments = await new Promise((resolve, reject) => {
            const query = `
        SELECT p.*, a.userId as adminUserId, u.email as userEmail, u.nickName as userNickName 
        FROM punishments p
        JOIN adminUsers a ON p.adminId = a.adminId
        JOIN users u ON p.userId = u.userId
        ORDER BY p.createdAt DESC
      `;

            pool.query(query, (err, results) => {
                if (err) {
                    console.error("獲取所有處罰記錄錯誤:", err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        return res.status(200).json(punishments);
    } catch (error) {
        console.error("獲取所有處罰記錄時出錯:", error);
        return res.status(500).json({ message: "內部伺服器錯誤" });
    }
};

// 獲取用戶信息
exports.getUserInfo = async(req, res) => {
    if (!req.isAdmin) {
        return res.status(401).json({ message: "未授權：需要管理員權限" });
    }

    const { userId } = req.params;

    try {
        const userInfo = await new Promise((resolve, reject) => {
            const query = `SELECT userId, email, nickName, role, department, disable FROM users WHERE userId = ?`;

            pool.query(query, [userId], (err, results) => {
                if (err) {
                    console.error("獲取用戶信息錯誤:", err);
                    return reject(err);
                }

                if (results.length === 0) {
                    return reject(new Error("找不到用戶"));
                }

                resolve(results[0]);
            });
        });

        return res.status(200).json(userInfo);
    } catch (error) {
        console.error("獲取用戶信息時出錯:", error);
        return res.status(500).json({ message: error.message || "內部伺服器錯誤" });
    }
};

// 解除用戶處罰
exports.revokePunishment = async(req, res) => {
    if (!req.isAdmin) {
        return res.status(401).json({ message: "未授權：需要管理員權限" });
    }

    const { punishmentId } = req.params;

    try {
        // 獲取處罰信息
        const punishment = await new Promise((resolve, reject) => {
            const query = `SELECT * FROM punishments WHERE punishmentId = ?`;

            pool.query(query, [punishmentId], (err, results) => {
                if (err) {
                    console.error("獲取處罰信息錯誤:", err);
                    return reject(err);
                }

                if (results.length === 0) {
                    return reject(new Error("找不到處罰記錄"));
                }

                resolve(results[0]);
            });
        });

        // 更新處罰狀態為非活動
        await new Promise((resolve, reject) => {
            const query = `UPDATE punishments SET isActive = 0 WHERE punishmentId = ?`;

            pool.query(query, [punishmentId], (err, results) => {
                if (err) {
                    console.error("更新處罰狀態錯誤:", err);
                    return reject(err);
                }

                resolve(results);
            });
        });

        // 檢查用戶是否還有其他活動的處罰
        const activeCount = await new Promise((resolve, reject) => {
            const query = `
                SELECT COUNT(*) AS count
                FROM punishments
                WHERE userId = ? AND isActive = 1
            `;

            pool.query(query, [punishment.userId], (err, results) => {
                if (err) {
                    console.error("檢查用戶活動處罰錯誤:", err);
                    return reject(err);
                }

                resolve(results[0].count);
            });
        });

        // 如果沒有其他活動處罰，取消用戶禁用
        if (activeCount === 0) {
            await new Promise((resolve, reject) => {
                const query = `UPDATE users SET disable = 0 WHERE userId = ?`;

                pool.query(query, [punishment.userId], (err, results) => {
                    if (err) {
                        console.error("更新用戶禁用狀態錯誤:", err);
                        return reject(err);
                    }

                    resolve(results);
                });
            });
        }

        return res.status(200).json({
            message: "處罰已解除",
            userUnbanned: activeCount === 0
        });
    } catch (error) {
        console.error("解除處罰時出錯:", error);
        return res.status(500).json({ message: error.message || "內部伺服器錯誤" });
    }
};

// 獲取所有帖子
exports.getAllPosts = async(req, res) => {
    if (!req.isAdmin) {
        return res.status(401).json({ message: "未授權：需要管理員權限" });
    }

    try {
        const posts = await new Promise((resolve, reject) => {
            const query = `
                SELECT p.postId, p.title, p.postTime, p.disable, 
                       u.userId, u.nickName as userName, 
                       c.categoryName as category,
                       m.content as messageContent
                FROM posts p
                JOIN users u ON p.userId = u.userId
                JOIN category c ON p.categoryId = c.categoryId
                JOIN messages m ON p.postId = m.postId AND m.messageId = 1
                ORDER BY p.postTime DESC
            `;

            pool.query(query, (err, results) => {
                if (err) {
                    console.error("獲取帖子列表錯誤:", err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        // Process and format date fields before sending to frontend
        const formattedPosts = posts.map(post => {
            // Convert postTime to ISO string format for reliable parsing on frontend
            return {
                ...post,
                postTime: post.postTime ? new Date(post.postTime).toISOString() : null
            };
        });

        return res.status(200).json(formattedPosts);
    } catch (error) {
        console.error("獲取帖子列表時出錯:", error);
        return res.status(500).json({ message: "內部伺服器錯誤" });
    }
};

// 更新帖子狀態（啟用/禁用）
exports.updatePostStatus = async(req, res) => {
    if (!req.isAdmin) {
        return res.status(401).json({ message: "未授權：需要管理員權限" });
    }

    const { postId } = req.params;
    const { disable } = req.body;

    if (disable === undefined) {
        return res.status(400).json({ message: "請提供帖子的新狀態" });
    }

    try {
        // 更新帖子狀態
        await new Promise((resolve, reject) => {
            const query = `UPDATE posts SET disable = ? WHERE postId = ?`;

            pool.query(query, [disable, postId], (err, results) => {
                if (err) {
                    console.error("更新帖子狀態錯誤:", err);
                    return reject(err);
                }

                if (results.affectedRows === 0) {
                    return reject(new Error("找不到指定的帖子"));
                }

                resolve(results);
            });
        });

        return res.status(200).json({
            message: `帖子已${disable ? '禁用' : '啟用'}`,
            postId: postId,
            disable: !!disable
        });
    } catch (error) {
        console.error("更新帖子狀態時出錯:", error);
        return res.status(500).json({ message: error.message || "內部伺服器錯誤" });
    }
};

// Get all broadcast notifications
exports.getBroadcastNotifications = async(req, res) => {
    try {
        const notifications = await adminService.getBroadcastNotificationsService();
        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('Error fetching broadcast notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch broadcast notifications'
        });
    }
};

// Create a new broadcast notification
exports.createBroadcastNotification = async(req, res) => {
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Broadcast message is required'
        });
    }

    try {
        const notification = await adminService.createBroadcastNotificationService(content);
        res.json({
            success: true,
            message: 'Broadcast notification sent successfully',
            notification
        });
    } catch (error) {
        console.error('Error creating broadcast notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create broadcast notification'
        });
    }
};