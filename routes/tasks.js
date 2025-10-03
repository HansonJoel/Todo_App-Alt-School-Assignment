const express = require("express");
const Task = require("../models/task");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware to verify JWT from cookie
const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.redirect("/login");
  }
};

// Dashboard - shows tasks
router.get("/dashboard", verifyToken, async (req, res, next) => {
  try {
    const filter = req.query.filter || "all";
    let query = { user: req.userId };

    if (filter !== "all") {
      query.status = filter;
    }

    const tasks = await Task.find(query);
    res.render("dashboard", { tasks });
  } catch (err) {
    next(err);
  }
});

// Add new task
router.post("/add", verifyToken, async (req, res, next) => {
  try {
    const { title } = req.body;
    const task = new Task({ title, user: req.userId });
    await task.save();
    res.redirect("/tasks/dashboard");
  } catch (err) {
    next(err);
  }
});

// Update task status
router.post("/update/:id", verifyToken, async (req, res, next) => {
  try {
    const { status } = req.body;
    await Task.findByIdAndUpdate(req.params.id, { status });
    res.redirect("/tasks/dashboard");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
