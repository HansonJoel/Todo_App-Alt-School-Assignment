function startApp() {
  // Redirect to the signup page
  window.location.href = "/signup";
}

function openModal() {
  document.getElementById("taskModal").classList.add("show");
  document.getElementById("modalTitle").textContent = "Add New Task";
  document.getElementById("taskForm").action = "/tasks/add";
  document.getElementById("taskForm").reset();
  document.getElementById("taskId").value = "";
}

function closeModal() {
  document.getElementById("taskModal").classList.remove("show");
}

function editTask(button) {
  const id = button.dataset.id;
  const title = button.dataset.title || "";
  const deadline = button.dataset.deadline || "";
  const comments = button.dataset.comments || "";

  // Open modal
  document.getElementById("taskModal").classList.add("show");
  document.getElementById("modalTitle").textContent = "Edit Task";

  // Set the form action
  document.getElementById("taskForm").action = "/tasks/edit/" + id;

  // Fill form with existing values
  document.getElementById("taskId").value = id;
  document.getElementById("title").value = title;
  document.getElementById("deadline").value = deadline;
  document.getElementById("comments").value = comments;
}

// Close modal with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});

function closeModal() {
  document.getElementById("taskModal").classList.remove("show");
  document.getElementById("taskForm").action = "/tasks/add";
  document.getElementById("taskForm").reset();
  document.getElementById("modalTitle").textContent = "Add New Task";
}
