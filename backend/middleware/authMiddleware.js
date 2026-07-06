const jwt = require("jsonwebtoken");

const {
    getUserById,
    setRefreshToken
} = require("../models/userModel");

const {
    generateAccessToken,
    generateRefreshToken,
    hashToken
} = require("../utils/generateToken");

// ================= COOKIE OPTIONS =================
function getCookieOptions(maxAge) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge
    };
}

// ================= GET ACCESS TOKEN =================
function getAccessToken(req) {
    const auth = req.headers.authorization;

    if (auth && auth.startsWith("Bearer ")) {
        return auth.split(" ")[1];
    }

    return req.cookies?.accessToken || null;
}

// ================= GET REFRESH TOKEN =================
function getRefreshToken(req) {
    return req.cookies?.refreshToken || null;
}

// ================= REFRESH SESSION =================
async function refreshSession(req, res) {
    try {
        const refreshToken = getRefreshToken(req);

        if (!refreshToken) {
            return null;
        }

        const payload = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await getUserById(payload.id);

        if (!user) {
            return null;
        }

        if (
            !user.refresh_token_hash ||
            !user.refresh_token_expiry
        ) {
            return null;
        }

        if (
            hashToken(refreshToken) !== user.refresh_token_hash
        ) {
            return null;
        }

        const expiry = new Date(user.refresh_token_expiry);

        if (expiry <= new Date()) {
            return null;
        }

        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email
        });

        const newRefreshToken = generateRefreshToken({
            id: user.id,
            email: user.email
        });

        const newHash = hashToken(newRefreshToken);

        await setRefreshToken(
            user.id,
            newHash,
            expiry
        );

        res.cookie(
            "accessToken",
            accessToken,
            getCookieOptions(15 * 60 * 1000)
        );

        res.cookie(
            "refreshToken",
            newRefreshToken,
            getCookieOptions(expiry.getTime() - Date.now())
        );

        return user;

    } catch (err) {
        return null;
    }
}

// ================= AUTHENTICATE =================
async function authenticateRequest(req, res, allowRefresh = false) {
    try {
        const token = getAccessToken(req);

        if (!token) {
            return allowRefresh
                ? await refreshSession(req, res)
                : null;
        }

        const payload = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        const user = await getUserById(payload.id);

        if (!user) {
            return allowRefresh
                ? await refreshSession(req, res)
                : null;
        }

        return user;

    } catch (err) {
        if (!allowRefresh) {
            return null;
        }

        return refreshSession(req, res);
    }
}

// ================= API AUTH =================
async function requireApiAuth(req, res, next) {
    const user = await authenticateRequest(req, res, true);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    req.user = user;

    next();
}

// ================= PAGE AUTH =================
async function requirePageAuth(req, res, next) {
    const user = await authenticateRequest(req, res, true);

    if (!user) {
        return res.redirect("/login.html");
    }

    req.user = user;

    next();
}

module.exports = {
    requireApiAuth,
    requirePageAuth
};