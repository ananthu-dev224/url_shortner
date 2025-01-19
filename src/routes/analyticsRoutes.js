import express from "express";
import {
  getUrlAnalytics,
  getTopicAnalytics,
  getOverallAnalytics,
} from "../controller/analyticsController.js";
import { verifyToken } from "../middleware/jwtVerify.js";

const router = express.Router();

router.get("/overall", verifyToken, getOverallAnalytics);
router.get("/:alias", verifyToken, getUrlAnalytics);
router.get("/topic/:topic", verifyToken, getTopicAnalytics);

export default router;
