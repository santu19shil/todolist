const express = require("express");

const {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    refreshToken,
    logoutUser
} = require("../controllers/authController");

const {
    requireApiAuth
} = require("../middleware/authMiddleware");

const router = express.Router();

// ================= AUTH =================
router.post("/register", registerUser);
router.post("/login", loginUser);

// ================= EMAIL =================
router.get("/verify-email", verifyEmail);

// ================= PASSWORD =================
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ================= SESSION =================
router.post("/refresh-token", refreshToken);
router.post("/logout", requireApiAuth, logoutUser);

module.exports = router;