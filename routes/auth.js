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
          console.log(`Signup error: ${field} already exists`);
          return res.render("signup", {
            error:
              field === "email"
                ? "Email already registered"
                : "Username already taken",
          });
        }
        console.log("Signup error:", err);
        return res.render("signup", { error: "Signup failed" });
      }

      if (!user) {
        console.log("Signup failed: No user returned by passport");
        return res.render("signup", {
          error: info?.message || "Signup failed",
        });
      }

      // Save user email in session
      req.session.email = user.email;
      console.log(`New signup: ${user.email} | sending OTP...`);

      // SEND VERIFICATION OTP via Brevo
      try {
        await sendVerificationOTP(user);
        console.log(`✅ OTP successfully sent to ${user.email}`);
      } catch (otpError) {
        console.error(`Failed to send OTP to ${user.email}:`, otpError);
        return res.render("verify_email", {
          email: user.email,
          error:
            "Account created but OTP could not be sent. Please resend manually.",
        });
      }

      // Redirect to verify page
      return res.render("verify_email", {
        email: user.email,
        success: "Signup successful! OTP sent to your email.",
      });
    } catch (error) {
      console.error("Unexpected error during signup:", error);
      return res.render("verify_email", {
        email: req.body.email,
        error: "Server error during signup. Please try again.",
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
