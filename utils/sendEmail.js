const nodemailer = require("nodemailer");
const { AUTH_EMAIL, AUTH_PASS } = process.env;

// Create transporter
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASS,
  },
});

// Test transporter
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP Error", error);
  } else {
    console.log("Server Ready to Send Email");
  }
});

// Generic send email function
const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

// ================================
// Email Templates
// ================================

// Password Reset OTP
const sendPasswordResetOTP = async (email, otp, firstName) => {
  const subject = "Password Reset Request";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f7f7f7; }
          .email-container { padding: 20px; background-color: white; margin: 0 auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { font-size: 24px; color: #333; }
          .otp { font-size: 28px; color: tomato; font-weight: bold; letter-spacing: 1px; }
          .footer { font-size: 12px; color: #888; text-align: center; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h1 class="header">Password Reset Request</h1>
          <p>Hi ${firstName},</p>
          <p>You requested to reset your password for your account associated with the email: ${email}.</p>
          <p>Please use the following OTP to reset your password:</p>
          <p class="otp">${otp}</p>
          <p>This OTP will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
          <div class="footer">
            <p>Thank you for using our app!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ from: AUTH_EMAIL, to: email, subject, html });
};

// Resend OTP
const sendResendOTP = async (email, otp, firstName) => {
  const subject = "Resend OTP";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Resend OTP</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f7f7f7; }
          .email-container { padding: 20px; background-color: white; margin: 0 auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { font-size: 24px; color: #333; }
          .otp { font-size: 28px; color: tomato; font-weight: bold; letter-spacing: 1px; }
          .footer { font-size: 12px; color: #888; text-align: center; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h1 class="header">Resend OTP</h1>
          <p>Hi ${firstName},</p>
          <p>You requested a new OTP to reset your password for your account associated with the email: ${email}.</p>
          <p>Please use the following OTP to continue the password reset process:</p>
          <p class="otp">${otp}</p>
          <p>This OTP will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
          <div class="footer">
            <p>Thank you for using our app!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ from: AUTH_EMAIL, to: email, subject, html });
};

// Email Verification OTP
const sendEmailVerificationOTP = async (email, otp, firstName) => {
  const subject = "Email Verification";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f7f7f7; }
          .email-container { padding: 20px; background-color: white; margin: 0 auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { font-size: 24px; color: #333; }
          .otp { font-size: 28px; color: tomato; font-weight: bold; letter-spacing: 1px; }
          .footer { font-size: 12px; color: #888; text-align: center; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h1 class="header">Email Verification</h1>
          <p>Hi ${firstName},</p>
          <p>Thank you for registering with us!. To complete your registration, kindly verify your email address.</p>
          <p>Use the following OTP to verify your email:</p>
          <p class="otp">${otp}</p>
          <p>This OTP will expire in 1 hour. If you did not register with us, please ignore this email.</p>
          <div class="footer">
            <p>Thank you for using our app!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ from: AUTH_EMAIL, to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendPasswordResetOTP,
  sendResendOTP,
  sendEmailVerificationOTP,
};
