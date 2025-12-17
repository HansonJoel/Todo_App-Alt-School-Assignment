const OTP = require("../models/otp");
const generateOTP = require("./generateOTP");
const { hashData } = require("./hashData");
const { sendEmailVerificationOTP } = require("./sendEmail");

const sendVerificationOTP = async (user) => {
  const otp = await generateOTP();
  const hashedOTP = await hashData(otp);

  await OTP.deleteOne({ email: user.email });

  await OTP.create({
    email: user.email,
    otp: hashedOTP,
    createdAt: Date.now(),
    expiresAt: Date.now() + 3600000, // 1 hour
  });

  await sendEmailVerificationOTP(user.email, otp, user.firstName);
};

module.exports = sendVerificationOTP;
