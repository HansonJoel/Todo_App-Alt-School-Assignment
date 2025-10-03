const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const mongoURL = process.env.mongoURL;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log("MongoDB connected");
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  connectDB,
};
