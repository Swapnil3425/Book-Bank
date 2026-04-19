const Borrow = require("../models/Borrow");

const updateSystemState = async (req, res, next) => {
  try {
    const FINE_PER_DAY = Number(process.env.FINE_PER_DAY) || 5;
    const now = new Date();

    // 1. Convert expired "borrowed" to "overdue" AND update existing "overdue" fines
    const needsUpdate = await Borrow.find({
      status: { $in: ["borrowed", "overdue"] },
      finePaid: false,
    });

    for (const b of needsUpdate) {
      let changed = false;

      // If borrowed and past due date -> make overdue
      if (b.status === "borrowed" && b.dueDate < now) {
        b.status = "overdue";
        changed = true;
      }

      // If overdue, update fine calculations based on elapsed days
      if (b.status === "overdue") {
        const daysOverdue = Math.ceil((now - b.dueDate) / (1000 * 60 * 60 * 24));
        const newFine = Math.max(0, daysOverdue * FINE_PER_DAY);
        if (b.fineAmount !== newFine) {
          b.fineAmount = newFine;
          changed = true;
        }
      }

      if (changed) {
        await b.save();
      }
    }
    next();
  } catch (error) {
    console.error("System Sync Error:", error);
    next();
  }
};

module.exports = updateSystemState;
