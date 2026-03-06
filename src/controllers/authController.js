import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

/* =========================================================
   EMAIL TEMPLATES
========================================================= */

const welcomeMessage = (name) => `
<div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:30px;">
  <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

    <div style="background:#012169; color:white; padding:20px; text-align:center;">
      <h1 style="margin:0;">XDRIVE Driving School</h1>
      <p style="margin:5px 0 0;">Drive Smart. Drive Safe.</p>
    </div>

    <div style="padding:30px; color:#333;">
      <h2 style="color:#012169;">Welcome, ${name}!</h2>

      <p>
        Your account has been successfully created with 
        <strong>XDRIVE Driving School</strong>. 
        We are excited to have you begin your journey towards becoming a 
        confident and responsible driver.
      </p>

      <p>
        You can now access your dashboard to manage your bookings, 
        track lessons, and stay updated with your driving progress.
      </p>

      <div style="text-align:center; margin:30px 0;">
        <a href="${process.env.FRONTEND_URL}" 
        style="background:#C8102E; color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-weight:bold;">
        Go to Dashboard
        </a>
      </div>

      <p>
        If you have any questions, feel free to contact our support team.
        We wish you a safe and enjoyable driving experience!
      </p>

      <p style="margin-top:30px;">
        Warm regards,<br/>
        <strong>XDRIVE Driving School Team</strong>
      </p>
    </div>

    <div style="background:#012169; color:white; text-align:center; padding:12px; font-size:12px;">
      © ${new Date().getFullYear()} XDRIVE Driving School • All Rights Reserved
    </div>

  </div>
</div>
`;



const forgotPasswordMessage = (resetUrl) => `
<div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:30px;">
  <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

    <div style="background:#012169; color:white; padding:20px; text-align:center;">
      <h1 style="margin:0;">XDRIVE Driving School</h1>
    </div>

    <div style="padding:30px; color:#333;">
      <h2 style="color:#012169;">Password Reset Request</h2>

      <p>
        We received a request to reset your password for your 
        <strong>XDRIVE Driving School</strong> account.
      </p>

      <p>
        Click the button below to create a new password. 
        For security reasons, this link will expire in 
        <strong>15 minutes</strong>.
      </p>

      <div style="text-align:center; margin:30px 0;">
        <a href="${resetUrl}" 
        style="background:#C8102E; color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-weight:bold;">
        Reset Password
        </a>
      </div>

      <p>
        If you did not request this password reset, please ignore this email. 
        Your account will remain secure.
      </p>

      <p style="margin-top:30px;">
        Regards,<br/>
        <strong>XDRIVE Driving School Support Team</strong>
      </p>
    </div>

    <div style="background:#012169; color:white; text-align:center; padding:12px; font-size:12px;">
      © ${new Date().getFullYear()} XDRIVE Driving School • All Rights Reserved
    </div>

  </div>
</div>
`;



const resetSuccessMessage = (name) => `
<div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:30px;">
  <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

    <div style="background:#012169; color:white; padding:20px; text-align:center;">
      <h1 style="margin:0;">XDRIVE Driving School</h1>
    </div>

    <div style="padding:30px; color:#333;">
      <h2 style="color:#012169;">Hello ${name},</h2>

      <p>
        Your password has been successfully reset.
      </p>

      <p>
        You can now log in to your account using your new password 
        and continue managing your driving lessons.
      </p>

      <div style="text-align:center; margin:30px 0;">
        <a href="${process.env.FRONTEND_URL}" 
        style="background:#C8102E; color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-weight:bold;">
        Login to Your Account
        </a>
      </div>

      <p>
        If you did not perform this action, please contact our support team immediately.
      </p>

      <p style="margin-top:30px;">
        Best regards,<br/>
        <strong>XDRIVE Driving School Team</strong>
      </p>
    </div>

    <div style="background:#012169; color:white; text-align:center; padding:12px; font-size:12px;">
      © ${new Date().getFullYear()} XDRIVE Driving School • All Rights Reserved
    </div>

  </div>
</div>
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
/*
==================================================
LOGOUT USER
==================================================
*/
export const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User logged out successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message
    });
  }
};