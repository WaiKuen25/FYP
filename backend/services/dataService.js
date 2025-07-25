const { dbConnection } = require("../config/db");
const pool = dbConnection();
const { getIO } = require("../config/io");
const UserConfig = require("../models/userConfig");

const getGlobalContentService = async(req) => {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    let blockedUsersCondition = '';
    if (userId) {
        try {
            const userConfig = await UserConfig.findOne({ userId: parseInt(userId) });

            if (userConfig && userConfig.block && userConfig.block.length > 0) {
                const blockedIds = userConfig.block.filter(id => id).map(id => id.toString());

                if (blockedIds.length > 0) {
                    blockedUsersCondition = `AND posts.userId NOT IN (${blockedIds.join(',')})`;
                }
            }
        } catch (error) {
            console.error("Error fetching blocked users:", error);
        }
    }

    const query = userId ?
        `
      WITH FirstMessages AS (
        SELECT 
            m1.*
        FROM 
            messages m1
        LEFT JOIN 
            messages m2 
        ON 
            m1.postId = m2.postId AND m1.messageId > m2.messageId
        WHERE 
            m2.messageId IS NULL
      )
      SELECT 
          users.nickName AS userName,
          posts.title,
          posts.postTime AS timestamp,
          category.description AS category,
          media.name AS mediaName,
          SUM(CASE WHEN message_reactions.reaction = 1 THEN 1 ELSE 0 END) AS likeCount,
          SUM(CASE WHEN message_reactions.reaction = 0 THEN 1 ELSE 0 END) AS dislikeCount,
          MAX(CASE WHEN message_reactions.userId = ? AND message_reactions.reaction = 1 THEN 1 
               WHEN message_reactions.userId = ? AND message_reactions.reaction = 0 THEN 0 
               ELSE NULL END) AS userReaction,
          first_messages.content AS messageContent,
          posts.postId AS postId,
          posts.userId AS postUserId
      FROM 
          posts
      JOIN 
          users ON posts.userId = users.userId
      JOIN 
          category ON posts.categoryId = category.categoryId
      LEFT JOIN 
          FirstMessages AS first_messages ON posts.postId = first_messages.postId
      LEFT JOIN 
          media ON first_messages.messageId = media.messageId AND media.postId = posts.postId
      LEFT JOIN 
          message_reactions ON first_messages.messageId = message_reactions.messageId AND posts.postId = message_reactions.postId
      WHERE 
          first_messages.content IS NOT NULL
          AND posts.disable = 0
          ${blockedUsersCondition}
          
      GROUP BY 
          posts.postId, users.nickName, category.description, first_messages.content, media.name, posts.userId
      ORDER BY 
          posts.postTime DESC
      LIMIT ?, ?;
    ` :
        `
      WITH FirstMessages AS (
        SELECT 
            m1.*
        FROM 
            messages m1
        LEFT JOIN 
            messages m2 
        ON 
            m1.postId = m2.postId AND m1.messageId > m2.messageId
        WHERE 
            m2.messageId IS NULL
      )
      SELECT 
          users.nickName AS userName,
          posts.title,
          posts.postTime AS timestamp,
          category.description AS category,
          media.name AS mediaName,
          SUM(CASE WHEN message_reactions.reaction = 1 THEN 1 ELSE 0 END) AS likeCount,
          SUM(CASE WHEN message_reactions.reaction = 0 THEN 1 ELSE 0 END) AS dislikeCount,
          NULL AS userReaction,
          first_messages.content AS messageContent,
          posts.postId AS postId,
          posts.userId AS postUserId
      FROM 
          posts
      JOIN 
          users ON posts.userId = users.userId
      JOIN 
          category ON posts.categoryId = category.categoryId
      LEFT JOIN 
          FirstMessages AS first_messages ON posts.postId = first_messages.postId
      LEFT JOIN 
          media ON first_messages.messageId = media.messageId AND media.postId = posts.postId
      LEFT JOIN 
          message_reactions ON first_messages.messageId = message_reactions.messageId AND posts.postId = message_reactions.postId
      WHERE 
          first_messages.content IS NOT NULL
          AND posts.disable = 0
          ${blockedUsersCondition}
          
      GROUP BY 
          posts.postId, users.nickName, category.description, first_messages.content, media.name, posts.userId
      ORDER BY 
          posts.postTime DESC
      LIMIT ?, ?;
    `;

    try {
        const queryParams = userId ? [userId, userId, offset, limit] : [offset, limit];

        const [results] = await pool.promise().query(query, queryParams);
        return results;
    } catch (error) {
        console.error("Error fetching global content:", error);
        throw error;
    }
};

