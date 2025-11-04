const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

// GET signup page
router.get("/signup", (req, res) => {
  res.render("signup");
});

// GET login page
router.get("/login", (req, res) => {
  res.render("login");
});

// POST signup (register new user)
router.post("/signup", async (req, res, next) => {
  passport.authenticate("signup", async (err, user, info) => {
    try {
      if (err) {
        // Handle duplicate key error (MongoDB error code 11000)
        if (err.code === 11000) {
          const field = Object.keys(err.keyValue)[0];
          const message =
            field === "email"
              ? "This email is already registered. Please use a different email."
              : "This username is already taken. Please choose another username.";
          return res.status(400).render("signup", { error: message });
        }

        // Catch any other validation error
        console.error(err);
        return res.status(400).render("signup", {
          error: "An unexpected error occurred. Please try again.",
        });
      }

      // ✅ Success — redirect to login
      res.redirect("/login");
    } catch (error) {
      console.error(error);
      return res.status(500).render("signup", {
        error: "A server error occurred. Please try again.",
      });
    }
  })(req, res, next);
});

// POST login
router.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err) return next(err);

      if (!user) {
        // Invalid credentials
        const message = info?.message || "Invalid username or password.";
        return res.status(400).render("login", { error: message });
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { _id: user._id, email: user.email };
        const token = jwt.sign({ user: body }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        // Store JWT in cookie
        res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });

        // Redirect to dashboard
        return res.redirect("/tasks/dashboard");
      });
    } catch (error) {
      console.error(error);
      return res.status(500).render("login", {
        error: "A server error occurred. Please try again.",
      });
    }
  })(req, res, next);
});

// LOGOUT
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
});

module.exports = router;
