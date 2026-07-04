// LumiTask login system

// Cached elements

const lamp = document.getElementById("lamp");
const loginCard = document.getElementById("authBox");

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const toast = document.getElementById("toast");

let lampOn = false;

const STORAGE_KEY = "lumiTaskUsers";


// Form inputs

const username = document.getElementById("username");
const password = document.getElementById("password");

const regUsername = document.getElementById("regUsername");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const confirmPassword = document.getElementById("confirmPassword");


// Error labels

const loginUserError = document.getElementById("loginUserError");
const loginPassError = document.getElementById("loginPassError");

const regUserError = document.getElementById("regUserError");
const regEmailError = document.getElementById("regEmailError");
const regPassError = document.getElementById("regPassError");
const confirmError = document.getElementById("confirmError");


// Storage helpers

function getUsers(){

    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

}

function saveUsers(users){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(users)
    );

}


// Toast message

function showToast(message){

    if(!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}


// Clear form errors

function clearErrors(){

    document
    .querySelectorAll(".error")
    .forEach(el=>el.textContent="");

    document
    .querySelectorAll("input")
    .forEach(el=>el.classList.remove("error-input"));

}


// Show a field error

function showError(input,errorElement,message){

    input.classList.add("error-input");

    errorElement.textContent = message;

}


// Email validation

function isEmail(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


// Password toggle

document
.querySelectorAll(".toggle-password")
.forEach(icon=>{

    icon.addEventListener("click",()=>{

        const target =
        document.getElementById(
            icon.dataset.target
        );

        if(target.type==="password"){

            target.type="text";

            icon.classList.remove("fa-eye");

            icon.classList.add("fa-eye-slash");

        }

        else{

            target.type="password";

            icon.classList.remove("fa-eye-slash");

            icon.classList.add("fa-eye");

        }

    });

});


// Tab switching

function switchTab(login=true){

    if(login){

        loginForm.style.display="flex";
        registerForm.style.display="none";

        loginTab.classList.add("active");
        registerTab.classList.remove("active");

    }

    else{

        loginForm.style.display="none";
        registerForm.style.display="flex";

        registerTab.classList.add("active");
        loginTab.classList.remove("active");

    }

}

loginTab.onclick=()=>switchTab(true);

registerTab.onclick=()=>switchTab(false);


// Lamp toggle

lamp.addEventListener("click",()=>{

    lampOn=!lampOn;

    lamp.src=lampOn
        ?"assets/lamp-on.png"
        :"assets/lamp-off.png";

    document.body.classList.toggle(
        "light-on",
        lampOn
    );

    loginCard.classList.toggle(
        "show",
        lampOn
    );

});


// Register action

registerBtn.addEventListener("click",register);

function register(){

    clearErrors();

    if(!lampOn){

        showToast("Turn on the lamp first.");

        return;

    }

    let valid=true;

    const user=regUsername.value.trim();

    const email=regEmail.value.trim();

    const pass=regPassword.value;

    const confirm=confirmPassword.value;

    if(user===""){

        showError(
            regUsername,
            regUserError,
            "Username is required."
        );

        valid=false;

    }

    if(email===""){

        showError(
            regEmail,
            regEmailError,
            "Email is required."
        );

        valid=false;

    }

    else if(!isEmail(email)){

        showError(
            regEmail,
            regEmailError,
            "Invalid email."
        );

        valid=false;

    }

    if(pass.length<6){

        showError(
            regPassword,
            regPassError,
            "Minimum 6 characters."
        );

        valid=false;

    }

    if(confirm!==pass){

        showError(
            confirmPassword,
            confirmError,
            "Passwords don't match."
        );

        valid=false;

    }

    if(!valid) return;

    const users=getUsers();

    const exists=users.find(u=>

        u.username.toLowerCase()===user.toLowerCase()

        ||

        u.email.toLowerCase()===email.toLowerCase()

    );

    if(exists){

        showToast("Username or Email already exists.");

        return;

    }

    users.push({

        username:user,

        email:email,

        password:pass

    });

    saveUsers(users);

    showToast("Registration Successful!");

    registerForm.reset();

    switchTab(true);

}
// Login action

loginBtn.addEventListener("click", login);

function login(){

    clearErrors();

    if(!lampOn){

        showToast("Turn on the lamp first.");

        return;

    }

    let valid = true;

    const user = username.value.trim();

    const pass = password.value;

    if(user===""){

        showError(
            username,
            loginUserError,
            "Username is required."
        );

        valid = false;

    }

    if(pass===""){

        showError(
            password,
            loginPassError,
            "Password is required."
        );

        valid = false;

    }

    if(!valid){

        loginCard.classList.add("shake");

        setTimeout(()=>{

            loginCard.classList.remove("shake");

        },350);

        return;

    }

    const users = getUsers();

    const foundUser = users.find(u=>

        u.username.toLowerCase()===user.toLowerCase()

        &&

        u.password===pass

    );

    if(!foundUser){

        password.value="";

        showError(
            password,
            loginPassError,
            "Incorrect username or password."
        );

        loginCard.classList.add("shake");

        setTimeout(()=>{

            loginCard.classList.remove("shake");

        },350);

        return;

    }

    sessionStorage.setItem(
        "loggedIn",
        "true"
    );

    sessionStorage.setItem(
        "loggedUser",
        JSON.stringify(foundUser)
    );

    if(document.getElementById("rememberMe").checked){

        localStorage.setItem(
            "rememberUser",
            foundUser.username
        );

    }

    else{

        localStorage.removeItem(
            "rememberUser"
        );

    }

    loginBtn.disabled = true;

    loginBtn.textContent = "Logging In...";

    showToast("Login Successful");

    setTimeout(()=>{

        window.location.href="dashboard.html";

    },900);

}


// Redirect if already logged in

if(sessionStorage.getItem("loggedIn")==="true"){

    window.location.href="dashboard.html";

}


// Restore remembered username

const remembered =
localStorage.getItem("rememberUser");

if(remembered){

    username.value = remembered;

    const rememberMe = document.getElementById("rememberMe");

    if(rememberMe){

        rememberMe.checked = true;

    }

}


// Enter key support

document.addEventListener("keydown",(e)=>{

    if(e.key!=="Enter") return;

    if(loginForm.style.display!=="none"){

        login();

    }

    else{

        register();

    }

});


// Live validation

document
.querySelectorAll("input")
.forEach(input=>{

    input.addEventListener("input",()=>{

        input.classList.remove("error-input");

        const error =
        input.parentElement.querySelector(".error");

        if(error){

            error.textContent="";

        }

    });

});


// Reset forms when switching tabs

function resetForms(){

    loginForm.reset();

    registerForm.reset();

    clearErrors();

}

loginTab.addEventListener("click",resetForms);

registerTab.addEventListener("click",resetForms);


// Input focus effect

document
.querySelectorAll("input")
.forEach(input=>{

    input.addEventListener("focus",()=>{

        input.parentElement.classList.add("focused");

    });

    input.addEventListener("blur",()=>{

        input.parentElement.classList.remove("focused");

    });

});


// Initialize the default tab

switchTab(true);