const getCategoryContentService = async(req) => {
    const userId = req.userId;
    const categoryId = req.params.categoryId;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    let blockedUsersCondition = '';
    if (userId) {
        try {
            const userConfig = await UserConfig.findOne({ userId: parseInt(userId) });

            if (userConfig && userConfig.block && userConfig.block.length > 0) {
                const blockedIds = userConfig.block.filter(id => id).map(id => id.toString());

                if (blockedIds.length > 0) {
                    blockedUsersCondition = `AND posts.userId NOT IN (${blockedIds.join(',')})`;
                }
            }
        } catch (error) {
            console.error("Error fetching blocked users:", error);
        }
    }

    const query = userId ?
        `
      WITH FirstMessages AS (
        SELECT 
            m1.*
        FROM 
            messages m1
        LEFT JOIN 
            messages m2 
        ON 
            m1.postId = m2.postId AND m1.messageId > m2.messageId
        WHERE 
            m2.messageId IS NULL
      )
      SELECT 
          users.nickName AS userName,
          posts.title,
          posts.postTime AS timestamp,
          category.description AS category,
          media.name AS mediaName,
          SUM(CASE WHEN message_reactions.reaction = 1 THEN 1 ELSE 0 END) AS likeCount,
          SUM(CASE WHEN message_reactions.reaction = 0 THEN 1 ELSE 0 END) AS dislikeCount,
          MAX(CASE WHEN message_reactions.userId = ? AND message_reactions.reaction = 1 THEN 1 
               WHEN message_reactions.userId = ? AND message_reactions.reaction = 0 THEN 0 
               ELSE NULL END) AS userReaction,
          first_messages.content AS messageContent,
          posts.postId AS postId,
          posts.userId AS postUserId
      FROM 
          posts
      JOIN 
          users ON posts.userId = users.userId
      JOIN 
          category ON posts.categoryId = category.categoryId
      LEFT JOIN 
          FirstMessages AS first_messages ON posts.postId = first_messages.postId
      LEFT JOIN 
          media ON first_messages.messageId = media.messageId AND media.postId = posts.postId
      LEFT JOIN 
          message_reactions ON first_messages.messageId = message_reactions.messageId AND posts.postId = message_reactions.postId
      WHERE 
          first_messages.content IS NOT NULL
          AND posts.categoryId = ?
          AND posts.disable = 0
          ${blockedUsersCondition}
          
      GROUP BY 
          posts.postId, users.nickName, category.description, first_messages.content, media.name, posts.userId
      ORDER BY 
          posts.postTime DESC
      LIMIT ?, ?;
    ` :
        `
      WITH FirstMessages AS (
        SELECT 
            m1.*
        FROM 
            messages m1
        LEFT JOIN 
            messages m2 
        ON 
            m1.postId = m2.postId AND m1.messageId > m2.messageId
        WHERE 
            m2.messageId IS NULL
      )
      SELECT 
          users.nickName AS userName,
          posts.title,
          posts.postTime AS timestamp,
          category.description AS category,
          media.name AS mediaName,
          SUM(CASE WHEN message_reactions.reaction = 1 THEN 1 ELSE 0 END) AS likeCount,
          SUM(CASE WHEN message_reactions.reaction = 0 THEN 1 ELSE 0 END) AS dislikeCount,
          NULL AS userReaction,
          first_messages.content AS messageContent,
          posts.postId AS postId,
          posts.userId AS postUserId
      FROM 
          posts
      JOIN 
          users ON posts.userId = users.userId
      JOIN 
          category ON posts.categoryId = category.categoryId
      LEFT JOIN 
          FirstMessages AS first_messages ON posts.postId = first_messages.postId
      LEFT JOIN 
          media ON first_messages.messageId = media.messageId AND media.postId = posts.postId
      LEFT JOIN 
          message_reactions ON first_messages.messageId = message_reactions.messageId AND posts.postId = message_reactions.postId
      WHERE 
          first_messages.content IS NOT NULL
          AND posts.categoryId = ?
          AND posts.disable = 0
          ${blockedUsersCondition}
          
      GROUP BY 
          posts.postId, users.nickName, category.description, first_messages.content, media.name, posts.userId
      ORDER BY 
          posts.postTime DESC
      LIMIT ?, ?;
    `;

    try {
        const queryParams = userId ? [userId, userId, categoryId, offset, limit] : [categoryId, offset, limit];

        const [results] = await pool.promise().query(query, queryParams);
        return results;
    } catch (error) {
        console.error("Error fetching category content:", error);
        throw error;
    }
};

const getReplyListService = async(req) => {
        const userId = req.userId;
        const { postId, messageId } = req.query;

        const query = `
        SELECT 
            m.messageTime AS timestamp,
            media.name AS mediaName,
            COALESCE(likes.likeCount, 0) AS likeCount,
            COALESCE(dislikes.dislikeCount, 0) AS dislikeCount,
            ${userId ? 'reactions.userReaction,' : 'NULL AS userReaction,'}
            m.messageId,
            m.reply AS replyIndex,
            m.content AS messageContent,
            messageAuthor.userId,
            messageAuthor.nickName AS userName,
            (SELECT COUNT(*) FROM messages WHERE reply = m.messageId) AS replyCount
        FROM 
            messages m
            LEFT JOIN users messageAuthor ON m.userId = messageAuthor.userId
            LEFT JOIN media ON m.messageId = media.messageId AND media.postId = m.postId
            LEFT JOIN (
                SELECT messageId, COUNT(*) AS likeCount
                FROM message_reactions
                WHERE postId = ? AND reaction = 1
                GROUP BY messageId
            ) likes ON m.messageId = likes.messageId
            LEFT JOIN (
                SELECT messageId, COUNT(*) AS dislikeCount
                FROM message_reactions
                WHERE postId = ? AND reaction = 0
                GROUP BY messageId
            ) dislikes ON m.messageId = dislikes.messageId
            ${userId ? `
            LEFT JOIN (
                SELECT messageId,
                CASE 
                    WHEN reaction = 1 THEN 1
                    WHEN reaction = 0 THEN 0
                    ELSE NULL
                END AS userReaction
                FROM message_reactions
                WHERE postId = ? AND userId = ?
            ) reactions ON m.messageId = reactions.messageId
            ` : ''}
        WHERE 
            m.content IS NOT NULL 
            AND m.disable = 0
            AND m.postId = ?
            AND m.reply = ?
        ORDER BY 
            m.messageTime ASC;
    `;

    try {
        const params = userId
            ? [postId, postId, postId, userId, postId, messageId]
            : [postId, postId, postId, messageId];
        const [results] = await pool.promise().query(query, params);
        return { data: results };
    } catch (error) {
        console.error("Error fetching reply list:", error);
        throw error;
    }
};

const pollDatabaseGlobal = async() => {
    try {
        const data = await getGlobalContentService({ query: { page: 1 } });
        const io = getIO();
        io.emit("dbData", data);
    } catch (error) {
        console.error("Error polling data:", error);
    }
};

const pollDatabaseCategory = async(categoryId) => {
    try {
        const req = { query: { page: 1 }, params: { categoryId } };
        const data = await getCategoryContentService(req);
        const io = getIO();
        io.emit(`dbDataCategory-${categoryId}`, data);
    } catch (error) {
        console.error("Error polling data:", error);
    }
};

