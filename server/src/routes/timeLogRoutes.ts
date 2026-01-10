import express from "express";
import { logTime, getTimeLogs } from "../controllers/timeLogController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").post(protect, logTime).get(protect, getTimeLogs);

export default router;
