// backend/routes/adminRoutes.js
const express = require("express");
const asyncHandler = require("express-async-handler");
const { protect, adminOnly } = require("../middleware/auth");
const User = require("../models/User");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const sendEmail = require("../utils/email");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

const router = express.Router();

// all admin routes protected
router.use(protect, adminOnly);

// GET /api/admin/stats
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const [totalUsers, totalBooks, totalBorrows, overdue] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Book.countDocuments(),
      Borrow.countDocuments(),
      Borrow.countDocuments({ status: "overdue" })
    ]);
    res.json({ totalUsers, totalBooks, totalBorrows, overdue });
  })
);

// GET /api/admin/borrows  (full list or filtered by query, newest first)
router.get(
  "/borrows",
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const borrows = await Borrow.find(query)
      .sort({ updatedAt: -1 })
      .limit(200)
      .populate("book")
      .populate("student", "name institutionalId email");
    res.json(borrows);
  })
);

// GET /api/admin/users
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const { verificationStatus } = req.query;
    const query = { role: "student" };

    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    const users = await User.find(query).sort({
      createdAt: -1
    });
    res.json(users);
  })
);

// GET /api/admin/users/:id/borrows
router.get(
  "/users/:id/borrows",
  asyncHandler(async (req, res) => {
    const borrows = await Borrow.find({ student: req.params.id })
      .sort({ issueDate: -1 })
      .populate("book", "title author course");
    res.json(borrows);
  })
);

// PATCH /api/admin/users/:id/block  (toggle)
router.patch(
  "/users/:id/block",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ isBlocked: user.isBlocked });
  })
);

// POST /api/admin/users/:id/notify-overdue
router.post(
  "/users/:id/notify-overdue",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const overdueBorrows = await Borrow.find({
      student: user._id,
      status: "overdue"
    }).populate("book", "title");

    if (overdueBorrows.length === 0) {
      res.status(400);
      throw new Error("No overdue books for this user.");
    }

    const list = overdueBorrows
      .map(
        (b) =>
          `• ${b.book.title} (due: ${b.dueDate.toLocaleDateString("en-GB")})`
      )
      .join("<br/>");

    const html = `<p>Dear ${user.name},</p>
      <p>You have the following overdue book(s) in the BookBank system:</p>
      <p>${list}</p>
      <p>Please return them as soon as possible.</p>`;

    if (user.email) {
      await sendEmail(user.email, "IIITP BookBank - Overdue Reminder", html);
    }

    res.json({ message: "Overdue reminder sent." });
  })
);

// CSV report: /api/admin/report/csv
router.get(
  "/report/csv",
  asyncHandler(async (req, res) => {
    const { student, book, dateFrom, dateTo } = req.query;
    const query = {};
    if (student) query.student = student;
    if (book) query.book = book;
    if (dateFrom || dateTo) {
      query.issueDate = {};
      if (dateFrom) query.issueDate.$gte = new Date(dateFrom);
      if (dateTo) query.issueDate.$lte = new Date(dateTo);
    }
    const borrows = await Borrow.find(query)
      .populate("book", "title author")
      .populate("student", "name institutionalId email");

    const rows = borrows.map((b) => ({
      studentName: b.student?.name,
      studentId: b.student?.institutionalId,
      studentEmail: b.student?.email,
      bookTitle: b.book?.title,
      bookAuthor: b.book?.author,
      issueDate: b.issueDate,
      dueDate: b.dueDate,
      returnDate: b.returnDate || "",
      status: b.status
    }));

    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("bookbank_report.csv");
    res.send(csv);
  })
);

