import { Request, Response } from "express";
import TimeLog from "../models/TimeLog";

const logTime = async (req: any, res: Response) => {
  const { project, task, description, startTime, endTime } = req.body;

  // Calculate duration
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const duration = (end - start) / 1000 / 60; // minutes

  const timeLog = await TimeLog.create({
    user: req.user._id,
    project,
    task,
    description,
    startTime,
    endTime,
    duration,
  });

  res.status(201).json(timeLog);
};

const getTimeLogs = async (req: any, res: Response) => {
  const logs = await TimeLog.find({ user: req.user._id })
    .populate("project", "name")
    .populate("task", "title")
    .sort({ startTime: -1 });
  res.json(logs);
};

export { logTime, getTimeLogs };
