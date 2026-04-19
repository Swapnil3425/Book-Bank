// seedStudents.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seedStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Delete previous dummy STU2026% students
    await User.deleteMany({ institutionalId: /^STU20260/ });

    const IndianNames = [
      "Aarav Sharma", "Diya Patel", "Rohan Verma", "Ishita Nair", "Aditya Singh",
      "Kavya Desai", "Arjun Gupta", "Ananya Reddy", "Kabir Joshi", "Meera Iyer",
      "Vikram Malhotra", "Riya Kapoor", "Rahul Menon", "Neha Choudhury", "Aryan Das"
    ];

    const students = IndianNames.map((name, i) => {
      const parts = name.split(' ');
      const emailName = parts[0].toLowerCase();
      const id = 11232001 + i;
      return {
        institutionalId: id.toString(),
        name,
        email: `${id}@iiitp.ac.in`,
        password: "password123",
        role: "student",
        course: i % 2 === 0 ? "CSE" : "ECE",
        isVerified: true,
        verificationStatus: "approved"
      };
    });

    for (const student of students) {
      const exists = await User.findOne({ email: student.email });
      if (!exists) {
        await User.create(student);
      }
    }

    console.log("Deleted old dummy STU and inserted 15 realistic student records.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedStudents();
