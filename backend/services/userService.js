const jwt = require("jsonwebtoken");
const { dbConnection } = require("../config/db");
const pool = dbConnection();
const verifyUser = require("../middlewares/verifyUser");

exports.checkUser = async(token) => {
    const isValid = await verifyUser(token);
    return isValid;
};
exports.getProfile = async(userId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT 
                userId,
                email,
                nickName,
                department,
                role,
                disable
            FROM users 
            WHERE userId = ?`, [userId],
            (err, results) => {
                if (err) {
                    console.error("獲取用戶資料時發生錯誤:", err);
                    return reject(err);
                }
                if (results.length === 0) {
                    return reject(new Error("找不到用戶"));
                }
                resolve(results[0]);
            }
        );
    });
};
exports.checkAdmin = async(token) => {
    const isValid = await verifyUser(token);

    if (!isValid) {
        return { valid: false };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        return new Promise((resolve, reject) => {
            pool.query(
                "SELECT userId FROM `adminUsers` WHERE userId = ?", [decoded.userId],
                (err, results) => {
                    if (err) {
                        console.error("Query error:", err);
                        return reject({ valid: false, error: "Database query error" });
                    }

                    if (results.length === 0) {
                        return resolve({ valid: false });
                    }

                    resolve({ valid: true });
                }
            );
        });
    } catch (err) {
        console.error("Token verification error:", err);
        return { valid: false, error: "Unauthorized" };
    }
};

exports.checkAdminToken = async(token) => {
    try {
        console.log("開始驗證令牌");

        if (!token) {
            console.log("令牌為空");
            return { valid: false, error: "令牌為空" };
        }

        // 輸出令牌信息（不包含完整令牌以保護安全）
        const tokenParts = token.split(".");
        if (tokenParts.length === 3) {
            try {
                // 解碼令牌的 payload 部分而不驗證簽名
                const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
                console.log("令牌包含以下信息:", {
                    adminId: payload.adminId ? "存在" : "不存在",
                    userId: payload.userId ? "存在" : "不存在",
                    iat: payload.iat,
                    exp: payload.exp
                });
            } catch (e) {
                console.log("無法解析令牌");
            }
        }

        // 嘗試用 JWT_SECRET 驗證
        let decoded;
        try {
            console.log("嘗試使用 JWT_SECRET 驗證令牌");
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("JWT_SECRET 驗證成功");
        } catch (error) {
            console.log("JWT_SECRET 驗證失敗:", error.message);
            // 如果 JWT_SECRET 失敗，嘗試使用 ADMIN_JWT_SECRET（如果有的話）
            if (process.env.ADMIN_JWT_SECRET) {
                try {
                    console.log("嘗試使用 ADMIN_JWT_SECRET 驗證令牌");
                    decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
                    console.log("ADMIN_JWT_SECRET 驗證成功");
                } catch (adminError) {
                    console.log("ADMIN_JWT_SECRET 驗證失敗:", adminError.message);
                    throw adminError;
                }
            } else {
                console.log("沒有配置 ADMIN_JWT_SECRET");
                throw new Error("JWT 驗證失敗");
            }
        }

        // 檢查是否有 adminId（管理員令牌）
        if (decoded.adminId) {
            console.log("令牌包含 adminId:", decoded.adminId);
            return new Promise((resolve, reject) => {
                pool.query(
                    "SELECT adminId FROM `adminUsers` WHERE adminId = ?", [decoded.adminId],
                    (err, results) => {
                        if (err) {
                            console.error("管理員查詢錯誤:", err);
                            return reject({ valid: false, error: "資料庫查詢錯誤" });
                        }

                        if (results.length === 0) {
                            console.log("未找到匹配的管理員 ID");
                            return resolve({ valid: false });
                        }

                        console.log("管理員驗證成功");
                        resolve({ valid: true });
                    }
                );
            });
        }
        // 如果有 userId（用戶令牌），檢查該用戶是否是管理員
        else if (decoded.userId) {
            console.log("令牌包含 userId:", decoded.userId);
            return new Promise((resolve, reject) => {
                pool.query(
                    "SELECT adminId FROM `adminUsers` WHERE userId = ?", [decoded.userId],
                    (err, results) => {
                        if (err) {
                            console.error("管理員查詢錯誤:", err);
                            return reject({ valid: false, error: "資料庫查詢錯誤" });
                        }

                        if (results.length === 0) {
                            console.log("該用戶不是管理員");
                            return resolve({ valid: false });
                        }

                        console.log("用戶是管理員，驗證成功");
                        resolve({ valid: true });
                    }
                );
            });
        } else {
            console.log("令牌格式無效，缺少 adminId 或 userId");
            return { valid: false, error: "無效的令牌格式" };
        }
    } catch (err) {
        console.error("管理員令牌驗證錯誤:", err);
        return { valid: false, error: "未授權" };
    }
};

exports.getUserId = (userId) => {
    return userId;
};

exports.generateUserReport = async(userId) => {
    try {
        // 從資料庫獲取用戶基本信息
        const userInfo = await new Promise((resolve, reject) => {
            pool.query(
                "SELECT userId as id, email, nickName, role, department, disable FROM `users` WHERE userId = ?", [userId],
                (err, results) => {
                    if (err) {
                        console.error("查詢用戶基本信息錯誤:", err);
                        return reject(err);
                    }
                    if (results.length === 0) {
                        return reject(new Error("找不到用戶"));
                    }
                    resolve(results[0]);
                }
            );
        });

        // 獲取用戶發布的帖子數量
        const postCount = await new Promise((resolve, reject) => {
            pool.query(
                "SELECT COUNT(*) as postCount FROM `posts` WHERE userId = ?", [userId],
                (err, results) => {
                    if (err) {
                        console.error("查詢帖子數量錯誤:", err);
                        return reject(err);
                    }
                    resolve(results[0].postCount);
                }
            );
        });

        // 獲取用戶的評論數量 (使用 messages 表)
        const commentCount = await new Promise((resolve, reject) => {
            pool.query(
                "SELECT COUNT(*) as commentCount FROM `messages` WHERE userId = ?", [userId],
                (err, results) => {
                    if (err) {
                        console.error("查詢評論數量錯誤:", err);
                        return reject(err);
                    }
                    resolve(results[0].commentCount);
                }
            );
        });

        // 獲取用戶發送過的所有訊息
        const userMessages = await new Promise((resolve, reject) => {
            pool.query(
                `SELECT m.messageId, m.postId, m.content, m.messageTime, p.title as postTitle
                 FROM messages m
                 JOIN posts p ON m.postId = p.postId
                 WHERE m.userId = ?
                 ORDER BY m.messageTime DESC`, [userId],
                (err, results) => {
                    if (err) {
                        console.error("查詢用戶訊息錯誤:", err);
                        return reject(err);
                    }
                    resolve(results);
                }
            );
        });

        // 組合完整的用戶報告
        return {
            userInfo,
            activity: {
                postCount,
                commentCount
            },
            messages: userMessages,
            generatedAt: new Date()
        };
    } catch (error) {
        console.error("生成用戶報告時出錯:", error);
        throw error;
    }
};

exports.getAllUsers = async() => {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT userId, email, nickName, department, role, disable FROM users",
            (err, results) => {
                if (err) {
                    console.error("獲取所有用戶資料時發生錯誤:", err);
                    return reject(err);
                }
                resolve(results);
            }
        );
    });
};

exports.getProfile = async(userId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT 
                userId,
                email,
                nickName,
                department,
                role,
                disable
            FROM users 
            WHERE userId = ?`, [userId],
            (err, results) => {
                if (err) {
                    console.error("獲取用戶資料時發生錯誤:", err);
                    return reject(err);
                }
                if (results.length === 0) {
                    return reject(new Error("找不到用戶"));
                }
                resolve(results[0]);
            }
        );
    });
};