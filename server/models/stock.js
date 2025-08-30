const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  sector: {
    type: String,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  dailyChange: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("Stock", StockSchema);
