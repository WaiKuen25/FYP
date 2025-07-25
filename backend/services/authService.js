const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { dbConnection } = require("../config/db");
const findOrCreateUser = require("../middlewares/findOrCreateUser");
const pool = dbConnection();

exports.login = async(req, res) => {
    const { email, password } = req.body;

    let token = null;
    let adminToken = null;
    let userConfig = {};
    let user = null;

    try {
        // Step 1: Query SQL database
        const sqlResults = await new Promise((resolve, reject) => {
            pool.query(
                "SELECT users.userId, users.password, users.nickName, adminUsers.adminId as isAdmin FROM users LEFT JOIN adminUsers ON users.userId = adminUsers.userId WHERE users.email = ?", [email],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });

        // Check if user exists in SQL
        if (sqlResults.length === 0) {
            return res.status(404).json({ message: "User not found. Please check your email or register an account." });
        }

        user = sqlResults[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials. Please try again." });
        }

        // Generate user token
        token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

        if (user.isAdmin) {
            //isAdmin in here mean adminId
            adminToken = jwt.sign({ adminId: user.isAdmin }, process.env.JWT_ADMIN_SECRET, { expiresIn: "1h" });
        }

        // Step 2: Call findOrCreateUser directly
        try {
            userConfig = await new Promise((resolve, reject) => {
                findOrCreateUser(email, password, (err, config) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(config);
                    }
                });
            });
        } catch (mongoError) {
            console.error("Error in findOrCreateUser:", mongoError);

            userConfig = {};
        }
    } catch (error) {
        console.error("Error in login process:", error);
        return res.status(500).json({ message: "Internal server error. Please try again later." });
    }

    // Success response
    res.status(200).json({
        isUser: true,
        isAdmin: user.isAdmin ? true : false, // Convert isAdmin to boolean
        nickName: user.nickName,
        userConfig: userConfig,
        token,
        adminToken: adminToken || null, // Include adminToken if generated
    });
};


exports.register = async(req, res) => {
    const { email, password, nickName } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Hashing error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        pool.query(
            "SELECT email FROM users WHERE email = ?", [email],
            (err, userResults) => {
                if (err) {
                    console.error("Database query error:", err);
                    return res.status(500).json({ message: "Something went wrong" });
                }

                if (userResults.length > 0) {
                    return res
                        .status(400)
                        .json({ message: "The Email is already registered" });
                }

                const token = jwt.sign({ email, nickName, password: hashedPassword },
                    process.env.JWT_SECRET, { expiresIn: "15m" }
                );

                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASS,
                    },
                });

                const templatePath = path.join(
                    __dirname,
                    "../utils/registerEmail.html"
                );
                fs.readFile(templatePath, "utf8", (err, data) => {
                    if (err) {
                        console.error("Error reading email template:", err);
                        return res
                            .status(500)
                            .json({ message: "Failed to send verification email" });
                    }

                    let emailHtml = data
                        .replace("{{nickName}}", nickName)
                        .replace("{{CURRENT_HOST}}", process.env.CURRENT_HOST)
                        .replace("{{token}}", token);

                    const mailOptions = {
                        from: process.env.GMAIL_USER,
                        to: email,
                        subject: "Please Verify Your Registration",
                        html: emailHtml,
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error("Error sending email:", error);
                            return res
                                .status(500)
                                .json({ message: "Failed to send verification email" });
                        } else {
                            console.log("Email sent:", info.response);
                        }
                    });

                    res.status(201).json({
                        message: "Please verify your account via the email sent to you.",
                    });
                });
            }
        );
    });
};

/*Verify Email of Register User */
exports.verifyEmail = (req, res) => {
    const { token } = req.params;

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("Token verification error:", err);
            return res.status(400).send(`
        <html>
          <body>
            <h1>Invalid or expired token.</h1>
            <a href="http://${process.env.FRONT_HOST}/login">Back to Login</a>
          </body>
        </html>
      `);
        }

        const { email, password, nickName } = decoded;

        pool.query(
            "INSERT INTO users (email, password, nickName) VALUES (?, ?, ?)", [email, password, nickName],
            (err) => {
                if (err) {
                    console.log("Database insert error:", err);
                    return res.status(500).send(`
            <html>
              <body>
                <h1>Failed to register user.</h1>
                <a href="http://${process.env.FRONT_HOST}/login">Back to Login</a>
              </body>
            </html>
          `);
                }
                console.log("User added successfully");
                res.status(200).send(`
          <html>
            <body>
              <h1>Email verified and user registered successfully.</h1>
              <a href="http://${process.env.FRONT_HOST}/login">Back to Login</a>
            </body>
          </html>
        `);
            }
        );
    });
};