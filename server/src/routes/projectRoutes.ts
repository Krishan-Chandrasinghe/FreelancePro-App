import express from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  stopActiveTimer,
} from "../controllers/projectController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").post(protect, createProject).get(protect, getProjects);
router.post("/stop-active", protect, stopActiveTimer);
router
  .route("/:id")
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

export default router;
