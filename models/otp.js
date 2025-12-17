const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: Date,
  expiresAt: Date,
});

module.exports = mongoose.model("OTP", otpSchema);
