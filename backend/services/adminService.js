const { dbConnection } = require("../config/db");
const bcrypt = require("bcrypt");
const pool = dbConnection();

const getUserDataGridService = async(req, res) => {
    if (req.adminId == null) {
        return res.status(401).json({ message: "No Admin Token provided." }); // Respond with an error if admin token is missing
    }

    const query = `
    SELECT 
      users.userId AS id,
      users.email AS email,
      users.nickName AS nickName,
      users.department AS department,
      users.role AS role,
      users.disable AS disable,
      COUNT(posts.postId) AS createPost
    FROM 
      users
    LEFT JOIN 
      posts
    ON 
      posts.userId = users.userId
    GROUP BY 
      users.userId, users.email, users.nickName, users.department, users.role, users.disable;
  `;

    try {
        const result = await new Promise((resolve, reject) => {
            pool.query(query, (error, results) => {
                if (error) {
                    reject(error); // Handle query errors
                } else {
                    resolve(results); // Return query results
                }
            });
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

const registerAccountService = async(req, res) => {
    if (req.adminId == null) {
        return res.status(401).json({ message: "No Admin Token provided." });
    }

    const { email, password, nickName, department } = req.body;
    let role = "";
    if (email.endsWith("@stu.vtc.edu.hk")) {
        role = "student";
    } else if (email.endsWith("@vtc.edu.hk")) {
        role = "staff";
    } else {
        role = "guest";
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // 使用 Promise 包裝數據庫查詢
        await new Promise((resolve, reject) => {
            pool.query(
                "INSERT INTO users (email, password, nickName, department, role) VALUES (?, ?, ?, ?, ?)", [email, hashedPassword, nickName, department, role],
                (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            reject(new Error("Email already exists"));
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve(result);
                    }
                }
            );
        });

        return res.status(200).json({
            success: true,
            message: "User registered successfully"
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(error.message === "Email already exists" ? 400 : 500)
            .json({
                success: false,
                message: error.message === "Email already exists" ?
                    "Email already exists" : "Internal server error"
            });
    }
};

// Get broadcast notifications service
const getBroadcastNotificationsService = async() => {
    try {
        const query = `
            SELECT 
                notificationId,
                content,
                createdAt,
                isRead,
                type
            FROM notifications
            WHERE type = 'broadcast'
            GROUP BY content
            ORDER BY createdAt DESC
        `;

        const [notifications] = await pool.promise().query(query);
        return notifications;
    } catch (error) {
        throw error;
    }
};

// Create broadcast notification service
const createBroadcastNotificationService = async(content) => {
    const connection = await pool.promise().getConnection();

    try {
        await connection.beginTransaction();

        // Get all users
        const [users] = await connection.query('SELECT userId FROM users');

        // Insert notifications for all users
        for (const user of users) {
            await connection.query(
                `INSERT INTO notifications (userId, type, content) VALUES (?, 'broadcast', ?)`, [user.userId, content]
            );
        }

        // Get the last inserted notification
        const [notification] = await connection.query(
            'SELECT * FROM notifications WHERE type = "broadcast" ORDER BY notificationId DESC LIMIT 1'
        );

        await connection.commit();
        return notification[0];
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getUserDataGridService,
    registerAccountService,
    getBroadcastNotificationsService,
    createBroadcastNotificationService
};