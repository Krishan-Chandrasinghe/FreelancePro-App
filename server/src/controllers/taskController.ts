import { Request, Response } from "express";
import Task from "../models/Task";

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req: any, res: Response) => {
  const { project, title, description, status, dueDate } = req.body;

  const task = await Task.create({
    project,
    title,
    description,
    status,
    dueDate,
  });

  res.status(201).json(task);
};

// @desc    Get tasks (optionally filtered by project)
// @route   GET /api/tasks?projectId=...
// @access  Private
const getTasks = async (req: any, res: Response) => {
  const keyword = req.query.projectId ? { project: req.query.projectId } : {};
  // Note: Tasks don't maintain a direct user reference in my schema, doing a robust check would require populating project and checking user.
  // For simplicity, assuming if you have the ProjectID you can access tasks, but ideally we should verify ownership.
  // Let's populate project and filter.

  const tasks = await Task.find({ ...keyword }).populate("project");

  // Filter tasks where project.user == req.user._id
  const userTasks = tasks.filter(
    (task: any) =>
      task.project && task.project.user.toString() === req.user._id.toString()
  );

  res.json(userTasks);
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req: any, res: Response) => {
  const task = await Task.findById(req.params.id).populate("project");

  if (
    task &&
    (task.project as any).user.toString() === req.user._id.toString()
  ) {
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;
    task.dueDate = req.body.dueDate || task.dueDate;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req: any, res: Response) => {
  const task = await Task.findById(req.params.id).populate("project");

  if (
    task &&
    (task.project as any).user.toString() === req.user._id.toString()
  ) {
    await task.deleteOne();
    res.json({ message: "Task removed" });
  } else {
    res.status(404).json({ message: "Task not found" });
  }
};

export { createTask, getTasks, updateTask, deleteTask };
