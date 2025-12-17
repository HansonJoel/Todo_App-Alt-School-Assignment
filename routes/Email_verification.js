const express = require("express");
const router = express.Router();
const User = require("../models/user");
const OTP = require("../models/otp");
const sendVerificationOTP = require("../utils/sendVerificationOTP");
const { verifyHashedData } = require("../utils/hashData");

// GET verify page
router.get("/verify_email", (req, res) => {
  if (!req.session.email) return res.redirect("/signup");
  res.render("verify_email", { email: req.session.email });
});

// POST verify OTP
router.post("/verify_email", async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.session.email;

    const record = await OTP.findOne({ email });
    if (!record) {
      return res.render("verify_email", {
        email,
        error: "OTP expired or not found",
      });
    }

    if (record.expiresAt < Date.now()) {
      await OTP.deleteOne({ email });
      return res.render("verify_email", {
        email,
        error: "OTP expired. Please resend.",
      });
    }

    const valid = await verifyHashedData(otp, record.otp);
    if (!valid) {
      return res.render("verify_email", {
        email,
        error: "Invalid OTP",
      });
    }

    await User.updateOne({ email }, { verified: true });
    await OTP.deleteOne({ email });

    req.session.email = null;

    res.render("login", {
      success: "Email verified successfully. You can login now.",
    });
  } catch (err) {
    console.error(err);
    res.render("verify_email", { error: "Server error" });
  }
});

// POST resend OTP
router.post("/resend_otp", async (req, res) => {
  try {
    const email = req.session.email;
    const user = await User.findOne({ email });

    if (!user) return res.redirect("/signup");

    await sendVerificationOTP(user);

    res.render("verify_email", {
      email,
      success: "OTP resent successfully",
    });
  } catch (err) {
    console.error(err);
    res.render("verify_email", {
      email: req.session.email,
      error: "Could not resend OTP",
    });
  }
});

module.exports = router;
