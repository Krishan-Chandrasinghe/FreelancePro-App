import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    companyName: { type: String },
    address: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    trialStartDate: { type: Date },
    trialEndDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