setInterval(pollDatabaseGlobal, 10000);

const categoryIds = [1, 2, 3, 4, 5, 6, 7];

categoryIds.forEach((categoryId) => {
    setInterval(() => pollDatabaseCategory(categoryId), 5000);
});

const pollDatabasePost = async(postId) => {
    try {
        const req = { params: { postId: postId } };
        const data = await getPostContentService(req);
        const io = getIO();
        if (data) {
            io.emit(`dbDataPost-${postId}`, data);
        }
    } catch (error) {
        console.error("Error polling post data:", error);
    }
};

// 修改 getPostContentService 以追蹤最後一次的數據
let lastPostData = {};

const getPostContentService = async(req) => {
    const userId = req.userId;
    const { postId } = req.params;

    const baseQuery = `
        SELECT 
            p.title,
            c.description AS category,
            postAuthor.nickName AS postAuthorName,
            postAuthor.userId AS postAuthorId,
            m.messageTime AS timestamp,
            m.messageId,
            m.reply AS replyIndex,
            m.content AS messageContent,
            messageAuthor.nickName AS userName,
            messageAuthor.userId AS messageUserId,
            media.name AS mediaName,
            COALESCE(likes.likeCount, 0) AS likeCount,
            COALESCE(dislikes.dislikeCount, 0) AS dislikeCount,
            ${userId ? 'reactions.userReaction,' : 'NULL AS userReaction,'}
            (SELECT COUNT(*) FROM messages WHERE reply = m.messageId AND disable = 0 AND postId = ?) AS replyCount
        FROM 
            posts p
            JOIN users postAuthor ON p.userId = postAuthor.userId
            JOIN category c ON p.categoryId = c.categoryId
            LEFT JOIN messages m ON p.postId = m.postId
            LEFT JOIN users messageAuthor ON m.userId = messageAuthor.userId
            LEFT JOIN media ON m.messageId = media.messageId AND media.postId = p.postId
            LEFT JOIN messages pinMsg ON p.pin = pinMsg.messageId
            LEFT JOIN (
                SELECT messageId, COUNT(*) AS likeCount
                FROM message_reactions
                WHERE postId = ? AND reaction = 1
                GROUP BY messageId
            ) likes ON m.messageId = likes.messageId
            LEFT JOIN (
                SELECT messageId, COUNT(*) AS dislikeCount
                FROM message_reactions
                WHERE postId = ? AND reaction = 0
                GROUP BY messageId
            ) dislikes ON m.messageId = dislikes.messageId
            ${userId ? `
            LEFT JOIN (
                SELECT messageId,
                CASE 
                    WHEN reaction = 1 THEN 1
                    WHEN reaction = 0 THEN 0
                    ELSE NULL
                END AS userReaction
                FROM message_reactions
                WHERE postId = ? AND userId = ?
            ) reactions ON m.messageId = reactions.messageId
            ` : ''}
        WHERE 
            m.content IS NOT NULL 
            AND m.disable = 0
            AND p.postId = ?
        ORDER BY 
            m.messageTime ASC;
    `;

    try {
        const params = userId
            ? [postId, postId, postId, postId, userId, postId]
            : [postId, postId, postId, postId];
        const [results] = await pool.promise().query(baseQuery, params);

        if (results.length === 0) return null;

        const uniqueMessages = results.filter(
            (value, index, self) =>
                index === self.findIndex((t) => t.messageId === value.messageId)
        );

        const { pinId, pinContent, postAuthorId, postAuthorName, ...firstPost } = results[0];
        
        const formattedData = {
            title: firstPost.title,
            category: firstPost.category,
            postId: postId,
            hostId: postAuthorId,
            postAuthorName: postAuthorName,
            pin: pinId ? { pinId, pinContent } : null,
            data: uniqueMessages.map(({
                title, category, pinId, pinContent, postAuthorId,
                postAuthorName, messageUserId, userName, ...rest
            }) => ({
                ...rest,
                userId: messageUserId,
                userName: userName,
            }))
        };

        // 檢查是否有新回覆
        if (lastPostData[postId]) {
            const newMessages = formattedData.data.filter(newMsg => 
                !lastPostData[postId].data.some(oldMsg => 
                    oldMsg.messageId === newMsg.messageId
                )
            );

            // 發送新回覆事件
            if (newMessages.length > 0) {
                const io = getIO();
                newMessages.forEach(newMsg => {
                    io.emit(`newReply-${postId}`, newMsg);
                });
            }
        }

        // 更新最後一次的數據
        lastPostData[postId] = formattedData;
        
        return formattedData;
    } catch (error) {
        console.error("Error fetching post content:", error);
        throw error;
    }
};

