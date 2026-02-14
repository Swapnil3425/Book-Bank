require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Book = require("./models/Book");
const Borrow = require("./models/Borrow");



(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to:", process.env.MONGO_URI);

    await Promise.all([User.deleteMany(), Book.deleteMany(), Borrow.deleteMany()]);

    const password = await bcrypt.hash("123456", 10);


    const users = await User.insertMany([
      {
        institutionalId: "ADMIN-001",
        name: "System Admin",
        email: "admin@bookbank.com",
        password,
        role: "admin"
      },
      {
        institutionalId: "11231001",
        name: "Aarav Sharma",
        email: "aarav.cse23@iiitp.ac.in",
        password,
        role: "student",
        course: "CSE",
        phone: "9876543210"
      },
      {
        institutionalId: "11231002",
        name: "Diya Patel",
        email: "diya.cse23@iiitp.ac.in",
        password,
        role: "student",
        course: "CSE",
        phone: "9988776655"
      },
      {
        institutionalId: "11231003",
        name: "Rohan Verma",
        email: "rohan.ece23@iiitp.ac.in",
        password,
        role: "student",
        course: "ECE",
        phone: "9123456789"
      },
      {
        institutionalId: "11231004",
        name: "Ishita Nair",
        email: "ishita.ece23@iiitp.ac.in",
        password,
        role: "student",
        course: "ECE",
        phone: "9012345678"
      }
    ]);

    console.log(`Inserted ${users.length} users`);

    const books = await Book.insertMany([
      {
        title: "Data Structures and Algorithms in C++",
        author: "Narasimha Karumanchi",
        course: "CSE",
        genre: "Algorithms",
        isbn: "9789385891741",
        totalCopies: 5,
        availableCopies: 3
      },
      {
        title: "Operating System Concepts",
        author: "Silberschatz, Galvin",
        course: "CSE",
        genre: "Operating Systems",
        isbn: "9781119456339",
        totalCopies: 4,
        availableCopies: 4
      },
      {
        title: "Digital Logic Design",
        author: "M. Morris Mano",
        course: "ECE",
        genre: "Digital Electronics",
        isbn: "9789332577726",
        totalCopies: 6,
        availableCopies: 5
      },
      {
        title: "Electronic Devices and Circuits",
        author: "Robert L. Boylestad",
        course: "ECE",
        genre: "Electronics",
        isbn: "9789332586063",
        totalCopies: 5,
        availableCopies: 2
      },
      {
        title: "Database System Concepts",
        author: "Abraham Silberschatz",
        course: "CSE",
        genre: "Database",
        isbn: "9780078022159",
        totalCopies: 5,
        availableCopies: 5
      }
    ]);

    console.log(`Inserted ${books.length} books`);

    const borrows = await Borrow.insertMany([
      {
        student: users[1]._id,
        book: books[0]._id,
        issueDate: new Date("2025-11-10"),
        dueDate: new Date("2025-11-24"),
        status: "borrowed"
      },
      {
        student: users[2]._id,
        book: books[1]._id,
        issueDate: new Date("2025-10-15"),
        dueDate: new Date("2025-10-29"),
        returnDate: new Date("2025-10-28"),
        status: "returned"
      },
      {
        student: users[3]._id,
        book: books[2]._id,
        issueDate: new Date("2025-10-20"),
        dueDate: new Date("2025-10-30"),
        status: "overdue"
      },
      {
        student: users[4]._id,
        book: books[3]._id,
        issueDate: new Date("2025-11-05"),
        dueDate: new Date("2025-11-19"),
        status: "borrowed"
      }
    ]);

    console.log(`Inserted ${borrows.length} borrow records`);
    console.log("✅ Dummy data added successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
