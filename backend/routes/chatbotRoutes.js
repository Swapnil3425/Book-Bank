// backend/routes/chatbotRoutes.js
const express = require("express");
const asyncHandler = require("express-async-handler");
const { protect } = require("../middleware/auth");
const { generateGeminiText } = require("../utils/geminiClient");

const Book = require("../models/Book");
const Borrow = require("../models/Borrow");

const router = express.Router();

/**
 * PUBLIC CHATBOT (no login)
 * POST /api/chatbot/public
 */
router.post(
  "/public",
  asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400);
      throw new Error("Message is required");
    }

    const prompt = `
You are an assistant for a college Book Bank Management System called "IIITP BookBank".

The user might ask:
- What is BookBank?
- How to register or login?
- How borrowing works?
- What is due date / overdue?
- General doubts about the system.

Answer in a friendly, simple way. Do NOT make up system features that do not exist.
If question is outside books/library/college/portal context, politely say you focus on BookBank-related help.

User question: "${message}"
`;

    const reply = await generateGeminiText(prompt);
    res.json({ reply });
  })
);

/**
 * INTERNAL: build context for logged-in user
 */
async function buildContext(user, userMessage) {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const totalBooks = await Book.countDocuments();
  const totalBorrowed = await Borrow.countDocuments({
    status: { $in: ["borrowed", "overdue"] }
  });
  const totalOverdue = await Borrow.countDocuments({ status: "overdue" });

  const recentBooks = await Book.find({
    createdAt: { $gte: sevenDaysAgo }
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title author course genre");

  let roleContext = "";
  let userBorrowInfo = "";

  if (user.role === "student") {
    const myBorrows = await Borrow.find({ student: user._id }).populate(
      "book",
      "title author course"
    );

    const active = myBorrows.filter((b) => b.status === "borrowed").length;
    const overdue = myBorrows.filter((b) => b.status === "overdue").length;

    roleContext = `The user is a STUDENT in course "${user.course ||
      "N/A"}". They currently have ${active} active borrows and ${overdue} overdue items.`;

    userBorrowInfo = myBorrows
      .slice(0, 10)
      .map(
        (b) =>
          `- "${b.book?.title}" (status: ${b.status}, due: ${b.dueDate.toLocaleDateString("en-GB")})`
      )
      .join("\n");
  } else if (user.role === "admin") {
    roleContext = `The user is an ADMIN. They manage inventory and reports of the book bank.`;
  }

  const recentBooksText =
    recentBooks.length === 0
      ? "No new books were added in the last 7 days."
      : recentBooks
          .map(
            (b) =>
              `- "${b.title}" by ${b.author} [course: ${b.course ||
                "N/A"}, genre: ${b.genre || "N/A"}]`
          )
          .join("\n");

  return `
You are an AI assistant for a college book bank management system called "IIITP BookBank".
Always answer concisely and clearly. Use the context below.

USER DETAILS:
- Name: ${user.name}
- Institutional ID: ${user.institutionalId}
- Role: ${user.role}
- Course: ${user.course || "N/A"}

ROLE CONTEXT:
${roleContext}

GLOBAL STATS:
- Total books in inventory: ${totalBooks}
- Total books currently borrowed (including overdue): ${totalBorrowed}
- Total overdue items: ${totalOverdue}

RECENTLY ADDED BOOKS (last 7 days):
${recentBooksText}

${
  userBorrowInfo
    ? `STUDENT'S BORROW HISTORY (recent up to 10):\n${userBorrowInfo}\n`
    : ""
}

USER QUESTION:
"${userMessage}"

INSTRUCTIONS:
- If user asks "how many books are borrowed", use GLOBAL STATS or their personal stats.
- If user asks for recommendations, use RECENTLY ADDED BOOKS and their course info.
- Stay in the domain of library / book bank usage.
Now answer the user's question.`;
}

/**
 * LOGGED-IN CHATBOT (personalized)
 * POST /api/chatbot/message
 */
router.post(
  "/message",
  protect,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400);
      throw new Error("Message is required");
    }

    const prompt = await buildContext(user, message);
    const reply = await generateGeminiText(prompt);

    res.json({ reply });
  })
);

module.exports = router;
