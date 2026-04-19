// seedBooks.js
require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("./models/Book");

const seedBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const booksToInsert = [
      // CSE Books
      { title: "Introduction to Algorithms", author: "Thomas H. Cormen", course: "CSE", genre: "Algorithms", isbn: "9780262033848", totalCopies: 5, availableCopies: 5 },
      { title: "Design Patterns", author: "Erich Gamma", course: "CSE", genre: "Software Engineering", isbn: "9780201633610", totalCopies: 4, availableCopies: 4 },
      { title: "Clean Code", author: "Robert C. Martin", course: "CSE", genre: "Software Engineering", isbn: "9780132350884", totalCopies: 6, availableCopies: 6 },
      { title: "Computer Networking", author: "James Kurose", course: "CSE", genre: "Networking", isbn: "9780133594140", totalCopies: 7, availableCopies: 7 },
      { title: "Database Management Systems", author: "Raghu Ramakrishnan", course: "CSE", genre: "Databases", isbn: "9780072465631", totalCopies: 5, availableCopies: 5 },
      { title: "Operating System Concepts", author: "Abraham Silberschatz", course: "CSE", genre: "Operating Systems", isbn: "9781118063330", totalCopies: 3, availableCopies: 3 },
      { title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", course: "CSE", genre: "AI", isbn: "9780136042594", totalCopies: 4, availableCopies: 4 },
      { title: "Compilers: Principles, Techniques, and Tools", author: "Alfred V. Aho", course: "CSE", genre: "Compilers", isbn: "9780201100884", totalCopies: 2, availableCopies: 2 },
      { title: "The C Programming Language", author: "Brian W. Kernighan", course: "CSE", genre: "Programming", isbn: "9780131103627", totalCopies: 10, availableCopies: 10 },
      { title: "Introduction to the Theory of Computation", author: "Michael Sipser", course: "CSE", genre: "Theory", isbn: "9781133187790", totalCopies: 3, availableCopies: 3 },

      // ECE Books
      { title: "Microelectronic Circuits", author: "Adel S. Sedra", course: "ECE", genre: "Electronics", isbn: "9780199339136", totalCopies: 5, availableCopies: 5 },
      { title: "Digital Design", author: "M. Morris Mano", course: "ECE", genre: "Digital Electronics", isbn: "9780132774208", totalCopies: 6, availableCopies: 6 },
      { title: "Signals and Systems", author: "Alan V. Oppenheim", course: "ECE", genre: "Signals", isbn: "9780138147570", totalCopies: 4, availableCopies: 4 },
      { title: "Fundamentals of Electric Circuits", author: "Charles K. Alexander", course: "ECE", genre: "Circuits", isbn: "9780073380575", totalCopies: 8, availableCopies: 8 },
      { title: "Digital Signal Processing", author: "John G. Proakis", course: "ECE", genre: "DSP", isbn: "9780131873742", totalCopies: 4, availableCopies: 4 },
      { title: "Control Systems Engineering", author: "Norman S. Nise", course: "ECE", genre: "Control Systems", isbn: "9781118170519", totalCopies: 3, availableCopies: 3 },
      { title: "Communication Systems", author: "Simon Haykin", course: "ECE", genre: "Communications", isbn: "9780471697909", totalCopies: 5, availableCopies: 5 },
      { title: "Antenna Theory", author: "Constantine A. Balanis", course: "ECE", genre: "Electromagnetics", isbn: "9781118642061", totalCopies: 2, availableCopies: 2 },
      { title: "Linear Integrated Circuits", author: "D. Roy Choudhury", course: "ECE", genre: "Electronics", isbn: "9788122414707", totalCopies: 6, availableCopies: 6 },
      { title: "Semiconductor Physics and Devices", author: "Donald A. Neamen", course: "ECE", genre: "Semiconductors", isbn: "9780073529585", totalCopies: 3, availableCopies: 3 }
    ];

    await Book.insertMany(booksToInsert);
    console.log("Inserted 20 books for CSE and ECE.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedBooks();
