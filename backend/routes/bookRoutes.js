// backend/routes/bookRoutes.js
const express = require("express");
const asyncHandler = require("express-async-handler");
const { protect, adminOnly } = require("../middleware/auth");
const Book = require("../models/Book");

const router = express.Router();

// PUBLIC /api/books?search=
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search } = req.query;
    const query = {};
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ title: regex }, { author: regex }, { isbn: regex }];
    }
    const books = await Book.find(query).sort({ title: 1 });
    res.json(books);
  })
);

// ADMIN create
router.post(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { title, author, course, genre, isbn, totalCopies } = req.body;
    if (!title || !author) {
      res.status(400);
      throw new Error("Title and author are required");
    }

    const total = Number(totalCopies) || 1;
    const book = await Book.create({
      title,
      author,
      course,
      genre,
      isbn,
      totalCopies: total,
      availableCopies: total
    });
    res.status(201).json(book);
  })
);

// ADMIN update
router.put(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }

    const prevTotal = book.totalCopies;
    const prevAvailable = book.availableCopies;
    const borrowed = prevTotal - prevAvailable;

    let newTotal = prevTotal;
    if (req.body.totalCopies !== undefined) {
      newTotal = Number(req.body.totalCopies);
      if (Number.isNaN(newTotal) || newTotal < 1) {
        res.status(400);
        throw new Error("Invalid total copies");
      }
      // cannot set total below already-borrowed count
      if (newTotal < borrowed) {
        res.status(400);
        throw new Error(
          `Total copies cannot be less than currently borrowed (${borrowed}).`
        );
      }

      if (newTotal > prevTotal) {
        const diff = newTotal - prevTotal;
        book.availableCopies = prevAvailable + diff; // increase numerator too
      } else if (newTotal < prevTotal) {
        // decrease available so borrowed remains same
        book.availableCopies = newTotal - borrowed;
      }
      book.totalCopies = newTotal;
    }

    if (req.body.title !== undefined) book.title = req.body.title;
    if (req.body.author !== undefined) book.author = req.body.author;
    if (req.body.course !== undefined) book.course = req.body.course;
    if (req.body.genre !== undefined) book.genre = req.body.genre;
    if (req.body.isbn !== undefined) book.isbn = req.body.isbn;

    const updated = await book.save();
    res.json(updated);
  })
);

// ADMIN delete
router.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }
    await book.deleteOne();
    res.json({ message: "Book removed" });
  })
);

module.exports = router;
