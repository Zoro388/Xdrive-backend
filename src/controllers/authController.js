import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
// import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";



import {
sendWelcomeEmail,
sendResetEmail
} from "../services/emailService.js";





// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import generateToken from "../utils/generateToken.js";
// import crypto from "crypto";
// import { sendWelcomeEmail, sendResetEmail } from "../services/emailService.js";

// import User from "../models/User.js";
// import crypto from "crypto";
// import generateToken from "../utils/generateToken.js";
// import { sendWelcomeEmail, sendResetEmail } from "../services/emailService.js";

/* ===============================
REGISTER USER
================================ */
export const register = async (req, res) => {
try {
const { name, email, password } = req.body;
if (!name || !email || !password)
return res.status(400).json({ success: false, message: "All fields required" });

const existingUser = await User.findOne({ email: email.toLowerCase() });
if (existingUser)
return res.status(400).json({ success: false, message: "User already exists" });

const user = await User.create({
name,
email: email.toLowerCase(),
password, // pre-save hook hashes automatically
});

try { await sendWelcomeEmail(user.email, user.name); } catch (err) { console.log("Email error:", err.message); }

const token = generateToken(user);

res.status(201).json({ success: true, message: "User registered", token, user });
} catch (error) {
console.log(error);
res.status(500).json({ success: false, message: error.message });
}
};

/* ===============================
LOGIN USER
================================ */
export const login = async (req, res) => {
try {
const { email, password } = req.body;
if (!email || !password)
return res.status(400).json({ success: false, message: "Email and password required" });

const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });

const isMatch = await user.matchPassword(password);
if (!isMatch) return res.status(400).json({ success: false, message: "Invalid email or password" });

const token = generateToken(user);
res.status(200).json({ success: true, message: "Login successful", token, user });
} catch (error) {
console.log(error);
res.status(500).json({ success: false, message: error.message });
}
};

/* ===============================
FORGOT PASSWORD
================================ */
export const forgotPassword = async (req, res) => {
try {
const { email } = req.body;
if (!email) return res.status(400).json({ success: false, message: "Email required" });

const user = await User.findOne({ email: email.toLowerCase() });
if (!user) return res.status(404).json({ success: false, message: "User not found" });

const resetToken = crypto.randomBytes(32).toString("hex");
const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

user.resetPasswordToken = hashedToken;
user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
await user.save({ validateBeforeSave: false });

await sendResetEmail(user.email, resetToken);

res.status(200).json({ success: true, message: "Reset email sent" });
} catch (error) {
console.log(error);
res.status(500).json({ success: false, message: error.message });
}
};

/* ===============================
RESET PASSWORD
================================ */
export const resetPassword = async (req, res) => {
try {
const { email, token, newPassword } = req.body;
if (!email || !token || !newPassword)
return res.status(400).json({ success: false, message: "Email, token, new password required" });

const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

const user = await User.findOne({
email: email.toLowerCase(),
resetPasswordToken: hashedToken,
resetPasswordExpire: { $gt: Date.now() },
}).select("+password");

if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });

user.password = newPassword; // pre-save hook will hash it
user.resetPasswordToken = undefined;
user.resetPasswordExpire = undefined;
await user.save();

res.status(200).json({ success: true, message: "Password reset successful" });
} catch (error) {
console.log(error);
res.status(500).json({ success: false, message: error.message });
}
};




/*
========================================
REGISTER USER
========================================
*/

// export const register = async (req, res) => {
// try {

// const { name, email, password } = req.body;

// if (!name || !email || !password) {
// return res.status(400).json({
// success: false,
// message: "All fields are required"
// });
// }

// const existingUser = await User.findOne({ email });

// if (existingUser) {
// return res.status(400).json({
// success: false,
// message: "User already exists"
// });
// }

// const hashedPassword = await bcrypt.hash(password, 10);

// const user = await User.create({
// name,
// email,
// password: hashedPassword
// });

// // Send Welcome Email
// try {
// await sendWelcomeEmail(user.email, user.name);
// } catch (emailError) {
// console.log("Welcome email failed:", emailError.message);
// }

// const token = generateToken(user);

// res.status(201).json({
// success: true,
// message: "User registered successfully",
// token,
// user
// });

// } catch (error) {

