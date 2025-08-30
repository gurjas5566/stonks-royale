const Stock = require("../models/Stock");

exports.getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find({});
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
