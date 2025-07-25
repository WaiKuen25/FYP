const { dbConnection } = require("../config/db");
const pool = dbConnection();
const fs = require("fs");
const path = require("path");

// 通知類型常量
const NotificationTypes = {
    PIN_POST: 'PIN_POST', // 置頂貼文通知（廣播）
    NEW_REPLY: 'NEW_REPLY', // 新回覆通知（個人）
    MENTION: 'MENTION', // 提及通知（個人）
    SYSTEM: 'SYSTEM', // 系統通知（廣播）
    ADMIN_ACTION: 'ADMIN_ACTION' // 管理員操作通知（個人）
};

const insertReactionService = (req) => {
    return new Promise((resolve, reject) => {
        const userId = req.userId;
        const { postId, messageId, reaction } = req.body;
        const query = `
      INSERT INTO message_reactions (userId, postId, messageId, reaction)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE reaction = VALUES(reaction);
    `;
        const values = [userId, postId, messageId, reaction];

        pool.query(query, values, (error, results) => {
            if (error) {
                console.error("Error in insertReaction service:", error);
                return reject({ success: false, message: "Failed to insert reaction" });
            }
            resolve({ success: true });
        });
    });
};

const createNotification = async(userId, type, content, options = {}) => {
    const { postId = null, link = null, isBroadcast = false } = options;

    if (isBroadcast) {
        // 廣播通知：向所有用戶發送通知
        return new Promise((resolve, reject) => {
            const getUsersQuery = "SELECT userId FROM users WHERE disable = 0";
            pool.query(getUsersQuery, async(error, users) => {
                if (error) {
                    console.error("Error getting users for broadcast:", error);
                    reject(error);
                    return;
                }

                try {
                    const insertPromises = users.map(user => {
                        return new Promise((resolve, reject) => {
                            const query = `
                                INSERT INTO notifications 
                                (userId, type, content, postId, link, isRead, createdAt)
                                VALUES (?, ?, ?, ?, ?, 0, NOW())
                            `;
                            pool.query(query, [user.userId, type, content, postId, link], (error, results) => {
                                if (error) {
                                    console.error(`Error creating notification for user ${user.userId}:`, error);
                                    reject(error);
                                } else {
                                    resolve(results);
                                }
                            });
                        });
                    });

                    await Promise.all(insertPromises);
                    resolve({ success: true, message: "Broadcast notifications created successfully" });
                } catch (error) {
                    console.error("Error in broadcast notifications:", error);
                    reject(error);
                }
            });
        });
    } else {
        // 個人通知：只向特定用戶發送通知
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO notifications 
                (userId, type, content, postId, link, isRead, createdAt)
                VALUES (?, ?, ?, ?, ?, 0, NOW())
            `;

            pool.query(query, [userId, type, content, postId, link], (error, results) => {
                if (error) {
                    console.error("Error creating notification:", error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
};

const insertPostService = async(req) => {
    return new Promise(async(resolve, reject) => {
        try {
            const userId = req.userId;
            const { title, category } = req.body;

            // 檢查必需的參數
            if (!title || !category) {
                return reject({ success: false, message: "Title and category are required" });
            }

            // 插入到posts表格，根據資料表結構
            const insertPostQuery = `
                INSERT INTO posts (userId, categoryId, title, postTime, disable)
                VALUES (?, ?, ?, NOW(), 0)
            `;

            pool.query(insertPostQuery, [userId, category, title], async(error, results) => {
                if (error) {
                    console.error("Error inserting post:", error);
                    reject({ success: false, message: "Failed to insert post" });
                    return;
                }

                const postId = results.insertId;

                // 添加關聯的訊息
                const insertMessageQuery = `
                    INSERT INTO messages (postId, userId, content, messageTime, disable)
                    VALUES (?, ?, ?, NOW(), 0)
                `;

                const messageContent = req.body.content || "";

                pool.query(insertMessageQuery, [postId, userId, messageContent], (messageError) => {
                    if (messageError) {
                        console.error("Error inserting first message:", messageError);
                        // 已經創建了帖子，即使訊息創建失敗也繼續
                    }
                });

                // 處理媒體文件
                if (req.file) {
                    const allowedFormats = ["image/jpeg", "image/png", "video/mp4"];
                    if (!allowedFormats.includes(req.file.mimetype)) {
                        return reject({ success: false, message: "Invalid file format" });
                    }

                    const fileExtension = path.extname(req.file.originalname);
                    const newFileName = `${userId}_1${fileExtension}`;
                    const newFilePath = path.join(
                        __dirname,
                        `../cdn/post/${postId}`,
                        newFileName
                    );

                    // 確保目錄存在
                    fs.mkdirSync(path.dirname(newFilePath), { recursive: true });

                    // 移動文件
                    fs.rename(req.file.path, newFilePath, (err) => {
                        if (err) {
                            console.error("Error in moving file:", err);
                            return reject({ success: false, message: "Failed to move file" });
                        }

                        const query3 = `
                            INSERT INTO media (postId, userId, messageId, type, name)
                            VALUES (?, ?, 1, ?, ?);
                        `;
                        const values3 = [postId, userId, req.file.mimetype, newFileName];

                        pool.query(query3, values3, (error, results3) => {
                            if (error) {
                                console.error("Error in insertPost service:", error);
                                return reject({
                                    success: false,
                                    message: "Failed to insert post",
                                });
                            }
                            resolve({ success: true, postId });
                        });
                    });
                } else {
                    resolve({ success: true, postId });
                }
            });
        } catch (error) {
            console.error("Error in insertPostService:", error);
            reject({ success: false, message: "Error processing request" });
        }
    });
};

const insertMessageService = (req) => {
    return new Promise((resolve, reject) => {
        const userId = req.userId;
        const postId = req.params.postId;
        const formData = req.body;

        // 首先插入消息
        const query1 = `
            INSERT INTO messages (userId, postId, reply, content, messageTime)
            VALUES (?, ?, ?, ?, NOW());
        `;
        const values1 = [userId, postId, formData.replyId, formData.content];

        pool.query(query1, values1, async(error, results1) => {
            if (error) {
                console.error("Error in insertMessage service:", error);
                return reject({ success: false, message: "Failed to insert message" });
            }

            // 獲取剛插入的消息 ID - 由於 messageId 是由觸發器生成的，不是自動遞增的
            const getMessageIdQuery = `
                SELECT messageId FROM messages 
                WHERE postId = ? AND userId = ? 
                ORDER BY messageTime DESC LIMIT 1
            `;

            pool.query(getMessageIdQuery, [postId, userId], async(error, messageIdResult) => {
                if (error || !messageIdResult.length) {
                    console.error("Error getting messageId:", error);
                    return reject({ success: false, message: "Failed to get messageId" });
                }

                const messageId = messageIdResult[0].messageId;

                // 處理回覆通知
                if (formData.replyId) {
                    try {
                        // 獲取原始消息的作者
                        const getOriginalAuthorQuery = `
                            SELECT m.userId, m.content, u.nickName 
                            FROM messages m 
                            JOIN users u ON m.userId = u.userId 
                            WHERE m.postId = ? AND m.messageId = ?
                        `;

                        pool.query(getOriginalAuthorQuery, [postId, formData.replyId], async(error, authorResults) => {
                            if (!error && authorResults.length > 0) {
                                const originalAuthor = authorResults[0];

                                // 不要給自己發送回覆通知
                                if (originalAuthor.userId !== userId) {
                                    const replierQuery = `SELECT nickName FROM users WHERE userId = ?`;
                                    pool.query(replierQuery, [userId], async(error, replierResults) => {
                                        if (!error && replierResults.length > 0) {
                                            const replierName = replierResults[0].nickName;

                                            // 創建回覆通知
                                            await createNotification(
                                                originalAuthor.userId,
                                                NotificationTypes.NEW_REPLY,
                                                `${replierName} 回覆了您的留言：${originalAuthor.content.substring(0, 20)}...`, {
                                                    postId,
                                                    link: `/post/${postId}#message-${formData.replyId}`
                                                }
                                            );
                                        }
                                    });
                                }
                            }
                        });
                    } catch (error) {
                        console.error("Error creating reply notification:", error);
                    }
                }

                // 處理提及通知
                const mentionRegex = /@(\w+)/g;
                const mentions = formData.content.match(mentionRegex);

                if (mentions) {
                    const uniqueMentions = [...new Set(mentions.map(m => m.substring(1)))];

                    if (uniqueMentions.length > 0) {
                        // 查找被提及用戶的 ID
                        const mentionedUsersQuery = `
                            SELECT userId, nickName 
                            FROM users 
                            WHERE nickName IN (${uniqueMentions.map(() => '?').join(',')})
                        `;

                        pool.query(mentionedUsersQuery, uniqueMentions, async(error, mentionedUsers) => {
                            if (!error && mentionedUsers.length > 0) {
                                const authorQuery = `SELECT nickName FROM users WHERE userId = ?`;
                                pool.query(authorQuery, [userId], async(error, authorResults) => {
                                    if (!error && authorResults.length > 0) {
                                        const authorName = authorResults[0].nickName;

                                        // 為每個被提及的用戶創建通知
                                        for (const user of mentionedUsers) {
                                            if (user.userId !== userId) { // 不給自己發送提及通知
                                                await createNotification(
                                                    user.userId,
                                                    NotificationTypes.MENTION,
                                                    `${authorName} 在貼文中提到了您`, {
                                                        postId,
                                                        link: `/post/${postId}#message-${messageId}`
                                                    }
                                                );
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                }

                // 處理文件上傳
                if (req.file) {
                    const allowedFormats = ["image/jpeg", "image/png", "video/mp4"];
                    if (!allowedFormats.includes(req.file.mimetype)) {
                        return reject({ success: false, message: "Invalid file format" });
                    }

                    const fileExtension = path.extname(req.file.originalname);
                    const newFileName = `${userId}_${messageId}${fileExtension}`;
                    const newFilePath = path.join(
                        __dirname,
                        `../cdn/post/${postId}`,
                        newFileName
                    );

                    // 確保目錄存在
                    fs.mkdirSync(path.dirname(newFilePath), { recursive: true });

                    // 移動文件
                    fs.rename(req.file.path, newFilePath, (err) => {
                        if (err) {
                            console.error("Error in moving file:", err);
                            return reject({ success: false, message: "Failed to move file" });
                        }

                        const query3 = `
                            INSERT INTO media (postId, userId, messageId, type, name)
                            VALUES (?, ?, ?, ?, ?);
                        `;
                        const values3 = [postId, userId, messageId, req.file.mimetype, newFileName];

                        pool.query(query3, values3, (error, results3) => {
                            if (error) {
                                console.error("Error in insertMessage service:", error);
                                return reject({
                                    success: false,
                                    message: "Failed to insert media",
                                });
                            }
                            resolve({ success: true, messageId });
                        });
                    });
                } else {
                    resolve({ success: true, messageId });
                }
            });
        });
    });
};

const updatePinMessageService = (req) => {
    return new Promise((resolve, reject) => {
        const postId = req.params.postId;
        const messageId = req.params.indexId;

        // 先檢查消息是否存在且未被禁用
        const checkQuery = `
            SELECT messageId 
            FROM messages 
            WHERE postId = ? AND messageId = ? AND disable = 0
        `;

        pool.query(checkQuery, [postId, messageId], (checkError, checkResults) => {
            if (checkError) {
                console.error("Error checking message:", checkError);
                return reject({ success: false, message: "Failed to check message" });
            }

            if (checkResults.length === 0) {
                return reject({ success: false, message: "Message not found or disabled" });
            }

            // 更新帖子的置頂狀態
            const updateQuery = `
                UPDATE posts 
                SET pin = ? 
                WHERE postId = ?
            `;

            pool.query(updateQuery, [messageId, postId], (updateError, updateResults) => {
                if (updateError) {
                    console.error("Error in updatePinMessage service:", updateError);
                    return reject({ success: false, message: "Failed to pin message" });
                }
                resolve({ success: true });
            });
        });
    });
};

const updateDisableMessageService = (req) => {
    return new Promise((resolve, reject) => {
        const postId = req.params.postId;
        const indexId = req.params.indexId;
        const query = `
      UPDATE messages SET disable = 1 WHERE postId = ? AND messageId = ?;
    `;

        const values = [postId, indexId];

        pool.query(query, values, (error, results) => {
            if (error) {
                console.error("Error in updateDisableMessage service:", error);
                return reject({ success: false, message: "Failed to disable message" });
            }
            resolve({ success: true });
        });
    });
};

const insertPinContentService = async(req) => {
    try {
        const userId = req.userId;
        const adminId = req.adminId; // 嘗試從驗證中獲取adminId
        const { pinContent, postId, startTime, endTime } = req.body;

        // 檢查必要參數
        if (!pinContent || !postId || !startTime || !endTime) {
            throw new Error("Missing required fields: pinContent, postId, startTime, endTime");
        }

        const formattedStartTime = new Date(startTime).toISOString().slice(0, 19).replace("T", " ");
        const formattedEndTime = new Date(endTime).toISOString().slice(0, 19).replace("T", " ");

        console.log("userId:", userId, "adminId:", adminId);

        // 如果直接從請求中獲取了adminId，則直接使用
        let finalAdminId = adminId;

        // 如果沒有從請求中獲取adminId，則嘗試從資料庫查詢
        if (!finalAdminId) {
            const adminIdQuery = `SELECT adminId FROM adminUsers WHERE userId = ?`;
            try {
                finalAdminId = await new Promise((resolve, reject) => {
                    pool.query(adminIdQuery, [userId], (error, results) => {
                        if (error) {
                            console.error("Error fetching adminId:", error);
                            return reject(new Error("Failed to fetch adminId."));
                        }
                        if (results.length === 0) {
                            return reject(new Error("adminId not found for the given userId."));
                        }
                        resolve(results[0].adminId);
                    });
                });
            } catch (error) {
                console.error("Error looking up admin ID:", error);
                throw new Error("Failed to confirm administrator status");
            }
        }

        if (!finalAdminId) {
            throw new Error("Administrator privileges required");
        }

        console.log("Creating pin content with adminId:", finalAdminId);

        const insertQuery = `INSERT INTO pinContent(adminId, postId, content, startTime, endTime) VALUES (?, ?, ?, ?, ?)`;
        try {
            const insertionResult = await new Promise((resolve, reject) => {
                pool.query(insertQuery, [finalAdminId, postId, pinContent, formattedStartTime, formattedEndTime], (error, results) => {
                    if (error) {
                        console.error("Error inserting pin content:", error);
                        return reject(error);
                    }
                    resolve({
                        success: true,
                        pinContentId: results.insertId
                    });
                });
            });
            return insertionResult;
        } catch (error) {
            console.error("Database error when inserting pin content:", error);
            throw new Error(`Failed to insert pin content: ${error.message}`);
        }

    } catch (error) {
        console.error("Error in insertPinContentService:", error);
        throw error;
    }
};

module.exports = {
    insertReactionService,
    insertPostService,
    insertMessageService,
    updatePinMessageService,
    updateDisableMessageService,
    insertPinContentService,
    createNotification,
    NotificationTypes
};