import express from "express";
import { verifyToken } from "../middleware/jwtVerify.js";

const router = express.Router();

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to the dashboard!",
    user: req.user,
  });
});

export default router;