// Inventory PDF: /api/admin/report/pdf
router.get(
  "/report/pdf",
  asyncHandler(async (req, res) => {
    const { student, book, dateFrom, dateTo } = req.query;
    let borrows = [];
    if (student || book || dateFrom || dateTo) {
      // Filtered PDF: show borrow records
      const query = {};
      if (student) query.student = student;
      if (book) query.book = book;
      if (dateFrom || dateTo) {
        query.issueDate = {};
        if (dateFrom) query.issueDate.$gte = new Date(dateFrom);
        if (dateTo) query.issueDate.$lte = new Date(dateTo);
      }
      borrows = await Borrow.find(query)
        .populate("book", "title author")
        .populate("student", "name institutionalId email");
    }
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bookbank_report.pdf"
    );
    doc.pipe(res);

    if (borrows.length > 0) {
      doc.fontSize(18).text("IIITP BookBank Borrowing Report", { align: "center" });
      doc.moveDown();
      borrows.forEach((b) => {
        doc.fontSize(12).text(
          `${b.student?.name} (${b.student?.institutionalId}) | ${b.book?.title} | Issue: ${b.issueDate?.toLocaleDateString("en-GB")} | Due: ${b.dueDate?.toLocaleDateString("en-GB")} | Status: ${b.status}`
        );
        doc.moveDown(0.5);
      });
    } else {
      // Default: inventory
      const books = await Book.find().sort({ title: 1 });
      doc.fontSize(18).text("IIITP BookBank Inventory Report", { align: "center" });
      doc.moveDown();
      books.forEach((b) => {
        doc
          .fontSize(12)
          .text(`${b.title} - ${b.author}`, { continued: true })
          .fontSize(10)
          .text(
            `  [${b.course || "General"}]  ${b.availableCopies}/${b.totalCopies} available`
          );
        doc.moveDown(0.5);
      });
    }
    doc.end();
  })
);

// POST /api/admin/borrows/:id/send-overdue-email
router.post(
  "/borrows/:id/send-overdue-email",
  asyncHandler(async (req, res) => {
    const borrow = await Borrow.findById(req.params.id)
      .populate("student")
      .populate("book");

    if (!borrow) {
      res.status(404);
      throw new Error("Borrow record not found");
    }

    if (borrow.status !== "overdue") {
      res.status(400);
      throw new Error("This book is not overdue");
    }

    await sendEmail(
      borrow.student.email,
      "IIITP BookBank - Overdue Book Reminder",
      `<p>Dear ${borrow.student.name},</p>
       <p>This is a reminder that your borrowed book <strong>${borrow.book.title}</strong> is <strong>OVERDUE</strong>.</p>
       <p><strong>Due Date:</strong> ${new Date(borrow.dueDate).toLocaleDateString("en-GB")}</p>
       <p>Please return it as soon as possible to avoid further penalties.</p>
       <p>Regards,<br/>Book Bank Administration</p>`
    );

    res.json({ message: "Email sent successfully" });
  })
);

// PATCH /api/admin/borrows/:id/confirm - Confirm pending borrow (change status to borrowed)
router.patch(
  "/borrows/:id/confirm",
  asyncHandler(async (req, res) => {
    const borrow = await Borrow.findById(req.params.id)
      .populate("student")
      .populate("book");

    if (!borrow) {
      res.status(404);
      throw new Error("Borrow record not found");
    }

    if (borrow.status !== "pending") {
      res.status(400);
      throw new Error("Only pending borrows can be confirmed");
    }

    // Update borrow status and issue date
    borrow.status = "borrowed";
    borrow.issueDate = new Date();
    await borrow.save();

    res.json({ message: "Borrow confirmed successfully", borrow });
  })
);

