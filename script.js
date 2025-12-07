// ---------- DATA STORAGE SETUP ----------
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let exams = JSON.parse(localStorage.getItem("exams") || "[]");
let completed = JSON.parse(localStorage.getItem("completed") || "[]");


// ---------- HYBRID URGENCY ALGORITHM ----------
function urgencyScore(days, weight, isExam) {

    let priority = weight * (10 / (days + 1));
    let heat = (weight * 2) + (8 / (days + 1));
    let decay = 5 * Math.exp(-0.25 * days);

    let score = (0.5 * priority) + (0.3 * heat) + (0.2 * decay);

    if (isExam) score *= 1.5;

    return score;
}


// ---------- CARD GLOW SYSTEM ----------
function glowClass(score) {
    if (score >= 12) return "glow-red";
    if (score >= 7) return "glow-orange";
    if (score >= 4) return "glow-yellow";
    return "glow-green";
}


// ---------- RENDER FUNCTIONS ----------
function renderAll() {
    renderTasks();
    renderExams();
    renderCompleted();
}

function renderTasks() {
    let div = document.getElementById("taskList");
    div.innerHTML = "";

    tasks.sort((a, b) => b.score - a.score);

    tasks.forEach((t, i) => {
        let card = document.createElement("div");
        card.className = `card ${glowClass(t.score)}`;
        card.innerHTML = `
            <strong>${t.name}</strong><br>
            Due in ${t.days} days<br>
            <button onclick="completeTask(${i})">Complete</button>
        `;
        div.appendChild(card);
    });

    save();
}

function renderExams() {
    let div = document.getElementById("examList");
    div.innerHTML = "";

    exams.sort((a, b) => b.score - a.score);

    exams.forEach((e, i) => {
        let daysLeft = Math.floor((new Date(e.date) - new Date()) / 86400000);

        let card = document.createElement("div");
        card.className = `card ${glowClass(e.score)}`;
        card.innerHTML = `
            <strong>${e.name}</strong><br>
            ${daysLeft} days left<br>
            <button onclick="completeExam(${i})">Complete</button>
        `;
        div.appendChild(card);
    });

    save();
}

function renderCompleted() {
    let div = document.getElementById("completedList");
    div.innerHTML = "";

    completed.forEach((c) => {
        let card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<strong>${c}</strong>`;
        div.appendChild(card);
    });
}


// ---------- COMPLETE FUNCTIONS ----------
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


// ---------- MODAL ----------
let modalType = "task";

function openModal(type) {
    modalType = type;

    document.getElementById("modal").classList.remove("hidden");
    document.getElementById("modalTitle").textContent =
        type === "task" ? "Add Task" : "Add Exam";

    document.getElementById("examDateLabel").classList.toggle("hidden", type === "task");
    document.getElementById("modalDate").classList.toggle("hidden", type === "task");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

function submitModal() {
    let name = document.getElementById("modalName").value;
    let days = Number(document.getElementById("modalDays").value);
    let weight = Number(document.getElementById("modalWeight").value);

    if (modalType === "task") {
        let score = urgencyScore(days, weight, false);
        tasks.push({ name, days, weight, score });

    } else {
        let date = document.getElementById("modalDate").value;
        let daysLeft = Math.floor((new Date(date) - new Date()) / 86400000);
        let score = urgencyScore(daysLeft, weight, true);
        exams.push({ name, date, weight, score });
    }

    closeModal();
    renderAll();
}


// ---------- SAVE ----------
function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("exams", JSON.stringify(exams));
    localStorage.setItem("completed", JSON.stringify(completed));
}


// ---------- TAB SWITCHING ----------
document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        document.querySelectorAll(".tab-content").forEach(sec => sec.classList.remove("active"));
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});


// ---------- AUTO SORT EVERY 10 SECONDS ----------
setInterval(() => {
    tasks.forEach(t => t.score = urgencyScore(t.days, t.weight, false));
    exams.forEach(e => {
        let daysLeft = Math.floor((new Date(e.date) - new Date()) / 86400000);
        e.score = urgencyScore(daysLeft, e.weight, true);
    });
    renderAll();
}, 10000);


// ---------- INITIAL RENDER ----------
renderAll();
