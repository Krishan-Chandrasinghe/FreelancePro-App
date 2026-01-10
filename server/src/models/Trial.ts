import mongoose from "mongoose";

const trialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    date: { type: Date, default: Date.now },
    notes: { type: String },
    cost: { type: Number, default: 0 },
    isExtra: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Trial", trialSchema);
