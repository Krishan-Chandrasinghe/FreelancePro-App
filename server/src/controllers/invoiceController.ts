import { Request, Response } from "express";
import Invoice from "../models/Invoice";

const createInvoice = async (req: any, res: Response) => {
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

  const invoice = await Invoice.create({
    user: req.user._id,
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
  });

  res.status(201).json(invoice);
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

    // Full update logic for items usually requires more thought (replace vs update), basic replacement here
    if (req.body.items) {
      invoice.items = req.body.items;
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
