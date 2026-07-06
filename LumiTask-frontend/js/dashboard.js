(async function initializeDashboard() {
    const profileResponse = await fetch("/api/user/profile", {
        credentials: "include"
    }).catch(() => null);

    if (!profileResponse || !profileResponse.ok) {
        window.location.href = "login.html";
        return;
    }

    const profileData = await profileResponse.json().catch(() => null);

    if (!profileData || !profileData.success || !profileData.user) {
        window.location.href = "login.html";
        return;
    }

    const currentUser = profileData.user;
    const taskStorageKey = `tasks_${currentUser.id}`;

    const greeting = document.getElementById("greeting");
    const clock = document.getElementById("clock");
    const todayDate = document.getElementById("todayDate");
    const calendar = document.getElementById("calendar");
    const monthYear = document.getElementById("monthYear");
    const selectedDateLabel = document.getElementById("selectedDate");
    const taskInput = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const prevMonth = document.getElementById("prevMonth");
    const nextMonth = document.getElementById("nextMonth");
    const addTaskButton = document.getElementById("addTask");
    const logoutButton = document.getElementById("logout");

    const state = {
        currentMonth: new Date(),
        selectedDate: "",
        tasks: loadTasksFromStorage()
    };

    function loadTasksFromStorage() {
        try {
            return JSON.parse(localStorage.getItem(taskStorageKey)) || {};
        } catch (error) {
            return {};
        }
    }

    function saveTasksToStorage() {
        localStorage.setItem(taskStorageKey, JSON.stringify(state.tasks));
    }

    function setGreeting() {
        const hour = new Date().getHours();

        if (hour < 12) {
            greeting.textContent = "Good Morning 👋";
            return;
        }

        if (hour < 18) {
            greeting.textContent = "Good Afternoon 👋";
            return;
        }

        greeting.textContent = "Good Evening 👋";
    }

    function updateClock() {
        const now = new Date();

        clock.textContent = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    function formatDateKey(year, monthIndex, day) {
        return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    function renderCalendar() {
        calendar.innerHTML = "";

        const year = state.currentMonth.getFullYear();
        const month = state.currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        monthYear.textContent = `${state.currentMonth.toLocaleString("default", {
            month: "long"
        })} ${year}`;

        for (let index = 0; index < firstDay; index += 1) {
            const spacer = document.createElement("div");
            calendar.appendChild(spacer);
        }

        const today = new Date();

        for (let day = 1; day <= daysInMonth; day += 1) {
            const dayElement = document.createElement("div");
            dayElement.className = "day";
            dayElement.textContent = day;

            const dateKey = formatDateKey(year, month, day);

            if (
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                dayElement.classList.add("today");
            }

            if (state.selectedDate === dateKey) {
                dayElement.classList.add("selected");
            }

            dayElement.addEventListener("click", () => {
                state.selectedDate = dateKey;

                document.querySelectorAll(".day").forEach((element) => {
                    element.classList.remove("selected");
                });

                dayElement.classList.add("selected");
                selectedDateLabel.textContent = `${day} ${state.currentMonth.toLocaleString("default", {
                    month: "long"
                })}`;

                loadTasksForSelectedDate();
            });

            calendar.appendChild(dayElement);
        }
    }

    function loadTasksForSelectedDate() {
        taskList.innerHTML = "";

        if (!state.selectedDate) {
            updateProgress(0, 0);
            return;
        }

        const tasksForDate = state.tasks[state.selectedDate] || [];
        let completedCount = 0;

        tasksForDate.forEach((task, index) => {
            if (task.done) {
                completedCount += 1;
            }

            const listItem = document.createElement("li");
            const taskLeft = document.createElement("div");
            taskLeft.className = "task-left";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = Boolean(task.done);
            checkbox.addEventListener("change", () => {
                toggleTask(index);
            });

            const taskText = document.createElement("span");
            taskText.textContent = task.text;
            if (task.done) {
                taskText.classList.add("completed");
            }

            taskLeft.appendChild(checkbox);
            taskLeft.appendChild(taskText);

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.type = "button";
            deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteButton.addEventListener("click", () => {
                deleteTask(index);
            });

            listItem.appendChild(taskLeft);
            listItem.appendChild(deleteButton);
            taskList.appendChild(listItem);
        });

        updateProgress(completedCount, tasksForDate.length);
    }

    function updateProgress(doneCount, totalCount) {
        const percentComplete = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

        progressFill.style.width = `${percentComplete}%`;
        progressText.textContent = `${Math.round(percentComplete)}% Completed`;
    }

    function addTask() {
        if (!state.selectedDate) {
            alert("Select a date first.");
            return;
        }

        const taskText = taskInput.value.trim();

        if (!taskText) {
            return;
        }

        if (!state.tasks[state.selectedDate]) {
            state.tasks[state.selectedDate] = [];
        }

        state.tasks[state.selectedDate].push({
            text: taskText,
            done: false
        });

        saveTasksToStorage();
        taskInput.value = "";
        loadTasksForSelectedDate();
    }

    function toggleTask(index) {
        if (!state.selectedDate || !state.tasks[state.selectedDate] || !state.tasks[state.selectedDate][index]) {
            return;
        }

        state.tasks[state.selectedDate][index].done = !state.tasks[state.selectedDate][index].done;
        saveTasksToStorage();
        loadTasksForSelectedDate();
    }

    function deleteTask(index) {
        if (!state.selectedDate || !state.tasks[state.selectedDate]) {
            return;
        }

        state.tasks[state.selectedDate].splice(index, 1);

        if (state.tasks[state.selectedDate].length === 0) {
            delete state.tasks[state.selectedDate];
        }

        saveTasksToStorage();
        loadTasksForSelectedDate();
    }

    async function logout() {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            // Clear the client session even if the backend is temporarily unreachable.
        } finally {
            window.location.href = "login.html";
        }
    }

    setGreeting();
    todayDate.textContent = new Date().toDateString();
    updateClock();
    renderCalendar();

    setInterval(updateClock, 1000);

    prevMonth.addEventListener("click", () => {
        state.currentMonth.setMonth(state.currentMonth.getMonth() - 1);
        renderCalendar();
    });

    nextMonth.addEventListener("click", () => {
        state.currentMonth.setMonth(state.currentMonth.getMonth() + 1);
        renderCalendar();
    });

    addTaskButton.addEventListener("click", addTask);

    taskInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addTask();
        }
    });

    logoutButton.addEventListener("click", logout);
})();