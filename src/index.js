import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import urlRoutes from "./routes/urlRoutes.js";
import "./config/passport.js";

dotenv.config();
const app = express();

const port = process.env.PORT || 4000;

connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport for Google-auth
app.use(passport.initialize());
app.use(passport.session());

// Application routes
app.use("/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/shorten", urlRoutes);

app.listen(port, () => {
  console.log(`Server starting at port ${port}`);
});
