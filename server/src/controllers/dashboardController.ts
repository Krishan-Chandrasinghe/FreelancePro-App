import { Response } from "express";
import Client from "../models/Client";
import Project from "../models/Project";
import Invoice from "../models/Invoice";

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    const totalClients = await Client.countDocuments({ user: userId });
    const activeProjects = await Project.countDocuments({
      user: userId,
      status: "In Progress",
    });
    const pendingInvoices = await Invoice.countDocuments({
      user: userId,
      status: "Pending",
    });

    const invoices = await Invoice.find({ user: userId });
    const unpaidAmount = invoices
      .filter((i) => i.status !== "Complete")
      .reduce((sum, i) => sum + i.totalAmount, 0);

    const totalEarning = invoices
      .filter((i) => i.status === "Complete")
      .reduce((sum, i) => sum + i.totalAmount, 0);

    const recentProjects = await Project.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("client", "name");

    const recentInvoices = await Invoice.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("client", "name");

    const activeTimer = await Project.findOne({
      user: userId,
      timerStartTime: { $ne: null },
    }).populate("client", "name");

    res.json({
      totalClients,
      activeProjects,
      pendingInvoices,
      unpaidAmount,
      totalEarning,
      recentProjects,
      recentInvoices,
      activeTimer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

export { getDashboardStats };
