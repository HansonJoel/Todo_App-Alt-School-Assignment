const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const sendVerificationOTP = require("../utils/sendVerificationOTP");

const router = express.Router();

// GET signup page
router.get("/signup", (req, res) => {
  res.render("signup");
});

// GET login page
router.get("/login", (req, res) => {
  res.render("login");
});

// GET forgotten password
router.get("/forgotten_password", (req, res) => {
  res.render("forgotten_password");
});

// POST Signup
router.post("/signup", async (req, res, next) => {
  passport.authenticate("signup", async (err, user, info) => {
    try {
      if (err) {
        if (err.code === 11000) {
          const field = Object.keys(err.keyValue)[0];
          return res.render("signup", {
            error:
              field === "email"
                ? "Email already registered"
                : "Username already taken",
          });
        }
        return res.render("signup", { error: "Signup failed" });
      }

      if (!user) {
        return res.render("signup", {
          error: info?.message || "Signup failed",
        });
      }

      // ✅ Save email in session
      req.session.email = user.email;

      // ✅ SEND OTP 
      await sendVerificationOTP(user);

      // ✅ REDIRECT TO VERIFY PAGE
      return res.render("verify_email", {
        email: user.email,
      });
    } catch (error) {
      console.error("OTP error:", error);
      return res.render("verify_email", {
        email: user.email,
        error: "Account created but OTP could not be sent. Please resend.",
      });
    }
  })(req, res, next);
});

// POST login
router.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err) return next(err);
      if (!user)
        return res
          .status(400)
          .render("login", { error: info?.message || "Invalid credentials" });

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);
        const token = jwt.sign(
          { user: { _id: user._id, email: user.email } },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });
        res.redirect("/tasks/dashboard");
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("login", { error: "Server error" });
    }
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
});

module.exports = router;
