import mongoose from "mongoose";

const timeLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" }, // Optional, can track time on project level
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number, default: 0 }, // In minutes or seconds
  },
  { timestamps: true }
);

export default mongoose.model("TimeLog", timeLogSchema);
