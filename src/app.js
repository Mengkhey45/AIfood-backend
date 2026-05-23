import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import corsOptions from "./config/corsOptions.js";

import orderRoutes from "./routes/orderRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import telegramRoutes from "./routes/telegramRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";
import { startDailyReportJob } from "./jobs/dailyReportJob.js";

dotenv.config();

const app = express();

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

// Start cron jobs
startDailyReportJob();

// Routes
app.use("/api/orders", orderRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/notifications", notificationsRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("AI Food Order System API is running 🚀");
});

app.use((error, req, res, next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      error: "Request body is too large. Please upload a smaller image.",
    });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON payload.",
    });
  }

  next(error);
});

export default app;