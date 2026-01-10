import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/userRoutes";
import clientRoutes from "./routes/clientRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import timeLogRoutes from "./routes/timeLogRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import trialRoutes from "./routes/trialRoutes";

import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" })); // Increased limit for other potential big payloads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Serve static files
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/timelogs", timeLogRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/trials", trialRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// Database Connection
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/portfolio",
      { serverSelectionTimeoutMS: 5000 }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

// Start Server
const PORT_NUM = Number(process.env.PORT || 5000);
connectDB().then(() => {
  app.listen(PORT_NUM, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT_NUM} (0.0.0.0)`);
  });
});
