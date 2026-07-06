const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// ================= RANDOM TOKEN =================
function generateRandomToken(size = 32) {
    return crypto.randomBytes(size).toString("hex");
}

// ================= HASH TOKEN =================
function hashToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

// ================= ACCESS TOKEN =================
function generateAccessToken(payload) {
    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_SECRET is missing in .env");
    }

    return jwt.sign(
        payload,
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn:
                process.env.JWT_ACCESS_EXPIRES_IN || "15m"
        }
    );
}

// ================= REFRESH TOKEN =================
function generateRefreshToken(payload) {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET is missing in .env");
    }

    return jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn:
                process.env.JWT_REFRESH_EXPIRES_IN || "7d"
        }
    );
}

module.exports = {
    generateRandomToken,
    hashToken,
    generateAccessToken,
    generateRefreshToken
};