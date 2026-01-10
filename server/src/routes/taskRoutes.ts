import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").post(protect, createTask).get(protect, getTasks);
router.route("/:id").put(protect, updateTask).delete(protect, deleteTask);

export default router;