const getFirstMessageContentService = async (req) => {
    const userId = req.userId;
    const { postId } = req.params;

    const likesSubquery = `
        (SELECT 
            messageId,
            SUM(CASE WHEN reaction = 1 THEN 1 ELSE 0 END) AS likeCount
         FROM message_reactions
         WHERE postId = ?
         GROUP BY messageId) AS likes
    `;

    const dislikesSubquery = `
        (SELECT 
            messageId,
            SUM(CASE WHEN reaction = 0 THEN 1 ELSE 0 END) AS dislikeCount
         FROM message_reactions
         WHERE postId = ?
         GROUP BY messageId) AS dislikes
    `;

    const reactionsSubquery = userId ? `
        LEFT JOIN 
            (SELECT 
                messageId,
                MAX(CASE WHEN userId = ? AND reaction = 1 THEN 1 
                        WHEN userId = ? AND reaction = 0 THEN 0 
                        ELSE NULL END) AS userReaction
             FROM message_reactions
             WHERE postId = ?
             GROUP BY messageId) AS reactions ON m.messageId = reactions.messageId
    ` : "";

    const mainQuery = `
        WITH FirstMessages AS (
            SELECT 
                m1.*
            FROM 
                messages m1
            LEFT JOIN 
                messages m2 
            ON 
                m1.postId = m2.postId AND m1.messageId > m2.messageId
            WHERE 
                m2.messageId IS NULL
                AND m1.postId = ?
        )
        SELECT 
            p.title,
            c.description AS category,
            m.messageTime AS timestamp,
            media.name AS mediaName,
            likes.likeCount,
            dislikes.dislikeCount,
            ${userId ? "reactions.userReaction" : "NULL AS userReaction"},
            m.content AS messageContent,
            messageAuthor.nickName AS userName,
            p.postId,
            m.messageId AS debugMessageId -- For debugging
        FROM 
            posts p
        JOIN 
            category c ON p.categoryId = c.categoryId
        LEFT JOIN 
            FirstMessages m ON p.postId = m.postId
        LEFT JOIN 
            users messageAuthor ON m.userId = messageAuthor.userId
        LEFT JOIN 
            media ON m.messageId = media.messageId AND media.postId = p.postId
        LEFT JOIN 
            ${likesSubquery} ON m.messageId = likes.messageId
        LEFT JOIN 
            ${dislikesSubquery} ON m.messageId = dislikes.messageId
        ${reactionsSubquery}
        WHERE 
            p.postId = ?
            AND m.content IS NOT NULL -- Moved from CTE to match getGlobalContentService
        GROUP BY 
            p.postId, p.title, c.description, m.messageTime, m.content, 
            messageAuthor.nickName, media.name, likes.likeCount, dislikes.dislikeCount
            ${userId ? ", reactions.userReaction" : ""}
        ORDER BY 
            m.messageTime ASC
    `;

    try {
        const queryParams = userId
            ? [postId, postId, userId, userId, postId, postId, postId] // 7 params
            : [postId, postId, postId, postId]; // 4 params

        const [results] = await pool.promise().query(mainQuery, queryParams);


        if (!results.length) {
            console.log(`No first message found for postId ${postId}`);
            const debugQuery = `
                SELECT messageId, content, disable 
                FROM messages 
                WHERE postId = ?
                ORDER BY messageId ASC;
            `;
            const debugMediaQuery = `
                SELECT messageId, name 
                FROM media 
                WHERE postId = ?
                ORDER BY messageId ASC;
            `;
            const [debugResults] = await pool.promise().query(debugQuery, [postId]);
            const [debugMediaResults] = await pool.promise().query(debugMediaQuery, [postId]);
            console.log(`All messages for postId ${postId}:`, debugResults);
            console.log(`All media for postId ${postId}:`, debugMediaResults);
            return null;
        }

        const result = results[0];
        return {
            userName: result.userName,
            title: result.title,
            timestamp: result.timestamp,
            category: result.category,
            mediaName: result.mediaName,
            likeCount: String(result.likeCount || 0),
            dislikeCount: String(result.dislikeCount || 0),
            userReaction: result.userReaction,
            messageContent: result.messageContent,
            postId: parseInt(result.postId)
        };
    } catch (error) {
        console.error("Error fetching post content:", error);
        throw new Error(`Database query failed: ${error.message}`);
    }
};

