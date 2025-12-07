// load from browser storage or start empty
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let completed = JSON.parse(localStorage.getItem("completed")) || [];
let exams = JSON.parse(localStorage.getItem("exams")) || [];

// save everything
function saveAll() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("completed", JSON.stringify(completed));
    localStorage.setItem("exams", JSON.stringify(exams));
}

// render UI
function updateUI() {
    renderList(tasks, "taskList", true);
    renderList(completed, "completedList", false);
    renderList(exams, "examList", true, true);
}

// reusable renderer
function renderList(arr, elementId, editable, isExam=false) {
    let container = document.getElementById(elementId);
    container.innerHTML = "";

    arr.forEach((item, i) => {
        let card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div class="card-title">${item.name}</div>
            <div class="card-details">
                Days: ${item.days} | Weight: ${item.weight}
            </div>
        `;

        // edit
        if (editable) {
            let edit = document.createElement("button");
            edit.innerText = "Edit";
            edit.className = "edit-btn";
            edit.onclick = () => editItem(arr, i);
            card.appendChild(edit);
        }

        // complete button (only for active tasks)
        if (!isExam && editable) {
            let done = document.createElement("button");
            done.innerText = "Complete";
            done.className = "complete-btn";
            done.onclick = () => completeTask(i);
            card.appendChild(done);
        }

        // delete
        let del = document.createElement("button");
        del.innerText = "Delete";
        del.className = "delete-btn";
        del.onclick = () => deleteItem(arr, i, isExam);
        card.appendChild(del);

        container.appendChild(card);
    });
}

// ---------------- ADD FUNCTIONS ----------------

function addTask() {
    let name = prompt("Task name:");
    let days = parseInt(prompt("Days until due:"));
    let weight = parseFloat(prompt("Weight:"));

    tasks.push({ name, days, weight });
    saveAll();
    updateUI();
}

function addExam() {
    let name = prompt("Exam name:");
    let days = parseInt(prompt("Days until exam:"));
    let weight = parseFloat(prompt("Importance:"));

    exams.push({ name, days, weight });
    saveAll();
    updateUI();
}

// ---------------- EDIT + DELETE ----------------

function editItem(arr, index) {
    let item = arr[index];

    item.name = prompt("New name:", item.name);
    item.days = parseInt(prompt("New days:", item.days));
    item.weight = parseFloat(prompt("New weight:", item.weight));

    saveAll();
    updateUI();
}

function deleteItem(arr, index, isExam) {
    arr.splice(index, 1);
    saveAll();
    updateUI();
}

// ---------------- COMPLETE TASK ----------------

function completeTask(index) {
    completed.push(tasks[index]);  
    tasks.splice(index, 1);

    saveAll();
    updateUI();
}

// ---------------- SUGGESTION ALGORITHM ----------------

function suggestTask() {
    if (tasks.length === 0) return alert("No tasks available.");

    let best = 0;
    let bestScore = tasks[0].days * tasks[0].weight;

    tasks.forEach((t, i) => {
        let score = t.days * t.weight;
        if (score < bestScore) {
            bestScore = score;
            best = i;
        }
    });

    alert("Do this next: " + tasks[best].name);
}

function suggestExam() {
    if (exams.length === 0) return alert("No exams available.");

    let best = 0;
    let bestScore = exams[0].days * exams[0].weight;

    exams.forEach((e, i) => {
        let score = e.days * e.weight;
        if (score < bestScore) {
            bestScore = score;
            best = i;
        }
    });

    alert("Study for: " + exams[best].name);
}

// load everything at start
updateUI();
