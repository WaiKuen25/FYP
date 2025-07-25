const express = require("express");
const cors = require("cors");
const http = require("http");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const userConfigRoutes = require("./routes/userConfigRoutes");
const dataRoutes = require("./routes/dataRoutes");
const cdnRoutes = require("./routes/cdnRoutes");
const adminRoutes = require("./routes/adminRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const { initSocketIO } = require("./config/io");
const { dbConnection } = require("./config/db");
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI;

// 引入定時檢查過期處罰的功能
const { checkExpiredPunishments } = require('./schedulers/checkPunishments');

mongoose
    .connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err.message));

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with the server
const io = initSocketIO(server);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/userConfig", userConfigRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/cdn", cdnRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/calendar", calendarRoutes);

app.use(errorHandler);

dbConnection();

module.exports = { app, io, server };