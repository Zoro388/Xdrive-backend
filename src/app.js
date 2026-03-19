import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentBookingRoutes from "./routes/studentBookingRoutes.js";
import adminAvailabilityRoutes from "./routes/adminAvailabilityRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js"

dotenv.config();

const app = express();

// connect database
connectDB();


// CORS Setup
// =======================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://agent-69bb0b83e29a72b3037d5ab4--x-drive.netlify.app",
  process.env.FRONTEND_URL, // your deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
// =======================
// Middlewares
// =======================
app.use(express.json());

// =======================
// Routes
// =======================
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student/bookings", studentBookingRoutes);
app.use("/api/admin/availability", adminAvailabilityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", contactRoutes);
app.use("/api/payment", paymentRoutes)


/* 🔥 ADD DEBUG ROUTE HERE */
app.get("/test-email", async (req, res) => {
  try {
    await sendEmail(
      "yourrealemail@gmail.com",
      "Test Email",
      "<h1>Email Working!</h1>"
    );
    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Test email error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// Health Check
// =======================
app.get("/", (req, res) => {
  res.json({ message: "XDrive API running" });
});

export default app;