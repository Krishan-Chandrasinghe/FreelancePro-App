import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoiceController";
import { protect } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

router
  .route("/")
  .post(protect, upload.single("file"), createInvoice)
  .get(protect, getInvoices);
router
  .route("/:id")
  .get(protect, getInvoiceById)
  .put(protect, upload.single("file"), updateInvoice)
  .delete(protect, deleteInvoice);

export default router;
