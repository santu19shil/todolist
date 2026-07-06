const API_BASE_URL = "https://todolist-production-0ee.up.railway.app";

// =========================
// REQUEST HELPER
// =========================
function requestJson(url, options = {}) {
    const fetchOptions = {
        credentials: "include",
        ...options
    };

    if (
        options.body &&
        typeof options.body === "object" &&
        !(options.body instanceof FormData)
    ) {
        fetchOptions.headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };
        fetchOptions.body = JSON.stringify(options.body);
    }

    return fetch(url, fetchOptions).then(async (response) => {
        let data = {};

        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }

        return { response, data };
    });
}

// =========================
// MESSAGE HANDLER
// =========================
function setMessage(element, text, status) {
    if (!element) return;

    element.textContent = text;
    element.dataset.status = status || "";
}

// =========================
// PASSWORD TOGGLE
// =========================
function wirePasswordToggles() {
    document.querySelectorAll(".toggle-password").forEach((icon) => {
        icon.addEventListener("click", () => {
            const targetInput = document.getElementById(icon.dataset.target);

            if (!targetInput) return;

            if (targetInput.type === "password") {
                targetInput.type = "text";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            } else {
                targetInput.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }
        });
    });
}

// =========================
// FORGOT PASSWORD
// =========================
function initializeForgotPasswordPage() {
    const form = document.getElementById("forgotPasswordForm");
    const emailInput = document.getElementById("forgotEmail");
    const message = document.getElementById("forgotMessage");
    const button = document.getElementById("forgotBtn");

    if (!form || !emailInput || !button) return;

    const defaultText = button.textContent.trim();

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {
            setMessage(message, "Email is required.", "error");
            return;
        }

        button.disabled = true;
        button.textContent = "Sending...";

        try {
            const { response, data } = await requestJson(
                `${API_BASE_URL}/api/auth/forgot-password`,
                {
                    method: "POST",
                    body: { email }
                }
            );

            if (!response.ok) {
                setMessage(message, data.message || "Unable to send reset link.", "error");
                return;
            }

            setMessage(
                message,
                "If that email exists, a reset link has been sent.",
                "success"
            );

            form.reset();
        } catch (error) {
            setMessage(message, "Unable to send reset link right now.", "error");
        } finally {
            button.disabled = false;
            button.textContent = defaultText;
        }
    });
}

// =========================
// RESET PASSWORD
// =========================
function initializeResetPasswordPage() {
    const form = document.getElementById("resetPasswordForm");
    const tokenInput = document.getElementById("resetToken");
    const passwordInput = document.getElementById("resetPassword");
    const confirmInput = document.getElementById("confirmResetPassword");
    const message = document.getElementById("resetMessage");
    const button = document.getElementById("resetBtn");

    if (!form || !tokenInput || !passwordInput || !confirmInput || !button) return;

    const token = new URLSearchParams(window.location.search).get("token") || "";
    tokenInput.value = token;

    if (!token) {
        setMessage(message, "Reset token is missing.", "error");
        button.disabled = true;
        return;
    }

    const defaultText = button.textContent.trim();

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;

        if (!password || !confirmPassword) {
            setMessage(message, "Please complete both password fields.", "error");
            return;
        }

        button.disabled = true;
        button.textContent = "Updating...";

        try {
            const { response, data } = await requestJson(
                `${API_BASE_URL}/api/auth/reset-password`,
                {
                    method: "POST",
                    body: {
                        token,
                        password,
                        confirmPassword
                    }
                }
            );

            if (!response.ok) {
                setMessage(message, data.message || "Unable to reset password.", "error");
                return;
            }

            setMessage(
                message,
                "Password updated successfully. Redirecting to login...",
                "success"
            );

            form.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1800);
        } catch (error) {
            setMessage(message, "Unable to reset password right now.", "error");
        } finally {
            button.disabled = false;
            button.textContent = defaultText;
        }
    });
}

// =========================
// VERIFY EMAIL (FIXED)
// =========================
function initializeVerifyEmailPage() {
    const statusElement = document.getElementById("verifyStatus");

    if (!statusElement) return;

    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
        setMessage(statusElement, "Missing verification token.", "error");
        return;
    }

    fetch(`${API_BASE_URL}/api/auth/verify-email?token=${token}`)
        .then(async (res) => {
            const data = await res.json().catch(() => ({}));

            if (res.ok && data.success) {
                setMessage(
                    statusElement,
                    "Email verified successfully. Redirecting to login...",
                    "success"
                );

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                setMessage(
                    statusElement,
                    data.message || "Email verification failed.",
                    "error"
                );
            }
        })
        .catch(() => {
            setMessage(statusElement, "Server error. Please try again.", "error");
        });
}

// =========================
// INIT
// =========================
wirePasswordToggles();
initializeForgotPasswordPage();
initializeResetPasswordPage();
initializeVerifyEmailPage();