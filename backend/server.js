require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { requirePageAuth } = require("./middleware/authMiddleware");
const { pool } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// ================= FRONTEND PATH =================
const frontendPath = path.resolve(
    __dirname,
    "..",
    "LumiTask-frontend"
);

// ================= SECURITY =================
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

app.use(
    cors({
        origin: process.env.CLIENT_URL || true,
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ================= RATE LIMIT =================
app.use(
    "/api/auth",
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 50,
        standardHeaders: true,
        legacyHeaders: false
    })
);

// ================= HEALTH =================
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "LumiTask API is running."
    });
});

// ================= API =================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// ================= STATIC FILES =================
app.use(express.static(frontendPath));

// ================= PAGES =================
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "login.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(frontendPath, "login.html"));
});

app.get("/dashboard.html", requirePageAuth, (req, res) => {
    res.sendFile(path.join(frontendPath, "dashboard.html"));
});

app.get("/forgot-password.html", (req, res) => {
    res.sendFile(path.join(frontendPath, "forgot-password.html"));
});

app.get("/reset-password.html", (req, res) => {
    res.sendFile(path.join(frontendPath, "reset-password.html"));
});

app.get("/verify-email.html", (req, res) => {
    res.sendFile(path.join(frontendPath, "verify-email.html"));
});

// ================= 404 =================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

// ================= START SERVER =================
async function startServer() {
    try {
        const connection = await pool.getConnection();
        connection.release();

        app.listen(PORT, "0.0.0.0", () => {
            console.log("");
            console.log("==================================");
            console.log("🚀 LumiTask Backend Started");
            console.log(`🌐 http://localhost:${PORT}`);
            console.log("==================================");
            console.log("");
        });

    } catch (err) {
        console.error("Database connection failed:");
        console.error(err.message);
        process.exit(1);
    }
}

startServer();