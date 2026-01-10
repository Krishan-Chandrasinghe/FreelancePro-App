import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    invoiceNumber: { type: String, required: true, unique: true },
    date: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    freelancerDetails: {
      name: String,
      email: String,
      address: String,
      phone: String,
      profilePicture: String,
    },
    clientDetails: {
      name: String,
      email: String,
      address: String,
      phone: String,
    },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    notes: { type: String },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Complete", "Not Paid"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
