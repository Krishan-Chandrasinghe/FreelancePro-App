import express from "express";
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../controllers/clientController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").post(protect, createClient).get(protect, getClients);
router
  .route("/:id")
  .get(protect, getClientById)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

export default router;