// PATCH /api/admin/users/:id/verify - Verify or reject ID verification
router.patch(
  "/users/:id/verify",
  asyncHandler(async (req, res) => {
    const { verificationStatus, verificationNotes } = req.body;

    if (!["approved", "rejected"].includes(verificationStatus)) {
      res.status(400);
      throw new Error("Invalid verification status");
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.verificationStatus = verificationStatus;
    user.verificationNotes = verificationNotes || "";
    if (verificationStatus === "approved") {
      user.isVerified = true;
    }
    await user.save();

    // Send email to user
    const subject = verificationStatus === "approved"
      ? "IIITP BookBank - ID Verification Approved"
      : "IIITP BookBank - ID Verification Rejected";

    const body = verificationStatus === "approved"
      ? `<p>Dear ${user.name},</p>
         <p>Your ID verification has been approved! You now have full access to the IIITP BookBank library.</p>
         <p>Happy reading!</p>`
      : `<p>Dear ${user.name},</p>
         <p>Unfortunately, your ID verification has been rejected.</p>
         <p><strong>Reason:</strong> ${verificationNotes}</p>
         <p>Please contact admin for more information.</p>`;

    await sendEmail(user.email, subject, body);

    res.json({
      message: `User ${verificationStatus} successfully`,
      verificationStatus: user.verificationStatus
    });
  })
);

// PATCH /api/admin/borrows/:id/return - Mark borrow as returned
router.patch(
  "/borrows/:id/return",
  asyncHandler(async (req, res) => {
    const borrow = await Borrow.findById(req.params.id)
      .populate("student")
      .populate("book");

    if (!borrow) {
      res.status(404);
      throw new Error("Borrow record not found");
    }

    // Update borrow status and return date
    borrow.status = "returned";
    borrow.returnDate = new Date();
    await borrow.save();

    // Increment available copies
    await Book.findByIdAndUpdate(borrow.book._id, {
      $inc: { availableCopies: 1 }
    });

    res.json({ message: "Book marked as returned successfully", borrow });
  })
);

// PATCH /api/admin/borrows/:id/cancel - Cancel a borrow request
router.patch(
  "/borrows/:id/cancel",
  asyncHandler(async (req, res) => {
    const { cancellationReason } = req.body;

    const borrow = await Borrow.findById(req.params.id)
      .populate("student")
      .populate("book");

    if (!borrow) {
      res.status(404);
      throw new Error("Borrow record not found");
    }

    if (borrow.status === "returned") {
      res.status(400);
      throw new Error("Cannot cancel a returned book");
    }

    // Store original status for later check
    const originalStatus = borrow.status;

    // Update borrow status
    borrow.status = "cancelled";
    borrow.cancellationReason = cancellationReason || "Cancelled by admin";
    await borrow.save();

    // Increment available copies if it was pending or borrowed
    if (originalStatus === "pending" || originalStatus === "borrowed") {
      await Book.findByIdAndUpdate(borrow.book._id, {
        $inc: { availableCopies: 1 }
      });
    }

    // Send email to student
    await sendEmail(
      borrow.student.email,
      "IIITP BookBank - Borrow Request Cancelled",
      `<p>Dear ${borrow.student.name},</p>
       <p>Your borrow request for <strong>${borrow.book.title}</strong> has been cancelled.</p>
       <p><strong>Reason:</strong> ${cancellationReason}</p>
       <p>Please contact admin if you have any questions.</p>`
    );

    res.json({ message: "Borrow cancelled successfully", borrow });
  })
);

// PATCH /api/admin/borrows/:id/reject - Reject a borrow request
router.patch(
  "/borrows/:id/reject",
  asyncHandler(async (req, res) => {
    const { rejectionReason } = req.body;

    const borrow = await Borrow.findById(req.params.id)
      .populate("student")
      .populate("book");

    if (!borrow) {
      res.status(404);
      throw new Error("Borrow record not found");
    }

    if (borrow.status === "returned") {
      res.status(400);
      throw new Error("Cannot reject a returned book");
    }

    // Store original status for later check
    const originalStatus = borrow.status;

    // Update borrow status
    borrow.status = "rejected";
    borrow.rejectionReason = rejectionReason || "Rejected by admin";
    await borrow.save();

    // Increment available copies if it was pending or borrowed
    if (originalStatus === "pending" || originalStatus === "borrowed") {
      await Book.findByIdAndUpdate(borrow.book._id, {
        $inc: { availableCopies: 1 }
      });
    }

    // Send email to student
    await sendEmail(
      borrow.student.email,
      "IIITP BookBank - Borrow Request Rejected",
      `<p>Dear ${borrow.student.name},</p>
       <p>Your borrow request for <strong>${borrow.book.title}</strong> has been rejected.</p>
       <p><strong>Reason:</strong> ${rejectionReason}</p>
       <p>Please contact admin if you have any questions.</p>`
    );

    res.json({ message: "Borrow rejected successfully", borrow });
  })
);

module.exports = router;

// Admin fines summary
// GET /api/admin/fines
router.get(
  "/fines",
  asyncHandler(async (req, res) => {
    // total fines (sum), pending (unpaid), received (paid)
    const totals = await Borrow.aggregate([
      {
        $group: {
          _id: null,
          totalFines: { $sum: "$fineAmount" },
          pendingFines: { $sum: { $cond: [{ $eq: ["$finePaid", false] }, "$fineAmount", 0] } },
          receivedFines: { $sum: { $cond: [{ $eq: ["$finePaid", true] }, "$fineAmount", 0] } }
        }
      }
    ]);

    const byStudent = await Borrow.aggregate([
      { $match: { fineAmount: { $gt: 0 } } },
      {
        $group: {
          _id: "$student",
          totalFines: { $sum: "$fineAmount" },
          pending: { $sum: { $cond: [{ $eq: ["$finePaid", false] }, "$fineAmount", 0] } },
          received: { $sum: { $cond: [{ $eq: ["$finePaid", true] }, "$fineAmount", 0] } }
        }
      },
      { $sort: { totalFines: -1 } }
    ]);

    // populate student info
    const students = await User.find({ _id: { $in: byStudent.map((b) => b._id) } }).select("name institutionalId");
    const byStudentPop = byStudent.map((b) => {
      const student = students.find((s) => s._id.equals(b._id));
      return { student, ...b };
    });

    res.json({ totals: totals[0] || { totalFines: 0, pendingFines: 0, receivedFines: 0 }, byStudent: byStudentPop });
  })
);

// Admin collect fine for a borrow
// PATCH /api/admin/borrows/:id/fine/collect
router.patch(
  "/borrows/:id/fine/collect",
  asyncHandler(async (req, res) => {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      res.status(404);
      throw new Error("Borrow not found");
    }
    if (borrow.fineAmount <= 0) {
      res.status(400);
      throw new Error("No fine due for this borrow");
    }
    borrow.finePaid = true;
    borrow.finePaidAt = new Date();
    borrow.fineCollectedBy = req.user._id;
    await borrow.save();
    res.json({ message: "Fine marked as collected", borrow });
  })
);

