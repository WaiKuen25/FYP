const mysql = require("mysql2");

const dbConnection = () => {
    const pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    pool.on("error", (err) => {
        console.error("Database connection error:", err);
    });

    return pool;
};

module.exports = { dbConnection };