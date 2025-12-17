const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const UserModel = require("../models/user");

// Signup strategy: Creates a new user in the database with the provided info.
// Marks the user as unverified.
// Passes the created user to the next middleware, or reports an error if creation fails.
// OTP/email verification is handled in the route, not here.
passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      try {
        const { firstName, lastName, email, phone, gender, day, month, year } =
          req.body;

        const dateOfBirth = { day, month, year };

        const user = await UserModel.create({
          firstName,
          lastName,
          username,
          email,
          password,
          phone,
          gender,
          dateOfBirth,
          verified: false, // mark as unverified
        });

        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);


// This middleware authenticates the user based on the email and password provided.
// Prevent Login for Unverified Users
// If the user is found, it sends the user information to the next middleware.
// Otherwise, it reports an error.
passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "identifier",
      passwordField: "password",
    },
    async (identifier, password, done) => {
      try {
        // Allow login by username OR email
        const user = await UserModel.findOne({
          $or: [{ username: identifier }, { email: identifier }],
        });

        if (!user) return done(null, false, { message: "User not found" });

        // Prevent login if email not verified
        if (!user.verified) {
          return done(null, false, {
            message: "Please verify your email first",
          });
        }

        const valid = await user.isValidPassword(password);
        if (!valid) return done(null, false, { message: "Wrong password" });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
