import express from "express";
import {
  createShortUrl,
  redirectShortUrl,
} from "../controller/urlController.js";
import { delay } from "../middleware/rateLimit.js";
import { verifyToken } from "../middleware/jwtVerify.js";

const router = express.Router();

// POST /api/shorten
router.post("/", verifyToken, delay, createShortUrl);

// GET /api/shorten/:alias
router.get("/:alias", redirectShortUrl);

export default router;
