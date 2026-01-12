import { Request, Response } from "express";
import Project from "../models/Project";
import Trial from "../models/Trial";

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = async (req: any, res: Response) => {
  const { client, name, description, status, startDate, dueDate, budget } =
    req.body;

  const project = await Project.create({
    user: req.user._id,
    client,
    name,
    description,
    status,
    startDate,
    dueDate,
    budget,
    progress: 0, // Default to 0 on creation
    totalTimeSpent: 0,
    timerStartTime: null,
  });

  res.status(201).json(project);
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req: any, res: Response) => {
  const projects = await Project.find({ user: req.user._id }).populate(
    "client",
    "name companyName"
  );
  res.json(projects);
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req: any, res: Response) => {
  const project = await Project.findById(req.params.id).populate(
    "client",
    "name companyName"
  );

  if (project && project.user.toString() === req.user._id.toString()) {
    res.json(project);
  } else {
    res.status(404).json({ message: "Project not found" });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req: any, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (project && project.user.toString() === req.user._id.toString()) {
    const {
      name,
      client,
      description,
      status,
      startDate,
      dueDate,
      budget,
      progress,
      totalTimeSpent,
      timerStartTime,
    } = req.body;

    project.name = name || project.name;
    project.client = client || project.client;
    project.description = description || project.description;
    project.status = status || project.status;
    project.startDate = startDate || project.startDate;
    project.dueDate = dueDate || project.dueDate;
    project.budget = budget || project.budget;

    // Explicitly check for undefined because progress/time can be 0 (falsy)
    if (progress !== undefined) project.progress = progress;
    if (totalTimeSpent !== undefined) project.totalTimeSpent = totalTimeSpent;

    // Handle timerStartTime specifically
    if (timerStartTime !== undefined) {
      // If we are starting a timer (setting it to a date string/object), stop any other active timers
      if (timerStartTime !== null) {
        const activeProjects = await Project.find({
          user: req.user._id,
          timerStartTime: { $ne: null },
          _id: { $ne: project._id }, // Exclude current project if it was somehow active
        });

        for (const activeProj of activeProjects) {
          if (activeProj.timerStartTime) {
            const now = new Date();
            const start = new Date(activeProj.timerStartTime);
            const duration = now.getTime() - start.getTime();
            activeProj.totalTimeSpent =
              (activeProj.totalTimeSpent || 0) + duration;
            activeProj.timerStartTime = null;
            await activeProj.save();
          }
        }
      }
      project.timerStartTime = timerStartTime;
    }

    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404).json({ message: "Project not found" });
  }
};

// @desc    Stop any active timer for the user
// @route   POST /api/projects/stop-active
// @access  Private
const stopActiveTimer = async (req: any, res: Response) => {
  try {
    const activeProject = await Project.findOne({
      user: req.user._id,
      timerStartTime: { $ne: null },
    });

    if (activeProject && activeProject.timerStartTime) {
      const now = new Date();
      const start = new Date(activeProject.timerStartTime);
      const duration = now.getTime() - start.getTime();

      activeProject.totalTimeSpent =
        (activeProject.totalTimeSpent || 0) + duration;
      activeProject.timerStartTime = null;
      await activeProject.save();

      res.json({ message: "Timer stopped and saved", project: activeProject });
    } else {
      res.json({ message: "No active timer found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error stopping timer" });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req: any, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (project && project.user.toString() === req.user._id.toString()) {
    // Delete all related trial tracking data
    await Trial.deleteMany({ project: project._id });

    // Delete the project
    await project.deleteOne();
    res.json({ message: "Project removed" });
  } else {
    res.status(404).json({ message: "Project not found" });
  }
};

export {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  stopActiveTimer,
};
