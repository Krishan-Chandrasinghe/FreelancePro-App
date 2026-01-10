import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: [
        "Not Started",
        "In Progress",
        "Completed",
        "On Hold",
        "Pending",
        "Paused",
      ],
      default: "Not Started",
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    budget: { type: Number },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    totalTimeSpent: { type: Number, default: 0 }, // In milliseconds
    timerStartTime: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
