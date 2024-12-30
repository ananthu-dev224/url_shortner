import passport from "passport";
import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";
dotenv.config();
// Configuration of Passport 
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback", // URL where Google redirects after login
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the db
        let user = await User.findOne({ googleId: profile.id });

        // If user doesn't exist, create a new one
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });
        }

        done(null, user); // Pass user to Passport
      } catch (err) {
        done(err, null); // Pass error to Passport
      }
    }
  )
);

// Serialize user to store user ID in the session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user to retrieve the user data from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});