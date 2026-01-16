import { Request, Response } from "express";
import Invoice from "../models/Invoice";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaryUtils";

const createInvoice = async (req: any, res: Response) => {
  try {
    const {
      client,
      invoiceNumber,
      dueDate,
      freelancerDetails,
      clientDetails,
      items,
      subtotal,
      discount,
      taxRate,
      shipping,
      totalAmount,
      status,
      project,
      notes,
    } = req.body;

    // Parse JSON fields if they are strings (when using multipart/form-data)
    const parsedItems = typeof items === "string" ? JSON.parse(items) : items;
    const parsedFreelancerDetails =
      typeof freelancerDetails === "string"
        ? JSON.parse(freelancerDetails)
        : freelancerDetails;
    const parsedClientDetails =
      typeof clientDetails === "string"
        ? JSON.parse(clientDetails)
        : clientDetails;

    let fileUrl = "";
    let cloudinary_id = "";

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.path,
        "freelance-pro/invoices"
      );
      fileUrl = result.url;
      cloudinary_id = result.publicId;
    }

    const invoice = await Invoice.create({
      user: req.user._id,
      client,
      invoiceNumber,
      dueDate,
      freelancerDetails: parsedFreelancerDetails,
      clientDetails: parsedClientDetails,
      items: parsedItems,
      subtotal,
      discount,
      taxRate,
      shipping,
      totalAmount,
      status,
      project,
      notes,
      fileUrl,
      cloudinary_id,
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    const fs = require("fs");
    fs.writeFileSync("error_log.json", JSON.stringify(error, null, 2));
    res.status(500).json({ message: "Error creating invoice", error: error });
  }
};

const getInvoices = async (req: any, res: Response) => {
  const invoices = await Invoice.find({ user: req.user._id }).populate(
    "client",
    "name companyName"
  );
  res.json(invoices);
};

const getInvoiceById = async (req: any, res: Response) => {
  const invoice = await Invoice.findById(req.params.id).populate(
    "client",
    "name companyName"
  );

  if (invoice && invoice.user.toString() === req.user._id.toString()) {
    res.json(invoice);
  } else {
    res.status(404).json({ message: "Invoice not found" });
  }
};

const updateInvoice = async (req: any, res: Response) => {
  const invoice = await Invoice.findById(req.params.id);

  if (invoice && invoice.user.toString() === req.user._id.toString()) {
    invoice.status = req.body.status || invoice.status;
    invoice.dueDate = req.body.dueDate || invoice.dueDate;
    invoice.project = req.body.project || invoice.project;
    invoice.notes = req.body.notes || invoice.notes;

    // Full update logic for items usually requires more thought (replace vs update), basic replacement here
    if (req.body.items) {
      invoice.items =
        typeof req.body.items === "string"
          ? JSON.parse(req.body.items)
          : req.body.items;
    }

    // Handle other fields potentially being strings if coming from FormData
    if (req.body.freelancerDetails) {
      invoice.freelancerDetails =
        typeof req.body.freelancerDetails === "string"
          ? JSON.parse(req.body.freelancerDetails)
          : req.body.freelancerDetails;
    }
    if (req.body.clientDetails) {
      invoice.clientDetails =
        typeof req.body.clientDetails === "string"
          ? JSON.parse(req.body.clientDetails)
          : req.body.clientDetails;
    }

    if (req.body.subtotal) invoice.subtotal = req.body.subtotal;
    if (req.body.discount) invoice.discount = req.body.discount;
    if (req.body.taxRate) invoice.taxRate = req.body.taxRate;
    if (req.body.shipping) invoice.shipping = req.body.shipping;
    if (req.body.totalAmount) invoice.totalAmount = req.body.totalAmount;

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.path,
        "freelance-pro/invoices"
      );

      // Delete old file from Cloudinary if exists
      if (invoice.cloudinary_id) {
        await deleteFromCloudinary(invoice.cloudinary_id);
      }

      invoice.fileUrl = result.url;
      invoice.cloudinary_id = result.publicId;
    }

    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
  } else {
    res.status(404).json({ message: "Invoice not found" });
  }
};

const deleteInvoice = async (req: any, res: Response) => {
  const invoice = await Invoice.findById(req.params.id);

  if (invoice && invoice.user.toString() === req.user._id.toString()) {
    // Delete file from Cloudinary if exists
    if (invoice.cloudinary_id) {
      await deleteFromCloudinary(invoice.cloudinary_id);
    }
    await invoice.deleteOne();
    res.json({ message: "Invoice removed" });
  } else {
    res.status(404).json({ message: "Invoice not found" });
  }
};

export {
  createInvoice,
  getInvoices,
  getInvoiceById,
  deleteInvoice,
  updateInvoice,
};
