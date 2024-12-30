import express from "express";
import passport from "passport";
import { googleAuthCallback } from "../controller/authController.js";

const router = express.Router();

// Route to initiate Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route after Google login
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  googleAuthCallback
);

export default router;