// Admin update fine amount for a borrow
// PATCH /api/admin/borrows/:id/fine/update
router.patch(
  "/borrows/:id/fine/update",
  asyncHandler(async (req, res) => {
    const { fineAmount } = req.body;
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      res.status(404);
      throw new Error("Borrow not found");
    }
    if (typeof fineAmount !== "number" || fineAmount < 0) {
      res.status(400);
      throw new Error("Fine amount must be a non-negative number");
    }
    borrow.fineAmount = fineAmount;
    await borrow.save();
    res.json({ message: "Fine amount updated", borrow });
  })
);

// SEED: Add dummy fines (for testing only)
// POST /api/admin/seed-fines
router.post(
  "/seed-fines",
  asyncHandler(async (req, res) => {
    // Find overdue borrows and assign fines
    const FINE_PER_DAY = process.env.FINE_PER_DAY || 5;
    const overdue = await Borrow.find({ status: "overdue", fineAmount: 0 });
    
    for (const b of overdue) {
      const daysOverdue = Math.ceil((new Date() - b.dueDate) / (1000 * 60 * 60 * 24));
      b.fineAmount = Math.max(10, daysOverdue * FINE_PER_DAY); // min 10 rupees
      await b.save();
    }

    // Also add some random fines to random borrows for demo
    const allBorrows = await Borrow.find().limit(5);
    for (const b of allBorrows) {
      if (!b.fineAmount) {
        b.fineAmount = Math.floor(Math.random() * 100) + 20; // 20-120
        await b.save();
      }
    }

    res.json({ message: "Dummy fines seeded", count: overdue.length + allBorrows.length });
  })
);
