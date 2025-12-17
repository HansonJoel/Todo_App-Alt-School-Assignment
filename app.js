const express = require("express");
const passport = require("passport");

require("dotenv").config();
const database = require("./database");
database.connectDB();
const PORT = process.env.PORT || 3000;
const HOSTNAME = "localhost";
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");

const bodyParser = require("body-parser");

// Load passport config BEFORE routes
require("./middleware/authMiddlware");

// Routes
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/task");
const passwordResetRoutes = require("./routes/passwordReset");
const emailVerificationRoutes = require("./routes/Email_verification");

const app = express();

// View Engine
app.set("view engine", "ejs");
app.set("views", "views");

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());

// ✅ REQUIRED for OTP flow
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/forgot_password", passwordResetRoutes);
app.use("/email_verification", emailVerificationRoutes);

app.get("/", (req, res) => {
  res.render("homepage");
});

// Handle errors.
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is currently running at http://${HOSTNAME}:${PORT}/`);
});
