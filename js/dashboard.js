// ===============================
// AUTH CHECK
// ===============================
const currentUser = JSON.parse(
    sessionStorage.getItem("loggedUser")
);

if (!currentUser || !currentUser.username) {
    window.location.href = "index.html";
}

const TASK_KEY = `tasks_${currentUser.username}`;
if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

// ===============================
// GREETING
// ===============================

const greeting = document.getElementById("greeting");

const hour = new Date().getHours();

if (hour < 12) {

    greeting.innerHTML = "Good Morning 👋";

} else if (hour < 18) {

    greeting.innerHTML = "Good Afternoon 👋";

} else {

    greeting.innerHTML = "Good Evening 👋";

}

// ===============================
// LIVE CLOCK
// ===============================

const clock = document.getElementById("clock");

function updateClock() {

    const now = new Date();

    clock.innerHTML = now.toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit",

        second: "2-digit"

    });

}

setInterval(updateClock, 1000);

updateClock();

// ===============================
// TODAY DATE
// ===============================

const todayDate = document.getElementById("todayDate");

todayDate.innerHTML = new Date().toDateString();

// ===============================
// CALENDAR
// ===============================

const calendar = document.getElementById("calendar");

const monthYear = document.getElementById("monthYear");

let current = new Date();

let selectedDate = "";

// ===============================

function renderCalendar() {

    calendar.innerHTML = "";

    const year = current.getFullYear();

    const month = current.getMonth();

    const firstDay = new Date(year, month, 1).getDay();

    const days = new Date(year, month + 1, 0).getDate();

    monthYear.innerHTML =
        current.toLocaleString("default", {

            month: "long"

        }) + " " + year;

    for (let i = 0; i < firstDay; i++) {

        const empty = document.createElement("div");

        calendar.appendChild(empty);

    }

    for (let day = 1; day <= days; day++) {

        const div = document.createElement("div");

        div.className = "day";

        div.innerHTML = day;

        const today = new Date();

        if (

            day === today.getDate() &&

            month === today.getMonth() &&

            year === today.getFullYear()

        ) {

            div.classList.add("today");

        }

        div.onclick = () => {

            document

                .querySelectorAll(".day")

                .forEach(d => d.classList.remove("selected"));

            div.classList.add("selected");

            selectedDate = `${year}-${month + 1}-${day}`;

            document.getElementById("selectedDate").innerHTML =
                div.innerHTML +
                " " +
                current.toLocaleString("default", {

                    month: "long"

                });

            loadTasks();

        };

        calendar.appendChild(div);

    }

}

renderCalendar();

// ===============================
// MONTH BUTTONS
// ===============================

document.getElementById("prevMonth").onclick = () => {

    current.setMonth(current.getMonth() - 1);

    renderCalendar();

}

document.getElementById("nextMonth").onclick = () => {

    current.setMonth(current.getMonth() + 1);

    renderCalendar();

}

// ===============================
// STORAGE
// ===============================

let tasks = JSON.parse(localStorage.getItem(TASK_KEY)) || {};

// ===============================
// ADD TASK
// ===============================

document.getElementById("addTask").onclick = () => {

    if (selectedDate === "") {

        alert("Select a date first.");

        return;

    }

    const input = document.getElementById("taskInput");

    const text = input.value.trim();

    if (text === "") return;

    if (!tasks[selectedDate])

        tasks[selectedDate] = [];

    tasks[selectedDate].push({

        text,

        done: false

    });

   localStorage.setItem(
    TASK_KEY,
    JSON.stringify(tasks)
);

    input.value = "";

    loadTasks();

}

// ===============================
// LOAD TASKS
// ===============================

function loadTasks() {

    const list = document.getElementById("taskList");

    list.innerHTML = "";

    const data = tasks[selectedDate] || [];

    let completed = 0;

    data.forEach((task, index) => {

        if (task.done)

            completed++;

        const li = document.createElement("li");

        li.innerHTML = `

<div class="task-left">

<input type="checkbox"

${task.done ? "checked" : ""}

onchange="toggleTask(${index})">

<span class="${task.done ? "completed" : ""}">

${task.text}

</span>

</div>

<button

class="delete-btn"

onclick="deleteTask(${index})">

<i class="fa-solid fa-trash"></i>

</button>

`;

        list.appendChild(li);

    });

    updateProgress(completed, data.length);

}

// ===============================
// TOGGLE
// ===============================

function toggleTask(index) {

    tasks[selectedDate][index].done =
        !tasks[selectedDate][index].done;

    localStorage.setItem(

        TASK_KEY,

        JSON.stringify(tasks)

    );

    loadTasks();

}

// ===============================
// DELETE
// ===============================

function deleteTask(index) {

    tasks[selectedDate].splice(index, 1);

    localStorage.setItem(

        TASK_KEY,

        JSON.stringify(tasks)

    );

    loadTasks();

}

// ===============================
// PROGRESS
// ===============================

function updateProgress(done, total) {

    let percent = 0;

    if (total > 0)

        percent = (done / total) * 100;

    document.getElementById(

        "progressFill"

    ).style.width = percent + "%";

    document.getElementById(

        "progressText"

    ).innerHTML =
        Math.round(percent) +
        "% Completed";

}
const logoutBtn = document.getElementById("logout");

logoutBtn.addEventListener("click", () => {

    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("loggedUser");

    window.location.href = "index.html";

});