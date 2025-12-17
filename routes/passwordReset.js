const express = require("express");
const User = require("../models/user");
const OTP = require("../models/otp");
const generateOTP = require("../utils/generateOTP");
const { hashData, verifyHashedData } = require("../utils/hashData");
const { sendPasswordResetOTP, sendResendOTP } = require("../utils/sendEmail");

const router = express.Router();

// GET - show forgotten password page
router.get("/forgotten_password", (req, res) => {
  res.render("forgotten_password");
});

// POST - request OTP
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.render("forgotten_password", { error: "Email not found" });

    const otp = await generateOTP();
    const hashedOTP = await hashData(otp);

    await OTP.deleteOne({ email });
    await OTP.create({
      email,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour
    });

    // Send OTP email using template
    await sendPasswordResetOTP(email, otp, user.firstName);

    req.session.resetEmail = email;
    res.render("verify_otp");
  } catch (error) {
    console.error(error);
    res.render("forgotten_password", {
      error: "An error occurred. Please try again.",
    });
  }
});

// POST - verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.session.resetEmail;

    if (!email)
      return res.render("verify_otp", {
        error: "Session expired. Please try again.",
      });

    const record = await OTP.findOne({ email });
    if (!record) return res.render("verify_otp", { error: "OTP expired" });

    const valid = await verifyHashedData(otp, record.otp);
    if (!valid) return res.render("verify_otp", { error: "Invalid OTP" });

    res.render("reset_password");
  } catch (error) {
    console.error(error);
    res.render("verify_otp", { error: "An error occurred. Please try again." });
  }
});

// POST - resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const email = req.session.resetEmail;
    if (!email)
      return res.render("verify_otp", {
        error: "Session expired. Please try again.",
      });

    const user = await User.findOne({ email });
    if (!user) return res.render("verify_otp", { error: "User not found" });

    const otp = await generateOTP();

    await OTP.deleteOne({ email });
    await OTP.create({
      email,
      otp: await hashData(otp),
      expiresAt: Date.now() + 3600000,
    });

    // Send OTP email using template
    await sendResendOTP(email, otp, user.firstName);

    res.render("verify_otp", { success: "OTP resent successfully" });
  } catch (error) {
    console.error(error);
    res.render("verify_otp", { error: "An error occurred. Please try again." });
  }
});

// POST - reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { password, confirm_password } = req.body;

    if (!password || !confirm_password) {
      return res.render("reset_password", {
        error: "Both fields are required",
      });
    }

    if (password !== confirm_password) {
      return res.render("reset_password", { error: "Passwords do not match" });
    }

    const email = req.session.resetEmail;
    const user = await User.findOne({ email });
    if (!user) return res.render("reset_password", { error: "User not found" });

    user.password = password; // Will be hashed via pre-save hook
    await user.save();
    await OTP.deleteOne({ email });

    req.session.resetEmail = null; // Clear session email
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.render("reset_password", {
      error: "An error occurred. Please try again.",
    });
  }
});

module.exports = router;
