// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    institutionalId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    course: { type: String },
    phone: { type: String },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
    idPhotoPath: { type: String },
    verificationNotes: { type: String },
    resetToken: { type: String },
    resetExpires: { type: Date }
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate 6-digit OTP for password reset
userSchema.methods.generateResetToken = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetToken = otp; // For production, you could hash this, but for simple OTP we can store raw or hashed.
  this.resetExpires = Date.now() + 3 * 60 * 1000; // 3 mins
  return otp;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);
