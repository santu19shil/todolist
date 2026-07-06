const express = require("express");

const {
    getProfile
} = require("../controllers/authController");

const {
    requireApiAuth
} = require("../middleware/authMiddleware");

const router = express.Router();

// ================= USER PROFILE =================
router.get(
    "/profile",
    requireApiAuth,
    getProfile
);

module.exports = router;