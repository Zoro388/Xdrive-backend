import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentBookingRoutes from "./routes/studentBookingRoutes.js";
import adminAvailabilityRoutes from "./routes/adminAvailabilityRoutes.js";

dotenv.config();

const app = express();

// connect database
connectDB();

// CORS setup
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL]
    : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// middlewares
app.use(express.json());
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student/bookings", studentBookingRoutes);
app.use("/api/admin/availability", adminAvailabilityRoutes);

// health check
app.get("/", (req, res) => {
  res.json({ message: "XDrive API running" });
});

// AUTH ROUTES
app.use("/api/auth", authRoutes);

export default app;