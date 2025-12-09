// ---------- DATA ----------
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let exams = JSON.parse(localStorage.getItem("exams") || "[]");
let completed = JSON.parse(localStorage.getItem("completed") || "[]");

let currentTaskIndex = null;


// ---------- DATE HELPERS ----------
function daysUntil(dateString) {
    let today = new Date();
    let due = new Date(dateString);
    let diff = due - today;
    return Math.ceil(diff / 86400000);
}


// ---------- URGENCY ALGORITHM ----------
function urgencyScore(days, weight, isExam) {
    let priority = weight * (10 / (days + 1));
    let heat = (weight * 2) + (8 / (days + 1));
    let decay = 5 * Math.exp(-0.25 * days);

    let score = (0.5 * priority) + (0.3 * heat) + (0.2 * decay);
    if (isExam) score *= 1.5;
    return score;
}


// ---------- GLOW ----------
function glowClass(score) {
    if (score >= 12) return "glow-red";
    if (score >= 7) return "glow-orange";
    if (score >= 4) return "glow-yellow";
    return "glow-green";
}


// ---------- RENDER ----------
function renderAll() {
    renderTasks();
    renderExams();
    renderCompleted();
    save();
}

function renderTasks() {
    let div = document.getElementById("taskList");
    div.innerHTML = "";

    // update scores
    tasks.forEach(t => {
        t.daysLeft = daysUntil(t.date);
        t.score = urgencyScore(t.daysLeft, t.weight, false);
    });

    tasks.sort((a, b) => b.score - a.score);

    tasks.forEach((t, i) => {
        let card = document.createElement("div");
        card.className = `card ${glowClass(t.score)}`;

        card.innerHTML = `
            <strong>${t.name}</strong><br>
            Due in ${t.daysLeft} days<br>
            <button onclick="completeTask(${i})">Complete</button>
        `;

        card.addEventListener("click", (e) => {
            if (e.target.tagName !== "BUTTON") openDetail(i);
        });

        div.appendChild(card);
    });
}

function renderExams() {
    let div = document.getElementById("examList");
    div.innerHTML = "";

    exams.forEach(e => {
        let daysLeft = daysUntil(e.date);
        e.score = urgencyScore(daysLeft, e.weight, true);
    });

    exams.sort((a, b) => b.score - a.score);

    exams.forEach((e, i) => {
        let daysLeft = daysUntil(e.date);

        let card = document.createElement("div");
        card.className = `card ${glowClass(e.score)}`;
        card.innerHTML = `
            <strong>${e.name}</strong><br>
            ${daysLeft} days left<br>
            <button onclick="completeExam(${i})">Complete</button>
        `;
        div.appendChild(card);
    });
}

function renderCompleted() {
    let div = document.getElementById("completedList");
    div.innerHTML = "";

    completed.forEach(name => {
        let card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<strong>${name}</strong>`;
        div.appendChild(card);
    });
}


// ---------- COMPLETE ----------
function completeTask(i) {
    completed.push(tasks[i].name);
    tasks.splice(i, 1);
    renderAll();
}

function completeExam(i) {
    completed.push(exams[i].name);
    exams.splice(i, 1);
    renderAll();
}


// ---------- ADD TASK / EXAM MODAL ----------
let modalType = "task";

function openModal(type) {
    modalType = type;

    document.getElementById("modal").classList.remove("hidden");
    document.getElementById("modalTitle").textContent =
        type === "task" ? "Add Task" : "Add Exam";

    document.getElementById("daysLabel").classList.toggle("hidden", type !== "task");
    document.getElementById("modalDays").classList.toggle("hidden", type !== "task");

    document.getElementById("examDateLabel").classList.toggle("hidden", type === "task");
    document.getElementById("modalDate").classList.toggle("hidden", type === "task");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

function submitModal() {
    let name = document.getElementById("modalName").value;
    let weight = Number(document.getElementById("modalWeight").value);

    if (modalType === "task") {
        let days = Number(document.getElementById("modalDays").value);
        let date = new Date();
        date.setDate(date.getDate() + days);
        let iso = date.toISOString().split("T")[0];

        let score = urgencyScore(days, weight, false);

        tasks.push({
            name,
            date: iso,
            weight,
            daysLeft: days,
            score,
            subtasks: []
        });

    } else {
        let date = document.getElementById("modalDate").value;
        let daysLeft = daysUntil(date);
        let score = urgencyScore(daysLeft, weight, true);

        exams.push({
            name,
            date,
            weight,
            score
        });
    }

    closeModal();
    renderAll();
}


// ---------- DETAIL MODAL ----------
function openDetail(i) {
    currentTaskIndex = i;
    let task = tasks[i];

    document.getElementById("detailName").textContent = task.name;
    document.getElementById("detailDate").value = task.date;
    document.getElementById("detailWeight").value = task.weight;

    updateDetailDaysLeft();

    renderSubtasks();

    document.getElementById("detailModal").classList.remove("hidden");
}

function closeDetail() {
    document.getElementById("detailModal").classList.add("hidden");
}


// ---------- EDITING ----------
document.getElementById("detailName").addEventListener("input", () => {
    tasks[currentTaskIndex].name = document.getElementById("detailName").textContent;
    renderAll();
});

document.getElementById("detailDate").addEventListener("change", () => {
    tasks[currentTaskIndex].date = document.getElementById("detailDate").value;
    updateDetailDaysLeft();
    renderAll();
});

document.getElementById("detailWeight").addEventListener("input", () => {
    tasks[currentTaskIndex].weight = Number(document.getElementById("detailWeight").value);
    renderAll();
});

function updateDetailDaysLeft() {
    let task = tasks[currentTaskIndex];
    let days = daysUntil(task.date);
    document.getElementById("detailDaysLeft").textContent = `Due in ${days} days`;
}


// ---------- SUBTASKS ----------
function renderSubtasks() {
    let area = document.getElementById("subtaskList");
    area.innerHTML = "";

    let task = tasks[currentTaskIndex];

    task.subtasks.forEach((sub, idx) => {
        let div = document.createElement("div");
        div.className = "subtask-item";

        div.innerHTML = `
            <div class="subtask-left">
                <input type="checkbox" ${sub.done ? "checked" : ""} 
                       onchange="toggleSubtask(${idx})">
                <span style="text-decoration:${sub.done ? "line-through" : "none"};">
                    ${sub.text}
                </span>
            </div>

            <span class="subtask-delete" onclick="deleteSubtask(${idx})">🗑</span>
        `;

        area.appendChild(div);
    });
}

function addSubtask() {
    let text = prompt("Subtask:");
    if (!text) return;

    tasks[currentTaskIndex].subtasks.push({
        text,
        done: false
    });

    renderSubtasks();
    save();
}

function toggleSubtask(i) {
    let task = tasks[currentTaskIndex];
    task.subtasks[i].done = !task.subtasks[i].done;
    renderSubtasks();
    save();
}

function deleteSubtask(i) {
    tasks[currentTaskIndex].subtasks.splice(i, 1);
    renderSubtasks();
    save();
}


// ---------- DELETE TASK ----------
function deleteCurrentTask() {
    tasks.splice(currentTaskIndex, 1);
    closeDetail();
    renderAll();
}


// ---------- SAVE ----------
function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("exams", JSON.stringify(exams));
    localStorage.setItem("completed", JSON.stringify(completed));
}


// ---------- TABS ----------
document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        document.querySelectorAll(".tab-content").forEach(sec =>
            sec.classList.remove("active")
        );
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});


// ---------- AUTO-SORT INTERVAL ----------
setInterval(renderAll, 10000);


// ---------- START ----------
renderAll();
