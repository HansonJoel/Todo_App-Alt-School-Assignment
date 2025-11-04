const express = require("express");
const passport = require("passport");

require("dotenv").config();
const database = require("./database");
database.connectDB();
const PORT = process.env.PORT || 3000;
const HOSTNAME = "localhost";
const cookieParser = require("cookie-parser");
const path = require("path");

const bodyParser = require("body-parser");

// ✅ Load passport config BEFORE routes
require("./middleware/authMiddlware");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/task");
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// middlewares
app.use(passport.initialize());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", authRoutes);
app.use("/tasks", taskRoutes);

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
