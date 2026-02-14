const express = require("express");
const asyncHandler = require("express-async-handler");
const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const { protect, adminOnly } = require("../middleware/auth");
const sendEmail = require("../utils/email");

const router = express.Router();

// Get my borrows
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    const borrows = await Borrow.find({ student: req.user._id })
      .populate("book")
      .sort({ createdAt: -1 });
    res.json(borrows);
  })
);

// Get my fines summary (student)
router.get(
  "/fines/me",
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const totals = await Borrow.aggregate([
      { $match: { student: userId } },
      {
        $group: {
          _id: null,
          totalFines: { $sum: "$fineAmount" },
          pending: { $sum: { $cond: [{ $eq: ["$finePaid", false] }, "$fineAmount", 0] } },
          paid: { $sum: { $cond: [{ $eq: ["$finePaid", true] }, "$fineAmount", 0] } }
        }
      }
    ]);

    const fines = await Borrow.find({ student: userId, fineAmount: { $gt: 0 } })
      .populate("book")
      .sort({ createdAt: -1 });

    res.json({ totals: totals[0] || { totalFines: 0, pending: 0, paid: 0 }, fines });
  })
);

// Borrow a book
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { bookId, dueDate } = req.body;

    if (req.user.isBlocked) {
      res.status(403);
      throw new Error("Your account is blocked. You cannot borrow books.");
    }

    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      res.status(400);
      throw new Error("Book unavailable");
    }

    const borrow = await Borrow.create({
      student: req.user._id,
      book: bookId,
      dueDate
    });

    book.availableCopies -= 1;
    await book.save();

    res.status(201).json(await borrow.populate("book"));
  })
);

// Return a book
router.put(
  "/:id/return",
  protect,
  asyncHandler(async (req, res) => {
    const borrow = await Borrow.findById(req.params.id).populate("book");
    if (!borrow) {
      res.status(404);
      throw new Error("Borrow record not found");
    }
    if (
      borrow.student.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      throw new Error("Not authorized to update this borrow");
    }
    if (borrow.status === "returned") {
      res.status(400);
      throw new Error("Book already returned");
    }

    borrow.returnDate = new Date();
    if (borrow.returnDate > borrow.dueDate) {
      borrow.status = "overdue";
    } else {
      borrow.status = "returned";
    }
    await borrow.save();

    const book = await Book.findById(borrow.book._id);
    book.availableCopies += 1;
    await book.save();

    res.json(borrow);
  })
);

module.exports = router;
