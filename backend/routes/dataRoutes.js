const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
    getGlobalContent,
    getCategoryContent,
    getPostContent,
    getPostOneContent,
    getCategory,
    getOneCategory,
    getReplyList,
    getPinContent,
    getAllPinContent,
    insertReaction,
    insertPost,
    insertMessage,
    insertPinContent,
    updatePinMessage,
    updateDisableMessage,
    getFirstMessageContent,
    getPostContentByPage,
    getHotContent,
    searchMessages,
    extendedSearchController,
    getAllMessagesForPost,
    getNotifications,
    markNotificationsAsRead,
    generatePostSummaryController,
    generateMessageSummaryController
} = require("../controllers/dataController");
const optionalAuthenticate = require("../middlewares/authMiddleware");
const { dbConnection } = require("../config/db");

const upload = multer({ dest: "uploads/" });

// 一般內容獲取路由
router.get("/global/content", optionalAuthenticate, getGlobalContent);
router.get("/category/:categoryId/content", optionalAuthenticate, getCategoryContent);
router.get("/post/content", getPostOneContent);
router.get("/post/:postId", optionalAuthenticate, getPostContent);
router.get("/first/:postId", optionalAuthenticate, getFirstMessageContent);
router.get("/category", getCategory);
router.get("/oneCategory", getOneCategory);
router.get("/hot/content", optionalAuthenticate, getHotContent);
router.get("/post/:postId/page/:page", optionalAuthenticate, getPostContentByPage);

// 搜索路由
router.get("/search", optionalAuthenticate, searchMessages);
router.get("/search/extended", optionalAuthenticate, extendedSearchController);
router.get("/messages/:postId", optionalAuthenticate, getAllMessagesForPost);

// Pin相關路由
router.get("/getPinContent", optionalAuthenticate, getPinContent);
router.get("/getAllPinContent", optionalAuthenticate, getAllPinContent);
router.get("/pin/:postId/:indexId", optionalAuthenticate, updatePinMessage);
router.get("/disable/:postId/:indexId", updateDisableMessage);

// 管理員專用路由 - 添加pin內容
router.post("/admin/pinContent", optionalAuthenticate, insertPinContent);
// 保留舊路由以維護向後兼容性
router.post("/postContent", optionalAuthenticate, insertPinContent);

// 消息與反應路由
router.get("/message/reply", optionalAuthenticate, getReplyList);
router.post("/reaction", optionalAuthenticate, insertReaction);
router.post("/createMessage/:postId", optionalAuthenticate, upload.single("media"), insertMessage);

// 帖子創建路由
router.post("/posts", optionalAuthenticate, upload.single("media"), insertPost);

// 通知路由
router.get("/notifications", optionalAuthenticate, getNotifications);
router.post("/notifications/mark-read", optionalAuthenticate, markNotificationsAsRead);

// 帖子摘要路由
router.get("/summary/:postId", optionalAuthenticate, generatePostSummaryController);

// 特定消息摘要路由
router.get("/summary/message/:postId/:messageId", optionalAuthenticate, generateMessageSummaryController);

module.exports = router;