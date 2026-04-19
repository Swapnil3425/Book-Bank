// seedBorrows.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Book = require("./models/Book");
const Borrow = require("./models/Borrow");

const seedBorrows = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongoose");

    // We fetch a few students and a few books
    const students = await User.find({ institutionalId: /^11232/ }).limit(5);
    const books = await Book.find().limit(10);

    if (students.length === 0 || books.length === 0) {
      console.log("No dynamic students or books to borrow");
      process.exit(1);
    }

    const now = new Date();
    
    // Create an OVERDUE borrow (with pending fine)
    const issueDate1 = new Date();
    issueDate1.setDate(now.getDate() - 30);
    const dueDate1 = new Date(issueDate1);
    dueDate1.setDate(dueDate1.getDate() + 15);
    // Overdue by 15 days approx
    const fine1 = 15 * 5; // 5 rs per day
    
    await Borrow.create({
      student: students[0]._id,
      book: books[0]._id,
      issueDate: issueDate1,
      dueDate: dueDate1,
      status: "overdue",
      fineAmount: fine1,
      finePaid: false
    });

    // Create a RETURNED borrow (fine PAID)
    const issueDate2 = new Date();
    issueDate2.setDate(now.getDate() - 40);
    const dueDate2 = new Date(issueDate2);
    dueDate2.setDate(dueDate2.getDate() + 15);
    const returnDate2 = new Date();
    returnDate2.setDate(now.getDate() - 5);
    // Overdue by 20 days when returned
    const fine2 = 20 * 5;

    await Borrow.create({
      student: students[1]._id,
      book: books[1]._id,
      issueDate: issueDate2,
      dueDate: dueDate2,
      returnDate: returnDate2,
      status: "returned",
      fineAmount: fine2,
      finePaid: true,
      finePaidAt: returnDate2,
    });

    // Create an ACTIVE BORROW
    const issueDate3 = new Date();
    issueDate3.setDate(now.getDate() - 5);
    const dueDate3 = new Date(issueDate3);
    dueDate3.setDate(dueDate3.getDate() + 15);

    await Borrow.create({
      student: students[2]._id,
      book: books[2]._id,
      issueDate: issueDate3,
      dueDate: dueDate3,
      status: "borrowed",
      fineAmount: 0,
      finePaid: false
    });

    // Create an OVERDUE borrow (pending fine)
    const issueDate4 = new Date();
    issueDate4.setDate(now.getDate() - 20);
    const dueDate4 = new Date(issueDate4);
    dueDate4.setDate(dueDate4.getDate() + 15);
    const fine4 = 5 * 5;

    await Borrow.create({
      student: students[3]._id,
      book: books[3]._id,
      issueDate: issueDate4,
      dueDate: dueDate4,
      status: "overdue",
      fineAmount: fine4,
      finePaid: false
    });

    // Make sure availableCopies reflects 3 borrowed/overdue
    await Book.findByIdAndUpdate(books[0]._id, { $inc: { availableCopies: -1 } });
    await Book.findByIdAndUpdate(books[2]._id, { $inc: { availableCopies: -1 } });
    await Book.findByIdAndUpdate(books[3]._id, { $inc: { availableCopies: -1 } });

    console.log("Borrows and Fines synced.");
    process.exit(0);

  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}

seedBorrows();
