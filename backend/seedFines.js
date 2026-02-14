require("dotenv").config();
const mongoose = require("mongoose");
const Borrow = require("./models/Borrow");

const seedFines = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/bookbankV3");
    console.log("Connected to DB");

    // Update ALL overdue borrows to have fines
    const overdue = await Borrow.find({ status: "overdue" });
    console.log(`Found ${overdue.length} overdue borrows`);
    
    for (const b of overdue) {
      const daysOverdue = Math.ceil((new Date() - b.dueDate) / (1000 * 60 * 60 * 24));
      const fineAmount = Math.max(50, daysOverdue * 5); // min 50, 5 per day
      b.fineAmount = fineAmount;
      await b.save();
      console.log(`✓ Set fine ${fineAmount} for overdue borrow (${daysOverdue} days late)`);
    }

    // Also add random fines to borrowed borrows for demo
    const borrowed = await Borrow.find({ status: "borrowed" }).limit(3);
    console.log(`\nFound ${borrowed.length} borrowed items to add demo fines`);
    
    for (const b of borrowed) {
      const demoFine = Math.floor(Math.random() * 80) + 20; // 20-100
      b.fineAmount = demoFine;
      await b.save();
      console.log(`✓ Added demo fine of ${demoFine}`);
    }

    console.log("\n✓ All fines seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

seedFines();
