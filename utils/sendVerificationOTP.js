const OTP = require("../models/otp");
const generateOTP = require("./generateOTP");
const { hashData } = require("./hashData");
const { sendEmailVerificationOTP } = require("./sendEmail");

const sendVerificationOTP = async (user) => {
  try {
    // Generate OTP
    const otp = await generateOTP();

    // Hash OTP
    const hashedOTP = await hashData(otp);

    // Remove any existing OTP for this email
    await OTP.deleteOne({ email: user.email });

    // Create new OTP record
    await OTP.create({
      email: user.email,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour
    });

    // Log sending info
    console.log("Sending OTP to:", user.email);

    // Send email using Brevo
    await sendEmailVerificationOTP(user.email, otp, user.firstName || "User");

    console.log("OTP successfully sent to:", user.email);
  } catch (error) {
    console.error("Error sending verification OTP:", error);
    throw error;
  }
};

module.exports = sendVerificationOTP;