// res.status(500).json({
// success: false,
// message: error.message
// });
// }
// };



/*
========================================
LOGIN USER
========================================
*/

// export const login = async (req, res) => {
// try {
// const { email, password } = req.body;

// console.log("================================");
// console.log("LOGIN DEBUG START");
// console.log("Request Body:", req.body);
// console.log("Email:", email);
// console.log("Entered Password:", password);
// console.log("Type of Entered Password:", typeof password);
// console.log("================================");

// // Check email and password
// if (!email || !password) {
// console.log("Email or password missing");
// return res.status(400).json({
// success: false,
// message: "Email and password required",
// });
// }

// // Fetch user with password
// const user = await User.findOne({ email }).select("+password");

// console.log("User Found:", user);
// console.log("Password from DB:", user?.password);
// console.log("Type of DB Password:", typeof user?.password);

// if (!user) {
// console.log("User not found in database");
// return res.status(400).json({
// success: false,
// message: "Invalid email or password",
// });
// }

// if (!user.password) {
// console.log("Password not found in database");
// return res.status(400).json({
// success: false,
// message: "Password missing in database",
// });
// }

// console.log("Running bcrypt.compare...");

// const isMatch = await bcrypt.compare(password, user.password);

// console.log("Password Match Result:", isMatch);

// if (!isMatch) {
// console.log("Password does not match");
// return res.status(400).json({
// success: false,
// message: "Invalid email or password",
// });
// }

// const token = generateToken(user);

// console.log("Login successful, token generated");

// res.status(200).json({
// success: true,
// message: "Login successful",
// token,
// user,
// });

// } catch (error) {
// console.log("================================");
// console.log("LOGIN ERROR OCCURRED");
// console.log(error);
// console.log("================================");

// res.status(500).json({
// success: false,
// message: error.message,
// });
// }
// };




/*
========================================
CHECK EMAIL EXISTS
========================================
*/

export const checkEmailExists = async (req, res) => {
try {

const { email } = req.body;

if (!email) {
return res.status(400).json({
success: false,
message: "Email is required"
});
}

const user = await User.findOne({ email });

if (!user) {
return res.status(404).json({
success: false,
message: "User not found"
});
}

res.status(200).json({
success: true,
message: "Email exists"
});

} catch (error) {

res.status(500).json({
success: false,
message: error.message
});
}
};



/*
========================================
FORGOT PASSWORD
Generate Token and Send Email
========================================
*/
// export const forgotPassword = async (req, res) => {
// try {
// const { email } = req.body;

// if (!email) {
// return res.status(400).json({
// success: false,
// message: "Email is required",
// });
// }

// const user = await User.findOne({ email });

// if (!user) {
// return res.status(404).json({
// success: false,
// message: "User not found",
// });
// }

// const resetToken = crypto.randomBytes(32).toString("hex");

// const hashedToken = crypto
// .createHash("sha256")
// .update(resetToken)
// .digest("hex");

// user.resetPasswordToken = hashedToken;
// user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

// await user.save({ validateBeforeSave: false });

// await sendResetEmail(user.email, resetToken);

// res.status(200).json({
// success: true,
// message: "Reset email sent",
// });

// } catch (error) {
// res.status(500).json({
// success: false,
// message: error.message,
// });
// }
// };



/*
========================================
RESET PASSWORD
========================================
*/
// export const resetPassword = async (req, res) => {
// try {
// const { email, token, newPassword } = req.body;

// if (!email || !token || !newPassword) {
// return res.status(400).json({
// success: false,
// message: "Email, token and new password required",
// });
// }

// const hashedToken = crypto
// .createHash("sha256")
// .update(token)
// .digest("hex");

// const user = await User.findOne({
// email,
// resetPasswordToken: hashedToken,
// resetPasswordExpire: { $gt: Date.now() },
// }).select("+password");

// if (!user) {
// return res.status(400).json({
// success: false,
// message: "Invalid or expired token",
// });
// }

// // assign new password (model will hash it)
// user.password = newPassword;

// user.resetPasswordToken = undefined;
// user.resetPasswordExpire = undefined;

// await user.save();

// res.status(200).json({
// success: true,
// message: "Password reset successful",
// });

// } catch (error) {
// res.status(500).json({
// success: false,
// message: error.message,
// });
// }
// };


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