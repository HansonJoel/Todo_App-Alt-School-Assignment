const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// Home route - redirect to dashboard or login
router.get("/", (req, res) => {
  if (req.cookies.jwt) {
    res.redirect("/tasks/dashboard");
  } else {
    res.redirect("/login");
  }
});

router.get("/signup", (req, res) => res.render("signup"));
router.get("/login", (req, res) => res.render("login"));

// Register
router.post("/signup", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    if (err.code === 11000) {
      return res.render("signup", { error: "Username already exists" });
    }
    next(err);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.isValidPassword(password))) {
      return res.render("login", { error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "1h",
      }
    );
    res.cookie("jwt", token, { httpOnly: true });
    res.redirect("/tasks/dashboard");
  } catch (err) {
    next(err);
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
});

module.exports = router;
