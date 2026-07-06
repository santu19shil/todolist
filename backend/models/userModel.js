const { query } = require("../config/db");

// ================= CREATE USER =================
async function createUser({ fullName, email, password, verificationToken }) {
    const result = await query(
        `
        INSERT INTO users (
            full_name,
            email,
            password,
            is_verified,
            verification_token,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, 0, ?, NOW(), NOW())
        `,
        [fullName, email, password, verificationToken]
    );

    return result.insertId;
}

// ================= GET USER BY EMAIL =================
async function getUserByEmail(email) {
    const rows = await query(
        `
        SELECT *
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );

    return rows[0] || null;
}

// ================= GET USER BY ID =================
async function getUserById(id) {
    const rows = await query(
        `
        SELECT *
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0] || null;
}

// ================= GET USER BY VERIFICATION TOKEN =================
async function getUserByVerificationToken(token) {
    const rows = await query(
        `
        SELECT *
        FROM users
        WHERE verification_token = ?
        LIMIT 1
        `,
        [token]
    );

    return rows[0] || null;
}

// ================= VERIFY USER =================
async function verifyUser(id) {
    await query(
        `
        UPDATE users
        SET
            is_verified = 1,
            verification_token = NULL,
            updated_at = NOW()
        WHERE id = ?
        `,
        [id]
    );
}

// ================= SET RESET TOKEN =================
async function setResetToken(id, token, expiry) {
    await query(
        `
        UPDATE users
        SET
            reset_token = ?,
            reset_token_expiry = ?,
            updated_at = NOW()
        WHERE id = ?
        `,
        [token, expiry, id]
    );
}

// ================= GET USER BY RESET TOKEN =================
async function getUserByResetToken(token) {
    const rows = await query(
        `
        SELECT *
        FROM users
        WHERE reset_token = ?
        AND reset_token_expiry > NOW()
        LIMIT 1
        `,
        [token]
    );

    return rows[0] || null;
}

// ================= UPDATE PASSWORD =================
async function updatePassword(id, password) {
    await query(
        `
        UPDATE users
        SET
            password = ?,
            updated_at = NOW()
        WHERE id = ?
        `,
        [password, id]
    );
}

// ================= CLEAR RESET TOKEN =================
async function clearResetToken(id) {
    await query(
        `
        UPDATE users
        SET
            reset_token = NULL,
            reset_token_expiry = NULL,
            updated_at = NOW()
        WHERE id = ?
        `,
        [id]
    );
}

// ================= SET REFRESH TOKEN =================
async function setRefreshToken(id, tokenHash, expiry) {
    await query(
        `
        UPDATE users
        SET
            refresh_token_hash = ?,
            refresh_token_expiry = ?,
            updated_at = NOW()
        WHERE id = ?
        `,
        [tokenHash, expiry, id]
    );
}

// ================= CLEAR REFRESH TOKEN =================
async function clearRefreshToken(id) {
    await query(
        `
        UPDATE users
        SET
            refresh_token_hash = NULL,
            refresh_token_expiry = NULL,
            updated_at = NOW()
        WHERE id = ?
        `,
        [id]
    );
}

module.exports = {
    createUser,
    getUserByEmail,
    getUserById,
    getUserByVerificationToken,
    verifyUser,
    setResetToken,
    getUserByResetToken,
    updatePassword,
    clearResetToken,
    setRefreshToken,
    clearRefreshToken
};