import { Response } from "express";
import Trial from "../models/Trial";
import Project from "../models/Project";

const recordTrial = async (req: any, res: Response) => {
  const { projectId, notes } = req.body;
  const userId = req.user._id;

  try {
    const project = await Project.findById(projectId);
    if (!project || project.user.toString() !== userId.toString()) {
      return res.status(404).json({ message: "Project not found" });
    }

    const trialCount = await Trial.countDocuments({ project: projectId });

    let cost = 0;
    let isExtra = false;

    if (trialCount >= 3) {
      cost = 10;
      isExtra = true;
    }

    const trial = await Trial.create({
      user: userId,
      project: projectId,
      notes,
      cost,
      isExtra,
    });

    res.status(201).json(trial);
  } catch (error) {
    res.status(500).json({ message: "Server error recording trial" });
  }
};

const getProjectTrials = async (req: any, res: Response) => {
  try {
    const trials = await Trial.find({
      project: req.params.projectId,
      user: req.user._id,
    }).sort({ date: -1 });

    res.json(trials);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching trials" });
  }
};

const getAllTrials = async (req: any, res: Response) => {
  try {
    const trials = await Trial.find({ user: req.user._id })
      .populate("project", "name")
      .sort({ date: -1 });
    res.json(trials);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching all trials" });
  }
};

export { recordTrial, getProjectTrials, getAllTrials };
