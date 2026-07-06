const bcrypt = require("bcryptjs");

const {
    createUser,
    getUserByEmail,
    getUserById,
    getUserByVerificationToken,
    verifyUser,
    setRefreshToken,
    clearRefreshToken,
    setResetToken,
    getUserByResetToken,
    updatePassword,
    clearResetToken
} = require("../models/userModel");

const { sendMail } = require("../config/mail");

const {
    generateRandomToken,
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

// ================= REGISTER =================
async function registerUser(req, res) {
    try {

        const {
            fullName,
            email,
            password,
            confirmPassword
        } = req.body;

        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        const existing = await getUserByEmail(email);

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const verificationToken = generateRandomToken(24);

        await createUser({
            fullName,
            email,
            password: hashedPassword,
            verificationToken
        });

        const verifyLink =
            `${process.env.CLIENT_URL || "http://localhost:5000"}/api/auth/verify-email?token=${verificationToken}`;

        await sendMail({
            to: email,
            subject: "Verify your LumiTask account",
            text:
`Welcome to LumiTask!

Please verify your account by opening:

${verifyLink}`
        });

        return res.status(201).json({
            success: true,
            message:
                "Registration successful. Check your email to verify your account."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Registration failed."
        });

    }
}

// ================= LOGIN =================
async function loginUser(req, res) {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const validPassword =
            await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        if (!user.is_verified) {
            return res.status(403).json({
                success: false,
                message:
                    "Please verify your email before logging in."
            });
        }

        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email
        });

        const refreshToken = generateRefreshToken({
            id: user.id,
            email: user.email
        });

        const refreshHash =
            hashToken(refreshToken);

        const expiry =
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await setRefreshToken(
            user.id,
            refreshHash,
            expiry
        );

        res.cookie(
            "accessToken",
            accessToken,
            getCookieOptions(15 * 60 * 1000)
        );

        res.cookie(
            "refreshToken",
            refreshToken,
            getCookieOptions(7 * 24 * 60 * 60 * 1000)
        );

        return res.json({

            success: true,

            message: "Login successful.",

            user: {

                id: user.id,
                fullName: user.full_name,
                email: user.email

            }

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,
            message: "Login failed."

        });

    }

}
// ================= VERIFY EMAIL =================
async function verifyEmail(req, res) {
    try {

        const { token } = req.query;

        if (!token) {
            return res.status(400).send("Invalid verification link.");
        }

        const user = await getUserByVerificationToken(token);

        if (!user) {
            return res.status(400).send("Verification token is invalid or expired.");
        }

        await verifyUser(user.id);

        return res.redirect("/login.html");

    } catch (err) {

        console.error(err);

        return res.status(500).send("Verification failed.");

    }
}

// ================= FORGOT PASSWORD =================
async function forgotPassword(req, res) {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const user = await getUserByEmail(email);

        if (!user) {
            return res.json({
                success: true,
                message:
                    "If the email exists, a reset link has been sent."
            });
        }

        const resetToken = generateRandomToken(32);

        const expiry =
            new Date(Date.now() + 1000 * 60 * 30);

        await setResetToken(
            user.id,
            resetToken,
            expiry
        );

        const resetLink =
`${process.env.CLIENT_URL || "http://localhost:5000"}/reset-password.html?token=${resetToken}`;

        await sendMail({

            to: email,

            subject: "Reset your LumiTask password",

            text:
`Click the link below to reset your password.

${resetLink}

This link expires in 30 minutes.`

        });

        return res.json({

            success: true,

            message:
                "Password reset email sent."

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,
            message: "Unable to send reset email."

        });

    }

}

// ================= RESET PASSWORD =================
async function resetPassword(req, res) {

    try {

        const {
            token,
            password,
            confirmPassword
        } = req.body;

        if (
            !token ||
            !password ||
            !confirmPassword
        ) {

            return res.status(400).json({

                success: false,
                message: "All fields are required."

            });

        }

        if (password !== confirmPassword) {

            return res.status(400).json({

                success: false,
                message: "Passwords do not match."

            });

        }

        const user =
            await getUserByResetToken(token);

        if (!user) {

            return res.status(400).json({

                success: false,
                message:
                    "Reset link is invalid or expired."

            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 12);

        await updatePassword(
            user.id,
            hashedPassword
        );

        await clearResetToken(user.id);

        return res.json({

            success: true,

            message:
                "Password reset successful."

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,
            message: "Password reset failed."

        });

    }

}
// ================= REFRESH TOKEN =================
async function refreshToken(req, res) {

    return res.status(200).json({
        success: true,
        message: "Access token refreshed."
    });

}

// ================= LOGOUT =================
async function logoutUser(req, res) {

    try {

        if (req.user) {
            await clearRefreshToken(req.user.id);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.json({
            success: true,
            message: "Logged out successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Logout failed."
        });

    }

}

// ================= PROFILE =================
async function getProfile(req, res) {

    try {

        const user = await getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.json({

            success: true,

            user: {

                id: user.id,
                fullName: user.full_name,
                email: user.email,
                isVerified: Boolean(user.is_verified),
                createdAt: user.created_at

            }

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,
            message: "Unable to fetch profile."

        });

    }

}

// ================= EXPORTS =================
module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    refreshToken,
    logoutUser,
    getProfile
};