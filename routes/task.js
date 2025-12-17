const express = require("express");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");
const User = require("../models/user");
const router = express.Router();

// 🧩 Middleware: Verify JWT from cookies
function authenticateJWT(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) return res.redirect("/login");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.redirect("/login");

    req.user = decoded.user; // attach logged-in user info
    next();
  });
}


// Dashboard route with filtering, search, and date filter
router.get("/dashboard", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user._id; // Now req.user is defined because of authenticateJWT
    const filter = req.query.filter || "all";
    const search = req.query.search || "";
    const date = req.query.date || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    const query = { user: userId };

    // Apply filter
    if (filter === "pending") query.status = "pending";
    else if (filter === "completed") query.status = "completed";
    else if (filter === "overdue") {
      query.deadline = { $lt: new Date() };
      query.status = { $ne: "completed" };
    }

    // Search filter
    if (search.trim() !== "") {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { comments: { $regex: search, $options: "i" } },
      ];
    }

    // Date filter
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.deadline = { $gte: startOfDay, $lte: endOfDay };
    }

    // Pagination
    const totalTasks = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalTasks / limit);
    const tasks = await Task.find(query)
      .sort({ deadline: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const noResults = tasks.length === 0;

    res.render("dashboard", {
      tasks,
      filter,
      search,
      date,
      currentPage: page,
      totalPages,
      noResults,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ➕ Add Task — belongs to current user
router.post("/add", authenticateJWT, async (req, res) => {
  try {
    const { title, deadline, comments } = req.body;

    await Task.create({
      title,
      comments: comments || "",
      deadline: deadline ? new Date(deadline) : null,
      user: req.user._id, // associate task with user
    });

    res.redirect("/tasks/dashboard");
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(500).send("Error adding task");
  }
});

// ✏️ Edit Task
router.post("/edit/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, deadline, comments } = req.body;

    await Task.findOneAndUpdate(
      { _id: id, user: req.user._id }, // user ownership check
      {
        title,
        comments,
        deadline: deadline ? new Date(deadline) : null,
      }
    );

    res.redirect("/tasks/dashboard");
  } catch (err) {
    console.error("Error editing task:", err);
    res.status(500).send("Error editing task");
  }
});

// 🔄 Update Task Status
router.post("/update/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await Task.findOneAndUpdate(
      { _id: id, user: req.user._id }, // only update if it belongs to this user
      { status }
    );

    res.redirect("/tasks/dashboard");
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).send("Error updating task");
  }
});

// 🗑️ Delete Task
router.post("/delete/:id", authenticateJWT, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.redirect("/tasks/dashboard");
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).send("Error deleting task");
  }
});

module.exports = router;
