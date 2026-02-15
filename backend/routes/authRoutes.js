const express = require("express");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const sendEmail = require("../utils/email");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Must be true for sameSite: 'none'
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' for cross-site (Render -> Vercel)
    maxAge: 24 * 60 * 60 * 1000
  });
};

// Register student
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { institutionalId, name, email, password, course, phone } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { institutionalId }] });
    if (exists) {
      res.status(400);
      throw new Error("User with this email or institutional ID already exists");
    }

    const user = await User.create({
      institutionalId,
      name,
      email,
      password,
      course,
      phone,
      role: "student"
    });

    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      institutionalId: user.institutionalId,
      name: user.name,
      email: user.email,
      role: user.role,
      course: user.course,
      phone: user.phone
    });
  })
);

// Login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { institutionalId, password } = req.body;

    const user = await User.findOne({ institutionalId });
    if (!user) {
      res.status(401);
      throw new Error("Invalid institutional ID or password");
    }

    if (user.isBlocked) {
      res.status(403);
      throw new Error("Your account has been blocked. Please contact an admin.");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid institutional ID or password");
    }

    generateToken(res, user._id);

    res.json({
      _id: user._id,
      institutionalId: user.institutionalId,
      name: user.name,
      email: user.email,
      role: user.role,
      course: user.course,
      phone: user.phone
    });
  })
);

// Logout
router.post("/logout", (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out" });
});

// Get profile
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json(req.user);
  })
);

// Update profile
router.put(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const { name, course, phone } = req.body;
    if (name) user.name = name;
    if (course) user.course = course;
    if (phone) user.phone = phone;

    const updated = await user.save();
    res.json({
      _id: updated._id,
      institutionalId: updated.institutionalId,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      course: updated.course,
      phone: updated.phone
    });
  })
);

// Forgot password
router.post(
  "/forgot",
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("User with this email not found");
    }

    const token = user.generateResetToken();
    await user.save();

    const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset/${token}`;

    await sendEmail(
      user.email,
      "Book Bank - Password Reset",
      `<p>Hello ${user.name},</p>
       <p>You requested a password reset for your Book Bank account.</p>
       <p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 15 minutes.</p>`
    );

    res.json({ message: "Password reset link sent to your email" });
  })
);

// Reset password
router.post(
  "/reset/:token",
  asyncHandler(async (req, res) => {
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: req.params.token,
      resetExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired reset token");
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  })
);

// Submit ID Verification - for non-member students
router.post(
  "/submit-verification",
  upload.single("idPhoto"),
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!req.file) {
      res.status(400);
      throw new Error("ID photo is required");
    }

    // Update user with verification submission
    user.idPhotoPath = req.file.path;
    user.verificationStatus = "pending";
    await user.save();

    // Notify admin about pending verification
    await sendEmail(
      process.env.ADMIN_EMAIL || "admin@bookbank.local",
      "Book Bank - New ID Verification Pending",
      `<p>A new student has submitted their ID for verification.</p>
       <p><strong>Student Name:</strong> ${user.name}</p>
       <p><strong>Email:</strong> ${user.email}</p>
       <p><strong>Institutional ID:</strong> ${user.institutionalId}</p>
       <p>Please review and approve/reject this verification request in the admin panel.</p>`
    );

    res.json({
      message: "ID verification submitted successfully. Please wait for admin approval.",
      verificationStatus: user.verificationStatus
    });
  })
);

module.exports = router;
