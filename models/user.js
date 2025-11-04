const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    match: [/^\+?\d{7,15}$/, "Please enter a valid phone number"],
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },
  dateOfBirth: {
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  // ✅ Add this to link user's tasks
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task", // reference to the Task model
    },
  ],
});

// The code in the UserScheme.pre() function is called a pre-hook.
// Before the user information is saved in the database, this function will be called,
// you will get the plain text password, hash it, and store it.
userSchema.pre("save", async function (next) {
  // Only hash if the password has been modified or is new
  if (!this.isModified("password")) return next();

  try {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

// You will also need to make sure that the user trying to log in has the correct credentials. Add the following new method:
// ✅ Password validation method
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
