import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

/* =========================================================
   EMAIL TEMPLATES
========================================================= */

const welcomeMessage = (name) => `
<h2>Welcome to XDRIVE Driving School, ${name}!</h2>
<p>Your account has been created successfully.</p>
<a href="${process.env.FRONTEND_URL}">Go to Dashboard</a>
`;

const forgotPasswordMessage = (resetUrl) => `
<h2>Password Reset Request</h2>
<p>Click the link below to reset your password (expires in 15 minutes):</p>
<a href="${resetUrl}">Reset Password</a>
`;

const resetSuccessMessage = (name) => `
<h2>Hello ${name},</h2>
<p>Your password has been reset successfully.</p>
<a href="${process.env.FRONTEND_URL}">Login Now</a>
`;

/* =========================================================
   REGISTER
========================================================= */

export const register = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.toString();
    const phone = req.body.phone?.trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, phone, password });

    await sendEmail(
      user.email,
      "Welcome to XDRIVE Driving School!",
      welcomeMessage(user.name)
    );

    res.status(201).json({
      message: "Registration successful",
      token: generateToken(user._id),
      role: user.role,
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   LOGIN
========================================================= */

export const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.toString();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      role: user.role,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   FORGOT PASSWORD
========================================================= */

export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    await sendEmail(
      user.email,
      "Password Reset Request",
      forgotPasswordMessage(resetUrl)
    );

    res.json({ message: "Password reset email sent" });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({ message: "Token, email, and password required" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Assign plain password → pre-save hook hashes automatically
    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    await sendEmail(
      user.email,
      "Password Reset Successful",
      resetSuccessMessage(user.name)
    );

    res.json({ message: "Password has been reset successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   AUTH STATUS
========================================================= */

export const authStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ loggedIn: false });
    }

    res.json({
      loggedIn: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
    });

  } catch (error) {
    res.json({ loggedIn: false });
  }
};