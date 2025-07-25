const express = require("express");
const router = express.Router();
const { servePhoto, serveAvator, serveCategory } = require("../controllers/cdnController");

router.get("/post/:postId/:photo", servePhoto);
router.get("/avator/:userId/:photo", serveAvator);
router.get("/category/:categoryId", serveCategory);

module.exports = router;