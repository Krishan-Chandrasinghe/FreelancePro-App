import { Request, Response } from "express";
import Client from "../models/Client";

// @desc    Create a client
// @route   POST /api/clients
// @access  Private
const createClient = async (req: any, res: Response) => {
  const {
    name,
    email,
    phone,
    companyName,
    address,
    status,
    trialStartDate,
    trialEndDate,
  } = req.body;

  const client = await Client.create({
    user: req.user._id,
    name,
    email,
    phone,
    companyName,
    address,
    status,
    trialStartDate,
    trialEndDate,
  });

  res.status(201).json(client);
};

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
const getClients = async (req: any, res: Response) => {
  const clients = await Client.find({ user: req.user._id });
  res.json(clients);
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
const getClientById = async (req: any, res: Response) => {
  const client = await Client.findById(req.params.id);

  if (client && client.user.toString() === req.user._id.toString()) {
    res.json(client);
  } else {
    res.status(404).json({ message: "Client not found" });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req: any, res: Response) => {
  const client = await Client.findById(req.params.id);

  if (client && client.user.toString() === req.user._id.toString()) {
    client.name = req.body.name || client.name;
    client.email = req.body.email || client.email;
    client.phone = req.body.phone || client.phone;
    client.companyName = req.body.companyName || client.companyName;
    client.address = req.body.address || client.address;
    client.status = req.body.status || client.status;
    client.trialStartDate = req.body.trialStartDate || client.trialStartDate;
    client.trialEndDate = req.body.trialEndDate || client.trialEndDate;

    const updatedClient = await client.save();
    res.json(updatedClient);
  } else {
    res.status(404).json({ message: "Client not found" });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = async (req: any, res: Response) => {
  const client = await Client.findById(req.params.id);

  if (client && client.user.toString() === req.user._id.toString()) {
    await client.deleteOne();
    res.json({ message: "Client removed" });
  } else {
    res.status(404).json({ message: "Client not found" });
  }
};

export { createClient, getClients, getClientById, updateClient, deleteClient };
