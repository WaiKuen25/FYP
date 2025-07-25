const { dbConnection } = require("../config/db");
const pool = dbConnection();

// 創建回報
exports.createReport = async(req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "未授權：請先登入" });
    }

    const { postId, messageId, type, reason } = req.body;

    if (!postId || !messageId || !type || !reason) {
        return res.status(400).json({ message: "請提供所有必要的資訊" });
    }

    try {
        const query = `
            INSERT INTO feedback (userId, postId, messageId, type, reason)
            VALUES (?, ?, ?, ?, ?)
        `;

        await pool.promise().query(query, [req.userId, postId, messageId, type, reason]);

        res.status(201).json({
            success: true,
            message: "回報已成功送出"
        });
    } catch (error) {
        console.error("創建回報時出錯:", error);
        res.status(500).json({
            success: false,
            message: "內部伺服器錯誤"
        });
    }
};

// 獲取所有回報（管理員用）
exports.getAllReports = async(req, res) => {
    if (!req.isAdmin) {
        return res.status(401).json({ message: "未授權：需要管理員權限" });
    }

    try {
        const {
            type,
            status,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
            search,
            page = 1,
            limit = 10
        } = req.query;

        let conditions = [];
        let params = [];
        let baseQuery = `
            FROM feedback f
            JOIN users u ON f.userId = u.userId
            JOIN messages m ON f.messageId = m.messageId AND f.postId = m.postId
            JOIN posts p ON f.postId = p.postId
            JOIN users mu ON m.userId = mu.userId
            WHERE 1=1
        `;

        if (type) {
            conditions.push("f.type = ?");
            params.push(type);
        }

        if (status !== undefined) {
            if (status === 'pending') {
                conditions.push("f.isAccept IS NULL");
            } else {
                conditions.push("f.isAccept = ?");
                params.push(status === 'accepted' ? 1 : 0);
            }
        }

        if (search) {
            conditions.push("(p.title LIKE ? OR m.content LIKE ? OR u.nickName LIKE ?)");
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        if (conditions.length > 0) {
            baseQuery += " AND " + conditions.join(" AND ");
        }

        // 獲取總數
        const [countResult] = await pool.promise().query(
            `SELECT COUNT(*) as total ${baseQuery}`,
            params
        );
        const total = countResult[0].total;

        // 獲取分頁數據
        const offset = (page - 1) * limit;
        const query = `
            SELECT 
                f.*,
                u.nickName as reporterName,
                m.content as messageContent,
                p.title as postTitle,
                mu.nickName as messageAuthorName
            ${baseQuery}
            ORDER BY f.${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;

        const [reports] = await pool.promise().query(
            query, [...params, parseInt(limit), offset]
        );

        // 獲取回報類型統計
        const [typeStats] = await pool.promise().query(`
            SELECT type, COUNT(*) as count
            FROM feedback
            GROUP BY type
        `);

        // 獲取狀態統計
        const [statusStats] = await pool.promise().query(`
            SELECT 
                SUM(CASE WHEN isAccept IS NULL THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN isAccept = 1 THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN isAccept = 0 THEN 1 ELSE 0 END) as rejected
            FROM feedback
        `);

        res.json({
            success: true,
            reports,
            pagination: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit),
                limit: parseInt(limit)
            },
            stats: {
                types: typeStats,
                status: statusStats[0]
            }
        });
    } catch (error) {
        console.error("獲取回報列表時出錯:", error);
        res.status(500).json({
            success: false,
            message: "內部伺服器錯誤"
        });
    }
};

// 更新回報狀態（管理員用）
exports.updateReportStatus = async(req, res) => {
    if (!req.isAdmin) {
        return res.status(401).json({ message: "未授權：需要管理員權限" });
    }

    const { feedbackId } = req.params;
    const { isAccept } = req.body;

    if (isAccept === undefined) {
        return res.status(400).json({ message: "請提供處理結果" });
    }

    try {
        const query = `
            UPDATE feedback
            SET isAccept = ?
            WHERE feedbackId = ?
        `;

        await pool.promise().query(query, [isAccept, feedbackId]);

        res.json({
            success: true,
            message: `回報已${isAccept ? '接受' : '拒絕'}`
        });
    } catch (error) {
        console.error("更新回報狀態時出錯:", error);
        res.status(500).json({
            success: false,
            message: "內部伺服器錯誤"
        });
    }
};