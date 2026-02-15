const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token =
    req.cookies.token ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1]);

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    // DEBUG LOGS
    console.log(`[Auth Middleware] User ID: ${decoded.id}`);
    console.log(`[Auth Middleware] Found User: ${req.user ? req.user.name : "null"}`);
    if (req.user) {
      console.log(`[Auth Middleware] User Role: '${req.user.role}' (Type: ${typeof req.user.role})`);
    }
    next();
  } catch (error) {
    console.error(`[Auth Middleware] Error: ${error.message}`);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

const adminOnly = (req, res, next) => {
  console.log(`[AdminOnly] Checking role for user: ${req.user ? req.user.name : "null"}`);
  if (req.user && req.user.role === "admin") {
    console.log("[AdminOnly] Access GRANTED");
    next();
  } else {
    console.log(`[AdminOnly] Access DENIED. Role is: ${req.user ? req.user.role : "undefined"}`);
    res.status(403);
    throw new Error("Admin access only");
  }
};

module.exports = { protect, adminOnly };
