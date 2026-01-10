import express from "express";
import {
  recordTrial,
  getProjectTrials,
  getAllTrials,
} from "../controllers/trialController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").get(protect, getAllTrials).post(protect, recordTrial);
router.route("/project/:projectId").get(protect, getProjectTrials);

export default router;
