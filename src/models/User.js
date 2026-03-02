import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true 
    },
    phone: String,
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// ✅ Hash password whenever it is created OR modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12); // 12 is stronger than 10
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;


