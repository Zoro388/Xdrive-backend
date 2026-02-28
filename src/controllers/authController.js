import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

// =======================
// EMAIL TEMPLATES
// =======================
const welcomeMessage = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Welcome to XDRIVE</title>
</head>
<body style="margin:0; font-family: Arial, sans-serif; background-color:#FFFFFF;">
  <div style="max-width:600px; margin: 0 auto; border:1px solid #ccc; border-radius:8px; overflow:hidden;">
    <div style="background-color:#00247D; color:#FFFFFF; padding:20px; text-align:center;">
      <h1 style="margin:0;">XDRIVE Driving School</h1>
    </div>
    <div style="padding:30px; color:#333333;">
      <h2 style="color:#CF142B;">Welcome, ${name}!</h2>
      <p>We are excited to have you join <strong>XDRIVE Driving School</strong>. Here’s what you can do next:</p>
      <ul>
        <li>Login to your dashboard and complete your profile.</li>
        <li>Browse our courses and schedules.</li>
        <li>Contact support if needed.</li>
      </ul>
      <p style="text-align:center; margin:40px 0;">
        <a href="${process.env.FRONTEND_URL}" 
           style="display:inline-block; padding:12px 25px; background-color:#CF142B; color:#FFFFFF; text-decoration:none; font-weight:bold; border-radius:5px;">
           Visit Your Dashboard
        </a>
      </p>
    </div>
    <div style="background-color:#00247D; color:#FFFFFF; padding:15px; text-align:center; font-size:12px;">
      &copy; ${new Date().getFullYear()} XDRIVE Driving School. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const forgotPasswordMessage = (resetUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Password Reset Request</title>
</head>
<body style="margin:0; font-family: Arial, sans-serif; background-color:#FFFFFF;">
  <div style="max-width:600px; margin:0 auto; border:1px solid #ccc; border-radius:8px; overflow:hidden;">
    <div style="background-color:#00247D; color:#FFFFFF; padding:20px; text-align:center;">
      <h1 style="margin:0;">XDRIVE Driving School</h1>
    </div>
    <div style="padding:30px; color:#333333;">
      <h2 style="color:#CF142B;">Password Reset Request</h2>
      <p>You recently requested to reset your password. Click the button below to proceed. This link will expire in <strong>15 minutes</strong>.</p>
      <p style="text-align:center; margin:40px 0;">
        <a href="${resetUrl}" 
           style="display:inline-block; padding:12px 25px; background-color:#CF142B; color:#FFFFFF; text-decoration:none; font-weight:bold; border-radius:5px;">
           Reset Password
        </a>
      </p>
      <p>If you did not request a password reset, please ignore this email.</p>
    </div>
    <div style="background-color:#00247D; color:#FFFFFF; padding:15px; text-align:center; font-size:12px;">
      &copy; ${new Date().getFullYear()} XDRIVE Driving School. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const resetSuccessMessage = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Password Reset Successful</title>
</head>
<body style="margin:0; font-family: Arial, sans-serif; background-color:#FFFFFF;">
  <div style="max-width:600px; margin:0 auto; border:1px solid #ccc; border-radius:8px; overflow:hidden;">
    <div style="background-color:#00247D; color:#FFFFFF; padding:20px; text-align:center;">
      <h1 style="margin:0;">XDRIVE Driving School</h1>
    </div>
    <div style="padding:30px; color:#333333;">
      <h2 style="color:#CF142B;">Hello ${name},</h2>
      <p>Your password has been reset successfully. You can now login to your account using your new password.</p>
      <p style="text-align:center; margin:40px 0;">
        <a href="${process.env.FRONTEND_URL}" 
           style="display:inline-block; padding:12px 25px; background-color:#CF142B; color:#FFFFFF; text-decoration:none; font-weight:bold; border-radius:5px;">
           Login Now
        </a>
      </p>
      <p>If you did not perform this action, please contact support immediately.</p>
    </div>
    <div style="background-color:#00247D; color:#FFFFFF; padding:15px; text-align:center; font-size:12px;">
      &copy; ${new Date().getFullYear()} XDRIVE Driving School. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

// =======================
// REGISTER
// =======================
export const register = async (req, res) => {
  try {
    const name = req.body.name?.toString().trim();
    const email = req.body.email?.toString().trim().toLowerCase();
    const password = req.body.password?.toString();
    const phone = req.body.phone?.toString();

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email, and password are required" });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, phone, password });

    await sendEmail(user.email, "Welcome to XDRIVE Driving School!", welcomeMessage(name));

    res.status(201).json({
      message: "Registration successful",
      name,
      email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// LOGIN
// =======================
export const login = async (req, res) => {
  try {
    const email = req.body.email?.toString().trim();
    const password = req.body.password?.toString();

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: new RegExp(`^${email}$`, "i") });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

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

// =======================
// FORGOT PASSWORD
// =======================
export const forgotPassword = async (req, res) => {
  const email = req.body.email?.toString().trim();
  try {
    const user = await User.findOne({ email: new RegExp(`^${email}$`, "i") });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
    await sendEmail(user.email, "Password Reset Request", forgotPasswordMessage(resetUrl));

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// RESET PASSWORD
// =======================
export const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password)
    return res.status(400).json({ message: "Token, email, and password required" });

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email: new RegExp(`^${email.trim()}$`, "i"),
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password.toString(), salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    await sendEmail(user.email, "Password Reset Successful", resetSuccessMessage(user.name));

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};