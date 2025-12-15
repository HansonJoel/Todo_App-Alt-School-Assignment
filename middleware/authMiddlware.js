const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const UserModel = require("../models/user");

const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), // Use this if you are using Bearer token
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);

// This middleware saves the information provided by the user to the database,
// and then sends the user information to the next middleware if successful.
// Otherwise, it reports an error.
passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "username", //field used for login
      passwordField: "password", // field used for login
      passReqToCallback: true, // gives acces to req.body
    },
    async (req, username, password, done) => {
      try {
        // Extract fields from form
        const { firstName, lastName, email, phone, gender, day, month, year } =
          req.body;

        // ✅ Group date fields correctly
        const dateOfBirth = {
          day,
          month,
          year,
        };

        // create the user with all fields
        const user = await UserModel.create({
          firstName,
          lastName,
          username,
          email,
          password,
          phone,
          gender,
          dateOfBirth,
        });

        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

// This middleware authenticates the user based on the email and password provided.
// If the user is found, it sends the user information to the next middleware.
// Otherwise, it reports an error.
passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "identifier", // email OR username
      passwordField: "password",
    },
    async (identifier, password, done) => {
      try {
        // search email first, if not found search username
        const user =
          (await UserModel.findOne({ email: identifier })) ||
          (await UserModel.findOne({ username: identifier }));

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const valid = await user.isValidPassword(password);

        if (!valid) {
          return done(null, false, { message: "Wrong password" });
        }

        return done(null, user, { message: "Login successful" });
      } catch (error) {
        return done(error);
      }
    }
  )
);