const getCategoryService = async () => {
  const query = `
    SELECT * FROM category;
  `;

  try {
    const [results] = await pool.promise().query(query);

    return results;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

const getOneCategoryService = async (req) => {
  const categoryId = req.query.categoryId
  const query = `
    SELECT * FROM category WHERE categoryId = ?;
  `;
  try{
  const [results] = await pool.promise().query(query, [categoryId]);
  return results;
  }catch (error) {
    console.error("DataService -> getOnecategoryService:", error);
    throw error;
  }
}

const getPostOneContentService = async (req) => {
  const postId = req.query.postId;
  const startIndex = req.query.index;

  try {
    const chain = [];
    let currentIndex = startIndex;

    while (currentIndex) {
      const query = `
        SELECT messageId, content, reply 
        FROM messages 
        WHERE postId = ? AND messageId = ?
      `;

      const [results] = await pool
        .promise()
        .query(query, [postId, currentIndex]);

      if (results.length > 0) {
        chain.push({
          messageId: results[0].messageId,
          content: results[0].content,
        });
        currentIndex = results[0].reply; // 使用 reply 欄位獲取下一個訊息
      } else {
        break;
      }
    }

    return {
      chain: chain.reverse(), // 反轉數組使其按正確順序顯示
    };
  } catch (error) {
    console.error("Error fetching reply chain:", error);
    throw error;
  }
};

const getPinContentService = async (req) => {
    const postId = req.query.postId; // Get postId from the request query
    const userId = req.userId || null; // Optional userId for personalization

    const query = `
        SELECT 
            users.nickName AS userName,
            posts.title,
            posts.postTime AS timestamp,
            media.name AS mediaName,
            SUM(CASE WHEN message_reactions.reaction = 1 THEN 1 ELSE 0 END) AS likeCount,
            SUM(CASE WHEN message_reactions.reaction = 0 THEN 1 ELSE 0 END) AS dislikeCount,
            MAX(CASE WHEN message_reactions.userId = ? AND message_reactions.reaction = 1 THEN 1 
                     WHEN message_reactions.userId = ? AND message_reactions.reaction = 0 THEN 0 
                     ELSE NULL END) AS userReaction,
            messages.content AS messageContent
        FROM 
            posts
        JOIN 
            users ON posts.userId = users.userId
        LEFT JOIN 
            messages ON posts.postId = messages.postId
        LEFT JOIN 
            media ON posts.postId = media.postId
        LEFT JOIN 
            message_reactions ON messages.messageId = message_reactions.messageId
        WHERE 
            posts.postId = ? AND
            messages.messageId = 1
        GROUP BY 
            posts.postId, users.nickName, media.name, messages.content;
    `;

    try {
        const [results] = await pool.promise().query(query, [userId, userId, postId]);
        return results;
    } catch (error) {
        console.error("Error fetching pinned post data:", error);
        throw error;
    }
};

const getAllPinContentService = async (req) => {
    const userId = req.userId;

    const query = `
        SELECT 
            pinContent.content AS pinContent,
            users.nickName AS userName,
            posts.title,
            posts.postTime AS timestamp,
            media.name AS mediaName,
            SUM(CASE WHEN message_reactions.reaction = 1 THEN 1 ELSE 0 END) AS likeCount,
            SUM(CASE WHEN message_reactions.reaction = 0 THEN 1 ELSE 0 END) AS dislikeCount,
            MAX(CASE WHEN message_reactions.userId = ? AND message_reactions.reaction = 1 THEN 1 
                     WHEN message_reactions.userId = ? AND message_reactions.reaction = 0 THEN 0 
                     ELSE NULL END) AS userReaction,
            messages.content AS messageContent,
            posts.postId,
            pinContent.startTime,
            pinContent.endTime,
            pinContent.disable
        FROM 
            posts
        JOIN 
            users ON posts.userId = users.userId
        LEFT JOIN 
            messages ON posts.postId = messages.postId
        LEFT JOIN 
            media ON posts.postId = media.postId
        LEFT JOIN 
            message_reactions ON messages.messageId = message_reactions.messageId
        LEFT JOIN 
            pinContent ON posts.postId = pinContent.postId
        WHERE 
            messages.messageId = 1
        GROUP BY 
            posts.postId, users.nickName, media.name, messages.content, pinContent.content, pinContent.startTime, pinContent.endTime, pinContent.disable;
    `;

    try {
        const [results] = await pool.promise().query(query, [userId, userId]); // Replace `userId` appropriately
        const now = new Date();

        const validPins = results.filter(pin => {
            if (pin.disable === 1) return false;
            const startTime = new Date(pin.startTime);
            const endTime = new Date(pin.endTime);
            return now >= startTime && now <= endTime;
        });

        return validPins;
    } catch (error) {
        console.error("Error fetching all pinned content:", error);
        throw error;
    }
};

// 為每個訪問過的貼文設置輪詢
const activePolls = new Set();

const startPostPolling = (postId) => {
    if (!activePolls.has(postId)) {
        const pollInterval = setInterval(() => pollDatabasePost(postId), 5000);
        activePolls.add(postId);
        // 清理機制：如果 30 分鐘內沒有新的請求，停止輪詢
        setTimeout(() => {
            clearInterval(pollInterval);
            activePolls.delete(postId);
        }, 30 * 60 * 1000);
    }
};

const getPostContentByPageService = async (req) => {
    const userId = req.userId;
    const { postId, offset = 0, limit = 10 } = req.params;

    try {
        // 首先獲取帖子的置頂消息ID
        const pinQuery = `
            SELECT pin 
            FROM posts 
            WHERE postId = ?;
        `;

        const [pinResults] = await pool.promise().query(pinQuery, [postId]);
        let pinInfo = null;

        if (pinResults.length > 0 && pinResults[0].pin) {
            // 如果有置頂消息，獲取該消息的內容
            const pinnedMessageQuery = `
                SELECT 
                    m.messageId,
                    m.content AS messageContent,
                    m.messageTime AS timestamp,
                    u.nickName AS userName,
                    u.userId,
                    COALESCE(likes.likeCount, 0) AS likeCount,
                    COALESCE(dislikes.dislikeCount, 0) AS dislikeCount,
                    reactions.userReaction,
                    media.name AS mediaName,
                    (SELECT COUNT(*) FROM messages WHERE reply = m.messageId AND disable = 0 AND postId = ?) AS replyCount
                FROM messages m
                JOIN users u ON m.userId = u.userId
                LEFT JOIN media ON m.messageId = media.messageId AND media.postId = m.postId
                LEFT JOIN (
                    SELECT messageId, COUNT(*) AS likeCount
                    FROM message_reactions
                    WHERE postId = ? AND reaction = 1
                    GROUP BY messageId
                ) likes ON m.messageId = likes.messageId
                LEFT JOIN (
                    SELECT messageId, COUNT(*) AS dislikeCount
                    FROM message_reactions
                    WHERE postId = ? AND reaction = 0
                    GROUP BY messageId
                ) dislikes ON m.messageId = dislikes.messageId
                LEFT JOIN (
                    SELECT messageId,
                    CASE 
                        WHEN reaction = 1 THEN 1
                        WHEN reaction = 0 THEN 0
                        ELSE NULL
                    END AS userReaction
                    FROM message_reactions
                    WHERE postId = ? AND userId = ?
                ) reactions ON m.messageId = reactions.messageId
                WHERE m.postId = ? AND m.messageId = ? AND m.disable = 0;
            `;

            const [pinnedMessage] = await pool.promise().query(
                pinnedMessageQuery, 
                [postId, postId, postId, postId, userId, postId, pinResults[0].pin]
            );

            if (pinnedMessage.length > 0) {
                pinInfo = pinnedMessage[0];
            }
        }

        // 主查詢
        const query = `
            SELECT 
                p.title,
                p.userId as hostId,
                c.description AS category,
                m.messageTime AS timestamp,
                m.messageId,
                m.reply AS replyIndex,
                m.content AS messageContent,
                u.nickName AS userName,
                u.userId,
                media.name AS mediaName,
                COALESCE(likes.likeCount, 0) AS likeCount,
                COALESCE(dislikes.dislikeCount, 0) AS dislikeCount,
                reactions.userReaction,
                (SELECT COUNT(*) FROM messages WHERE reply = m.messageId AND disable = 0 AND postId = ?) AS replyCount
            FROM 
                posts p
                LEFT JOIN messages m ON p.postId = m.postId
                LEFT JOIN users u ON m.userId = u.userId
                JOIN category c ON p.categoryId = c.categoryId
                LEFT JOIN media ON m.messageId = media.messageId AND media.postId = p.postId
                LEFT JOIN (
                    SELECT postId, messageId, COUNT(*) AS likeCount
                    FROM message_reactions
                    WHERE postId = ? AND reaction = 1
                    GROUP BY postId, messageId
                ) likes ON m.messageId = likes.messageId
                LEFT JOIN (
                    SELECT postId, messageId, COUNT(*) AS dislikeCount
                    FROM message_reactions
                    WHERE postId = ? AND reaction = 0
                    GROUP BY postId, messageId
                ) dislikes ON m.messageId = dislikes.messageId
                LEFT JOIN (
                    SELECT messageId,
                    CASE 
                        WHEN reaction = 1 THEN 1
                        WHEN reaction = 0 THEN 0
                        ELSE NULL
                    END AS userReaction
                    FROM message_reactions
                    WHERE postId = ? AND userId = ?
                ) reactions ON m.messageId = reactions.messageId
            WHERE 
                p.postId = ?
                AND m.disable = 0
            ORDER BY 
                m.messageTime ASC
            LIMIT ?, ?;
        `;

        const queryParams = [
            postId, // for replyCount
            postId, // for likes subquery
            postId, // for dislikes subquery
            postId, // for reactions subquery
            userId, // for reactions subquery
            postId, // for main WHERE clause
            parseInt(offset),
            parseInt(limit)
        ];

        const [messages] = await pool.promise().query(query, queryParams);

        if (!messages || messages.length === 0) {
            return null;
        }

        // 從第一條消息中獲取 hostId
        const hostId = messages[0].hostId;

        return {
            success: true,
            hostId,
            messages: messages.map(message => ({
                ...message,
                hostId: undefined // 移除每條消息中的 hostId
            })),
            pinInfo
        };
    } catch (error) {
        console.error("Error in getPostContentByPageService:", error);
        throw error;
    }
};

const getHotContentService = async(req) => {
    const userId = req.userId;
    const timeRange = req.query.timeRange || '7';
    const categoryId = req.query.categoryId;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    console.log('Debug Info:', {
        userId,
        timeRange,
        categoryId,
        page,
        limit,
        offset
    });

    let categoryCondition = '';
    let timeCondition = '';
    let queryParams = [];

    // Add userId parameters for userReaction
    if (userId) {
        queryParams.push(userId, userId);
    }

    // Add time range condition
    if (timeRange !== 'all') {
        const days = parseInt(timeRange) || 7;
        timeCondition = 'AND posts.postTime >= DATE_SUB(NOW(), INTERVAL ? DAY)';
        queryParams.push(days);
    }

    // Add category condition
    if (categoryId) {
        categoryCondition = 'AND posts.categoryId = ?';
        queryParams.push(categoryId);
    }

    // Add pagination parameters
    queryParams.push(offset, limit);

    let blockedUsersCondition = '';
    if (userId) {
        try {
            const userConfig = await UserConfig.findOne({ userId: parseInt(userId) });

            if (userConfig && userConfig.block && userConfig.block.length > 0) {
                const blockedIds = userConfig.block.filter(id => id).map(id => id.toString());

                if (blockedIds.length > 0) {
                    blockedUsersCondition = `AND posts.userId NOT IN (${blockedIds.join(',')})`;
                }
            }
        } catch (error) {
            console.error("Error fetching blocked users:", error);
        }
    }

    const query = userId ?
        `
      WITH FirstMessages AS (
        SELECT 
            m1.*
        FROM 
            messages m1
        LEFT JOIN 
            messages m2 
        ON 
            m1.postId = m2.postId AND m1.messageId > m2.messageId
        WHERE 
            m2.messageId IS NULL
      )
      SELECT 
          users.nickName AS userName,
          posts.title,
          posts.postTime AS timestamp,
          category.description AS category,
          media.name AS mediaName,
          SUM(CASE WHEN message_reactions.reaction = 1 THEN 1 ELSE 0 END) AS likeCount,
          SUM(CASE WHEN message_reactions.reaction = 0 THEN 1 ELSE 0 END) AS dislikeCount,
          MAX(CASE WHEN message_reactions.userId = ? AND message_reactions.reaction = 1 THEN 1 
               WHEN message_reactions.userId = ? AND message_reactions.reaction = 0 THEN 0 
               ELSE NULL END) AS userReaction,
          first_messages.content AS messageContent,
          posts.postId AS postId,
          COUNT(DISTINCT message_reactions.messageId) as reactionCount
      FROM 
          posts
      JOIN 
          users ON posts.userId = users.userId
      JOIN 
          category ON posts.categoryId = category.categoryId
      LEFT JOIN 
          FirstMessages AS first_messages ON posts.postId = first_messages.postId
      LEFT JOIN 
          media ON first_messages.messageId = media.messageId AND media.postId = posts.postId
      LEFT JOIN 
          message_reactions ON first_messages.messageId = message_reactions.messageId AND posts.postId = message_reactions.postId
      WHERE 
          first_messages.content IS NOT NULL
          AND posts.disable = 0
          ${timeCondition}
          ${categoryCondition}
          ${blockedUsersCondition}
      GROUP BY 
          posts.postId, users.nickName, category.description, first_messages.content, media.name
      ORDER BY 
          reactionCount DESC, posts.postTime DESC
      LIMIT ?, ?;
    ` :
        `
      WITH FirstMessages AS (
        SELECT 
            m1.*
        FROM 
            messages m1
        LEFT JOIN 
            messages m2 
        ON 
            m1.postId = m2.postId AND m1.messageId > m2.messageId
        WHERE 
            m2.messageId IS NULL
      )
      SELECT 
          users.nickName AS userName,
          posts.title,
          posts.postTime AS timestamp,
          category.description AS category,
          media.name AS mediaName,
          SUM(CASE WHEN message_reactions.reaction = 1 THEN 1 ELSE 0 END) AS likeCount,
          SUM(CASE WHEN message_reactions.reaction = 0 THEN 1 ELSE 0 END) AS dislikeCount,
          NULL AS userReaction,
          first_messages.content AS messageContent,
          posts.postId AS postId,
          COUNT(DISTINCT message_reactions.messageId) as reactionCount
      FROM 
          posts
      JOIN 
          users ON posts.userId = users.userId
      JOIN 
          category ON posts.categoryId = category.categoryId
      LEFT JOIN 
          FirstMessages AS first_messages ON posts.postId = first_messages.postId
      LEFT JOIN 
          media ON first_messages.messageId = media.messageId AND media.postId = posts.postId
      LEFT JOIN 
          message_reactions ON first_messages.messageId = message_reactions.messageId AND posts.postId = message_reactions.postId
      WHERE 
          first_messages.content IS NOT NULL
          AND posts.disable = 0
          ${timeCondition}
          ${categoryCondition}
          ${blockedUsersCondition}
      GROUP BY 
          posts.postId, users.nickName, category.description, first_messages.content, media.name
      ORDER BY 
          reactionCount DESC, posts.postTime DESC
      LIMIT ?, ?;
    `;

    try {
        console.log('SQL Query:', query);
        console.log('Query Parameters:', queryParams);

        const [results] = await pool.promise().query(query, queryParams);
        
        return results;
    } catch (error) {
        console.error("Error fetching hot content:", error);
        throw error;
    }
};

const searchMessagesService = async (req) => {
  const userId = req.userId;
  const { keyword } = req.query;
  const limit = 3; // 只返回前3條結果

  // 基本搜尋查詢
  const query = `
    SELECT 
      m.messageId,
      m.content AS messageContent,
      m.messageTime AS timestamp,
      p.postId,
      p.title AS postTitle,
      u.nickName AS userName,
      u.userId,
      c.description AS category,
      media.name AS mediaName,
      COALESCE(likes.likeCount, 0) AS likeCount,
      COALESCE(dislikes.dislikeCount, 0) AS dislikeCount,
      ${userId ? 'reactions.userReaction,' : 'NULL AS userReaction,'}
      (SELECT COUNT(*) FROM messages WHERE reply = m.messageId AND disable = 0) AS replyCount
    FROM 
      messages m
      JOIN posts p ON m.postId = p.postId
      JOIN users u ON m.userId = u.userId
      JOIN category c ON p.categoryId = c.categoryId
      LEFT JOIN media ON m.messageId = media.messageId AND media.postId = p.postId
      LEFT JOIN (
        SELECT messageId, COUNT(*) AS likeCount
        FROM message_reactions
        WHERE reaction = 1
        GROUP BY messageId
      ) likes ON m.messageId = likes.messageId
      LEFT JOIN (
        SELECT messageId, COUNT(*) AS dislikeCount
        FROM message_reactions
        WHERE reaction = 0
        GROUP BY messageId
      ) dislikes ON m.messageId = dislikes.messageId
      ${userId ? `
      LEFT JOIN (
        SELECT messageId,
        CASE 
          WHEN reaction = 1 THEN 1
          WHEN reaction = 0 THEN 0
          ELSE NULL
        END AS userReaction
        FROM message_reactions
        WHERE userId = ?
      ) reactions ON m.messageId = reactions.messageId
      ` : ''}
    WHERE 
      m.content IS NOT NULL 
      AND m.disable = 0
      AND m.content LIKE ?
    ORDER BY 
      likes.likeCount DESC, m.messageTime DESC
    LIMIT ?;
  `;

  try {
    const searchPattern = `%${keyword}%`;
    const params = userId
      ? [userId, searchPattern, limit]
      : [searchPattern, limit];

    const [results] = await pool.promise().query(query, params);
    
    return {
      success: true,
      data: results
    };
  } catch (error) {
    console.error("Error searching messages:", error);
    throw error;
  }
};

const extendedSearchMessagesService = async (req) => {
  const userId = req.userId;
  const { keyword, page = 1, sort = 'relevant' } = req.query;
  const limit = 10; // 每頁顯示 10 條結果
  const offset = (parseInt(page) - 1) * limit;

  // 根據排序選項設置排序條件
  let orderBy;
  switch (sort) {
    case 'new':
      orderBy = 'm.messageTime DESC';
      break;
    case 'top':
      orderBy = 'likes.likeCount DESC, m.messageTime DESC';
      break;
    case 'relevant':
    default:
      // 相關性排序：先按關鍵詞出現次數，再按點贊數和時間排序
      orderBy = 'CASE WHEN m.content LIKE ? THEN 2 WHEN m.content LIKE ? THEN 1 ELSE 0 END DESC, likes.likeCount DESC, m.messageTime DESC';
      break;
  }

  // 基本搜尋查詢
  let query = `
    SELECT 
      m.messageId,
      m.content AS messageContent,
      m.messageTime AS timestamp,
      p.postId,
      p.title AS postTitle,
      u.nickName AS userName,
      u.userId,
      c.description AS category,
      media.name AS mediaName,
      COALESCE(likes.likeCount, 0) AS likeCount,
      COALESCE(dislikes.dislikeCount, 0) AS dislikeCount,
      ${userId ? 'reactions.userReaction,' : 'NULL AS userReaction,'}
      (SELECT COUNT(*) FROM messages WHERE reply = m.messageId AND disable = 0) AS replyCount
    FROM 
      messages m
      JOIN posts p ON m.postId = p.postId
      JOIN users u ON m.userId = u.userId
      JOIN category c ON p.categoryId = c.categoryId
      LEFT JOIN media ON m.messageId = media.messageId AND media.postId = p.postId
      LEFT JOIN (
        SELECT messageId, COUNT(*) AS likeCount
        FROM message_reactions
        WHERE reaction = 1
        GROUP BY messageId
      ) likes ON m.messageId = likes.messageId
      LEFT JOIN (
        SELECT messageId, COUNT(*) AS dislikeCount
        FROM message_reactions
        WHERE reaction = 0
        GROUP BY messageId
      ) dislikes ON m.messageId = dislikes.messageId
      ${userId ? `
      LEFT JOIN (
        SELECT messageId,
        CASE 
          WHEN reaction = 1 THEN 1
          WHEN reaction = 0 THEN 0
          ELSE NULL
        END AS userReaction
        FROM message_reactions
        WHERE userId = ?
      ) reactions ON m.messageId = reactions.messageId
      ` : ''}
    WHERE 
      m.content IS NOT NULL 
      AND m.disable = 0
      AND (m.content LIKE ? OR p.title LIKE ?)
  `;

  // 如果是相關性排序，添加額外的條件參數
  if (sort === 'relevant' || sort === '') {
    query += ` ORDER BY ${orderBy}`;
  } else {
    query += ` ORDER BY ${orderBy}`;
  }

  // 添加分頁
  query += ` LIMIT ? OFFSET ?`;

  // 計算總結果數的查詢
  const countQuery = `
    SELECT COUNT(*) as total
    FROM messages m
    JOIN posts p ON m.postId = p.postId
    WHERE m.content IS NOT NULL AND m.disable = 0
    AND (m.content LIKE ? OR p.title LIKE ?)
  `;

  try {
    const exactMatch = `%${keyword}%`;
    const partialMatch = `%${keyword}%`;
    const searchPattern = `%${keyword}%`;
    
    // 設置查詢參數
    let queryParams;
    if (sort === 'relevant') {
      queryParams = userId
        ? [userId, exactMatch, partialMatch, searchPattern, searchPattern, limit, offset]
        : [exactMatch, partialMatch, searchPattern, searchPattern, limit, offset];
    } else {
      queryParams = userId
        ? [userId, searchPattern, searchPattern, limit, offset]
        : [searchPattern, searchPattern, limit, offset];
    }
    
    // 計算總結果數的參數
    const countParams = [searchPattern, searchPattern];

    // 執行查詢
    const [results] = await pool.promise().query(query, queryParams);
    const [[{ total }]] = await pool.promise().query(countQuery, countParams);
    
    return {
      success: true,
      data: results,
      pagination: {
        total,
        page: parseInt(page),
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("Error in extended search:", error);
    throw error;
  }
};

const getAllMessagesForPostService = async (postId) => {
    try {
        const query = `
            SELECT 
                m.messageId,
                m.content,
                m.messageTime as createdAt,
                m.userId,
                u.nickName as user_name, 
                (SELECT COUNT(*) FROM message_reactions WHERE messageId = m.messageId AND reaction = 1) as likes,
                (SELECT COUNT(*) FROM message_reactions WHERE messageId = m.messageId AND reaction = 0) as dislikes,
                CASE WHEN m.disable = 1 THEN true ELSE false END as isDisabled
            FROM messages m
            JOIN users u ON m.userId = u.userId
            WHERE m.postId = ?
            ORDER BY m.messageTime ASC
        `;

        const [results] = await pool.promise().query(query, [postId]);
        return results;
    } catch (error) {
        console.error('Error in getAllMessagesForPostService:', error);
        throw new Error(`DataService.js -> getAllMessagesForPostService: ${error.message}`);
    }
};

const getNotificationsService = async (req) => {
    try {
        const userId = req.userId;
        
        const query = `
            SELECT 
                n.*,
                p.title as postTitle,
                u.nickName as fromUserName
            FROM notifications n
            LEFT JOIN posts p ON n.postId = p.postId
            LEFT JOIN users u ON p.userId = u.userId
            WHERE n.userId = ? AND n.isRead = 0
            ORDER BY n.createdAt DESC 
            LIMIT 50
        `;

        const [results] = await pool.promise().query(query, [userId]);
        
        return {
            success: true,
            notifications: results,
            unreadCount: results.filter(n => !n.isRead).length
        };
    } catch (error) {
        console.error("Error in getNotificationsService:", error);
        throw new Error("獲取通知時發生錯誤");
    }
};

const markNotificationsAsReadService = (req) => {
    return new Promise((resolve, reject) => {
        const userId = req.userId;
        const { notificationIds } = req.body;

        let query;
        let queryParams;

        if (notificationIds && notificationIds.length > 0) {
            // 標記特定通知為已讀
            query = `
                UPDATE notifications 
                SET isRead = 1 
                WHERE userId = ? AND notificationId IN (?)
            `;
            queryParams = [userId, notificationIds];
        } else {
            // 標記所有通知為已讀
            query = `
                UPDATE notifications 
                SET isRead = 1 
                WHERE userId = ? AND isRead = 0
            `;
            queryParams = [userId];
        }

        pool.query(query, queryParams, (error, results) => {
            if (error) {
                console.error("Error in markNotificationsAsReadService:", error);
                reject(error);
            } else {
                resolve({
                    success: true,
                    message: "通知已標記為已讀",
                    updatedCount: results.affectedRows
                });
            }
        });
    });
};

const getSummaryService = async (postId) => {
    try {
        const query = `
            SELECT m.content AS messageContent, p.title
            FROM messages m
            JOIN posts p ON m.postId = p.postId
            WHERE m.postId = ? AND m.messageId = 1 AND m.disable = 0
        `;
        
        const [results] = await pool.promise().query(query, [postId]);
        
        if (!results || results.length === 0) {
            return null;
        }

        return results[0];
    } catch (error) {
        console.error("Error in getSummaryService:", error);
        throw error;
    }
};

// 獲取特定訊息的內容
const getMessageContentService = async (messageId, postId) => {
  try {
    const [rows] = await pool.promise().query(
      'SELECT content FROM messages WHERE messageId = ? AND postId = ?',
      [messageId, postId]
    );

    if (!rows || rows.length === 0) {
      console.log(`No message found with messageId ${messageId} in postId ${postId}`);
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error("Error fetching message content:", error);
    throw error;
  }
};

module.exports = {
  getGlobalContentService,
  getCategoryContentService,
  getPostContentService,
  getCategoryService,
  getOneCategoryService,
  getPostOneContentService,
  getReplyListService,
  getPinContentService,
  getAllPinContentService,
  getFirstMessageContentService,
  startPostPolling,
  getPostContentByPageService,
  getHotContentService,
  searchMessagesService,
  extendedSearchMessagesService,
  getAllMessagesForPostService,
  getNotificationsService,
  markNotificationsAsReadService,
  getSummaryService,
  getMessageContentService,
};