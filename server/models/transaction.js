const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // This creates a relationship with the User model
    required: true,
  },
  stockSymbol: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["buy", "sell"], // The transaction type can only be 'buy' or 'sell'
    required: true,
  },
  shares: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
