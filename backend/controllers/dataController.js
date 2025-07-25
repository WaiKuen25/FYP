const {
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
    getPostContentByPageService,
    startPostPolling,
    getHotContentService,
    searchMessagesService,
    extendedSearchMessagesService,
    getAllMessagesForPostService,
    getNotificationsService,
    markNotificationsAsReadService,
    getSummaryService,
    getMessageContentService
} = require("../services/dataService");

const { dbConnection } = require("../config/db");
const pool = dbConnection();

const {
    insertReactionService,
    insertPostService,
    insertMessageService,
    insertPinContentService,
    updatePinMessageService,
    updateDisableMessageService,
} = require("../services/dataActionService");

const { runSummarizer } = require('../testpy');

const getGlobalContent = async(req, res) => {
    try {
        const data = await getGlobalContentService(req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getCategoryContent = async(req, res) => {
    try {
        const data = await getCategoryContentService(req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getFirstMessageContent = async(req, res) => {
    try {
        const { postId } = req.params;
        console.log(`Fetching first message content for postId: ${postId}`);

        const result = await getFirstMessageContentService(req);
        if (!result) {
            console.log(`No message found for postId: ${postId}`);
            return res.status(404).json({
                success: false,
                message: `No message found for postId: ${postId}`
            });
        }

        console.log(`Successfully retrieved first message for postId: ${postId}`);
        return res.json(result);
    } catch (error) {
        console.error('Error in getFirstMessageContent controller:', error);
        return res.status(500).json({
            success: false,
            error: "Failed to retrieve first message content",
            message: error.message
        });
    }
};

const getPostContent = async(req, res) => {
    try {
        const result = await getPostContentService(req);
        // 啟動該貼文的輪詢
        if (result) {
            startPostPolling(req.params.postId);
        }
        res.json(result);
    } catch (error) {
        console.error("Error in post content controller:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getCategory = async(req, res) => {
    try {
        const data = await getCategoryService();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getOneCategory = async(req, res) => {
    try {
        const data = await getOneCategoryService(req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "DataController -> getOneCategory -> getOneCategory: Error" })
    }
}

const getReplyList = async(req, res) => {
    try {
        const data = await getReplyListService(req);
        res.json(data);
    } catch (error) {
        console.error('Error in getReplyList:', error);
        res.status(500).json({
            error: "DataController.js -> getReplyList : Internal Server Error",
            message: error.message // 添加具體錯誤信息
        });
    }
};

const getPinContent = async(req, res) => {
    try {
        const data = await getPinContentService(req);
        res.json(data);
    } catch (error) {
        console.error('Error in getPinContent:', error);
        res.status(500).json({
            error: "DataController.js -> getPinContent : Internal Server Error",
            message: error.message
        });
    }
}

const getAllPinContent = async(req, res) => {
    try {
        const data = await getAllPinContentService(req);
        res.json(data);
    } catch (error) {
        console.error('Error in getAllPinContent:', error);
        res.status(500).json({
            error: "DataController.js -> getAllPinContent : Internal Server Error",
            message: error.message
        });
    }
}

const insertPinContent = async(req, res) => {
    try {
        console.log("insertPinContent called with data:", {
            userId: req.userId,
            adminId: req.adminId,
            body: req.body
        });

        // 檢查必需參數
        const { postId, pinContent, startTime, endTime } = req.body;
        if (!postId || !pinContent || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: postId, pinContent, startTime, endTime"
            });
        }

        // 檢查是否為管理員
        if (!req.adminId && !req.isAdmin) {
            return res.status(403).json({
                success: false,
                error: "Only administrators can create pinned content"
            });
        }

        const data = await insertPinContentService(req);
        if (!data) {
            return res.status(500).json({
                success: false,
                error: "Failed to insert pin content"
            });
        }

        res.status(200).json({
            success: true,
            message: "Pin content created successfully",
            data
        });
    } catch (error) {
        console.error("DataController -> insertPinContent error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to handle insertPinContent request.",
            message: error.message
        });
    }
};


const insertReaction = async(req, res) => {
    try {
        const data = await insertReactionService(req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const insertMessage = async(req, res) => {
    try {
        const data = await insertMessageService(req);
        res.json({
            success: true,
            messageId: data.messageId
        });
    } catch (error) {
        console.error("Error in insertMessage controller:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create message",
            details: error.message
        });
    }
};

const insertPost = async(req, res) => {
    try {
        // 將文件對象添加到req中
        if (req.file) {
            console.log("File received:", req.file.originalname);
        }

        const data = await insertPostService(req);
        res.json(data);
    } catch (error) {
        console.error("Error in insertPost controller:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error",
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

const updatePinMessage = async(req, res) => {
    try {
        const data = await updatePinMessageService(req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const updateDisableMessage = async(req, res) => {
    try {
        const data = await updateDisableMessageService(req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getPostOneContent = async(req, res) => {
    try {
        const data = await getPostOneContentService(req);
        if (data && data.content !== null) {
            res.json(data);
        } else {
            res.status(404).json({ error: "No results found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getPostContentByPage = async(req, res) => {
    try {
        const result = await getPostContentByPageService(req);
        if (result) {
            startPostPolling(req.params.postId);
        }
        res.json(result);
    } catch (error) {
        console.error("Error in paginated post content controller:", error);
        res.status(500).json({ error: 'Failed to load posts. Please try again.' });
    }
};

const getHotContent = async(req, res) => {
    try {
        const data = await getHotContentService(req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const searchMessages = async(req, res) => {
    try {
        if (!req.query.keyword) {
            return res.status(400).json({
                success: false,
                error: "Search keyword is required"
            });
        }

        const data = await searchMessagesService(req);
        res.json(data);
    } catch (error) {
        console.error("Error in searchMessages controller:", error);
        res.status(500).json({
            success: false,
            error: "Failed to search messages",
            details: error.message
        });
    }
};

const searchController = async(req, res) => {
    try {
        const result = await searchMessagesService(req);

        // 返回結果
        res.status(200).json(result);
    } catch (error) {
        console.error("Search Controller Error:", error);
        res.status(500).json({
            success: false,
            message: "搜尋過程中發生錯誤",
            error: error.message
        });
    }
};

const extendedSearchController = async(req, res) => {
    try {
        const data = await extendedSearchMessagesService(req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getAllMessagesForPost = async(req, res) => {
    try {
        const { postId } = req.params;
        const data = await getAllMessagesForPostService(postId);
        res.json(data);
    } catch (error) {
        console.error('Error in getAllMessagesForPost:', error);
        res.status(500).json({
            error: "DataController.js -> getAllMessagesForPost : Internal Server Error",
            message: error.message
        });
    }
};

const getNotifications = async(req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                error: "未授權訪問"
            });
        }

        const data = await getNotificationsService(req);
        res.json(data);
    } catch (error) {
        console.error("Error in getNotifications controller:", error);
        res.status(500).json({
            success: false,
            error: error.message || "獲取通知失敗",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const markNotificationsAsRead = async(req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: "未授權訪問" });
        }

        const data = await markNotificationsAsReadService(req);
        res.json(data);
    } catch (error) {
        console.error("Error in markNotificationsAsRead controller:", error);
        res.status(500).json({ error: "標記通知已讀失敗" });
    }
};

// 為特定消息生成摘要
const generateMessageSummaryController = async(req, res) => {
    try {
        const { postId, messageId } = req.params;
        console.log('Generating summary for message:', messageId, 'in post:', postId);

        // 從服務層獲取消息內容
        const message = await getMessageContentService(messageId, postId);

        if (!message || !message.content) {
            console.log('Message not found or has no content for messageId:', messageId, 'in postId:', postId);
            return res.status(404).json({
                success: false,
                message: "Message not found or has no content",
                messageId,
                postId
            });
        }

        const content = message.content;
        console.log('Message content found, length:', content.length);

        // 生成摘要
        const summary = await runSummarizer(content);

        if (!summary) {
            console.log('No summary generated for messageId:', messageId);
            return res.status(400).json({
                success: false,
                message: "Failed to generate summary",
                messageId,
                postId
            });
        }

        console.log('Summary generated successfully for messageId:', messageId);

        res.json({
            success: true,
            summary,
            messageId,
            postId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error generating summary for message:", error);
        res.status(500).json({
            success: false,
            message: "Error generating summary for message",
            error: error.message,
            messageId: req.params.messageId,
            postId: req.params.postId
        });
    }
};

// 為特定帖子生成摘要
const generatePostSummaryController = async(req, res) => {
    try {
        const { postId } = req.params;
        console.log('Generating summary for post:', postId);

        const post = await getSummaryService(postId);

        if (!post || !post.messageContent) {
            console.log('Post not found or has no content for postId:', postId);
            return res.status(404).json({
                success: false,
                message: "Post not found or has no content",
                postId
            });
        }

        console.log('Post content found, length:', post.messageContent.length);

        // 運行摘要功能
        const summary = await runSummarizer(post.messageContent);

        if (!summary) {
            console.log('No summary generated for postId:', postId);
            return res.status(400).json({
                success: false,
                message: "Failed to generate summary",
                postId
            });
        }

        console.log('Summary generated successfully for postId:', postId);

        res.json({
            success: true,
            summary,
            postId,
            title: post.title,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error generating summary:", error);
        res.status(500).json({
            success: false,
            message: "Error generating summary",
            error: error.message,
            postId: req.params.postId
        });
    }
};

module.exports = {
    getGlobalContent,
    getCategoryContent,
    getPostContent,
    getFirstMessageContent,
    getCategory,
    getOneCategory,
    getPostOneContent,
    getReplyList,
    getPinContent,
    getAllPinContent,
    insertPinContent,
    insertReaction,
    insertPost,
    insertMessage,
    updatePinMessage,
    updateDisableMessage,
    getPostContentByPage,
    getHotContent,
    searchMessages,
    searchController,
    extendedSearchController,
    getAllMessagesForPost,
    getNotifications,
    markNotificationsAsRead,
    generateMessageSummaryController,
    generatePostSummaryController
};