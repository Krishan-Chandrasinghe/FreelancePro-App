import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true }, // e.g., 'Software', 'Office', 'Travel'
    date: { type: Date, default: Date.now },
    description: { type: String },
    receipt: { type: String }, // URL to receipt image
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
