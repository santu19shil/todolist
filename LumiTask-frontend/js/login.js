const API_BASE = "http://localhost:5000";

const lamp = document.getElementById("lamp");
const loginCard = document.getElementById("authBox");

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const toast = document.getElementById("toast");

// inputs
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const rememberMe = document.getElementById("rememberMe");

const fullName = document.getElementById("fullName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const confirmPassword = document.getElementById("confirmPassword");

// errors
const loginEmailError = document.getElementById("loginEmailError");
const loginPasswordError = document.getElementById("loginPasswordError");
const nameError = document.getElementById("nameError");
const registerEmailError = document.getElementById("registerEmailError");
const registerPasswordError = document.getElementById("registerPasswordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

let lampOn = false;

// ================= API REQUEST =================
async function requestJson(url, options = {}) {
    const res = await fetch(API_BASE + url, {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await res.json().catch(() => ({}));
    return { res, data };
}

// ================= TOAST =================
function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

// ================= LAMP =================
lamp.addEventListener("click", () => {
    lampOn = !lampOn;
    document.body.classList.toggle("light-on", lampOn);
    loginCard.classList.toggle("show", lampOn);
});

// ================= SWITCH TABS =================
loginTab.addEventListener("click", () => {
    loginForm.style.display = "flex";
    registerForm.style.display = "none";
});

registerTab.addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "flex";
});

// ================= REGISTER =================
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
        fullName: fullName.value,
        email: registerEmail.value,
        password: registerPassword.value,
        confirmPassword: confirmPassword.value
    };

    const { res, data } = await requestJson("/api/auth/register", {
        method: "POST",
        body
    });

    if (!res.ok) {
        showToast(data.message || "Registration failed");
        return;
    }

    showToast("Registered successfully. Verify email.");
    registerForm.reset();
});

// ================= LOGIN =================
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
        email: loginEmail.value,
        password: loginPassword.value,
        rememberMe: rememberMe.checked
    };

    const { res, data } = await requestJson("/api/auth/login", {
        method: "POST",
        body
    });

    if (!res.ok) {
        showToast(data.message || "Login failed");
        return;
    }

    showToast("Login successful");

    // IMPORTANT FIX: redirect properly
    setTimeout(() => {
        window.location.href = data.redirect || "/dashboard.html";
    }, 800);
});