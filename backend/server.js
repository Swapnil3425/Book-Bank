// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cron = require("node-cron");
const path = require("path");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes"); // 👈 NEW
const updateSystemState = require("./middleware/updateState");

const Borrow = require("./models/Borrow");
const sendEmail = require("./utils/email");

const app = express();
const PORT = process.env.PORT || 5000;

console.log("Connecting to DB:", process.env.MONGO_URI);
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Apply rate limiter to auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

app.use("/api/auth", authLimiter, authRoutes); // Apply limiter here
app.use("/api/books", bookRoutes);
app.use("/api/borrows", updateSystemState, borrowRoutes);
app.use("/api/admin", updateSystemState, adminRoutes);
app.use("/api/chatbot", chatbotRoutes); // 👈 NEW

// Production: serve frontend
if (process.env.NODE_ENV === "production") {
  const dir = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(dir));
  app.get("*", (req, res) => {
    res.sendFile(path.join(dir, "index.html"));
  });
}

// Error handlers
app.use(notFound);
app.use(errorHandler);

// CRON: overdue + reminder check (daily midnight)
const FINE_PER_DAY = process.env.FINE_PER_DAY || 50; // Fine amount per day overdue
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("[CRON] Running daily overdue and reminder check...");

    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    // Mark overdue + notify
    const toOverdue = await Borrow.find({
      status: "borrowed",
      dueDate: { $lt: now }
    }).populate("student book");

    for (const b of toOverdue) {
      // Calculate fine: days overdue * fine per day
      const daysOverdue = Math.ceil((now - b.dueDate) / (1000 * 60 * 60 * 24));
      b.fineAmount = Math.max(0, daysOverdue * FINE_PER_DAY);
      b.status = "overdue";
      await b.save();

      if (b.student?.email) {
        await sendEmail(
          b.student.email,
          "Book Bank - Book Overdue",
          `<p>Dear ${b.student.name},</p>
           <p>Your borrowed book <strong>${b.book.title}</strong> is now <strong>OVERDUE</strong>.</p>
           <p>Please return it as soon as possible to avoid penalties.</p>`
        );
      }
    }

    // Due-tomorrow reminders
    const dueSoon = await Borrow.find({
      status: "borrowed",
      dueDate: { $gte: now, $lt: tomorrow }
    }).populate("student book");

    for (const b of dueSoon) {
      if (b.student?.email) {
        await sendEmail(
          b.student.email,
          "Book Bank - Book Due Reminder",
          `<p>Dear ${b.student.name},</p>
           <p>Your borrowed book <strong>${b.book.title}</strong> is due soon on <strong>${b.dueDate.toLocaleDateString("en-GB")}</strong>.</p>
           <p>Please ensure it is returned on time.</p>`
        );
      }
    }
  } catch (err) {
    console.error("[CRON ERROR]", err.message);
  }
});

// CRON: 5 days before due date reminder (daily 09:00)
cron.schedule("0 9 * * *", async () => {
  try {
    console.log("[CRON] Checking for books due in 5 days...");

    const now = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(now.getDate() + 5);
    const fiveDaysFromNowEnd = new Date(fiveDaysFromNow);
    fiveDaysFromNowEnd.setHours(23, 59, 59, 999);

    // Find books due in 5 days
    const dueIn5Days = await Borrow.find({
      status: "borrowed",
      dueDate: { $gte: fiveDaysFromNow.setHours(0, 0, 0, 0), $lte: fiveDaysFromNowEnd }
    }).populate("student book");

    for (const b of dueIn5Days) {
      if (b.student?.email) {
        await sendEmail(
          b.student.email,
          "Book Bank - Book Due in 5 Days",
          `<p>Dear ${b.student.name},</p>
           <p>This is a friendly reminder that your borrowed book <strong>${b.book.title}</strong> is due in <strong>5 days</strong>.</p>
           <p><strong>Due Date:</strong> ${new Date(b.dueDate).toLocaleDateString("en-GB")}</p>
           <p>Please return it on time to avoid overdue penalties.</p>
           <p>Regards,<br/>Book Bank Administration</p>`
        );
      }
    }
  } catch (err) {
    console.error("[CRON ERROR - 5 days]", err.message);
  }
});

// CRON: 3 days before due date reminder (daily 10:00)
cron.schedule("0 10 * * *", async () => {
  try {
    console.log("[CRON] Checking for books due in 3 days...");

    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    const threeDaysFromNowEnd = new Date(threeDaysFromNow);
    threeDaysFromNowEnd.setHours(23, 59, 59, 999);

    // Find books due in 3 days
    const dueIn3Days = await Borrow.find({
      status: "borrowed",
      dueDate: { $gte: threeDaysFromNow.setHours(0, 0, 0, 0), $lte: threeDaysFromNowEnd }
    }).populate("student book");

    for (const b of dueIn3Days) {
      if (b.student?.email) {
        await sendEmail(
          b.student.email,
          "Book Bank - Book Due in 3 Days",
          `<p>Dear ${b.student.name},</p>
           <p>Your borrowed book <strong>${b.book.title}</strong> is due in <strong>3 days</strong>.</p>
           <p><strong>Due Date:</strong> ${new Date(b.dueDate).toLocaleDateString("en-GB")}</p>
           <p>Please make sure to return it on time.</p>
           <p>Regards,<br/>Book Bank Administration</p>`
        );
      }
    }
  } catch (err) {
    console.error("[CRON ERROR - 3 days]", err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
