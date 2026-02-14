const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    returnDate: {
      type: Date
    },
    // Fine information
    fineAmount: {
      type: Number,
      default: 0
    },
    finePaid: {
      type: Boolean,
      default: false
    },
    finePaidAt: {
      type: Date
    },
    fineCollectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ["pending", "borrowed", "returned", "overdue", "cancelled", "rejected"],
      default: "pending"
    },
    cancellationReason: {
      type: String
    },
    rejectionReason: {
      type: String
    }
  },
  { timestamps: true }
);

const Borrow = mongoose.model("Borrow", borrowSchema);

module.exports = Borrow;
