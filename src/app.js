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
// import emailRoutes from "./routes/emailRoutes.js"
import landingMediaRoutes from "./routes/landingMediaRoutes.js";

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
  "https://xandersdrive.netlify.app",
  "https://xdrive.org.uk",
  process.env.FRONTEND_URL, // your deployed frontend
];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       } else {
//         console.log("Blocked by CORS:", origin);
//         return callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowed = allowedOrigins.some((allowedOrigin) =>
        origin.startsWith(allowedOrigin)
      );

      if (allowed) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
// =======================
// Middlewares
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
// =======================
// Routes
// =======================
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student/bookings", studentBookingRoutes);
app.use("/api/admin/availability", adminAvailabilityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", contactRoutes);
app.use("/api/payment", paymentRoutes);
// app.use("/api/email", emailRoutes);
app.use("/api/landing-media", landingMediaRoutes);





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