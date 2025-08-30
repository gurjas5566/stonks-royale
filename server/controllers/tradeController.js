// server/controllers/tradeController.js

const User = require("../models/user");
const Stock = require("../models/Stock");
const Transaction = require("../models/transaction");

exports.buyStock = async (req, res) => {
  const { userId, stockSymbol, shares } = req.body;
  const symbol = stockSymbol.toUpperCase();

  try {
    const user = await User.findById(userId);
    const stock = await Stock.findOne({ symbol });

    if (!user || !stock) {
      return res.status(404).json({ message: "User or stock not found" });
    }

    const totalCost = stock.currentPrice * shares;

    if (user.cash < totalCost) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    const stockIndex = user.portfolio.findIndex(
      (item) => item.stockSymbol === stockSymbol
    );
    let updatedUser;

    if (stockIndex > -1) {
      updatedUser = await User.findOneAndUpdate(
        { _id: userId, "portfolio.stockSymbol": stockSymbol },
        {
          $inc: { cash: -totalCost, "portfolio.$.shares": shares },
        },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { cash: -totalCost },
          $push: { portfolio: { stockSymbol, shares } },
        },
        { new: true }
      );
    }

    await Transaction.create({
      user: userId,
      stockSymbol,
      type: "buy",
      shares,
      price: stock.currentPrice,
    });

    res
      .status(200)
      .json({ message: "Stock purchased successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.sellStock = async (req, res) => {
  const { userId, stockSymbol, shares } = req.body;
  const symbol = stockSymbol.toUpperCase();

  try {
    const user = await User.findById(userId);
    const stock = await Stock.findOne({ symbol });

    if (!user || !stock) {
      return res.status(404).json({ message: "User or stock not found" });
    }

    const stockIndex = user.portfolio.findIndex(
      (item) => item.stockSymbol === stockSymbol
    );
    const ownedShares = user.portfolio[stockIndex]?.shares;

    if (stockIndex === -1 || ownedShares < shares) {
      return res.status(400).json({ message: "Insufficient shares to sell" });
    }

    const totalRevenue = stock.currentPrice * shares;

    let updatedUser;

    if (ownedShares - shares === 0) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { cash: totalRevenue },
          $pull: { portfolio: { stockSymbol: stockSymbol } },
        },
        { new: true }
      );
    } else {
      updatedUser = await User.findOneAndUpdate(
        { _id: userId, "portfolio.stockSymbol": stockSymbol },
        {
          $inc: { cash: totalRevenue, "portfolio.$.shares": -shares },
        },
        { new: true }
      );
    }

    await Transaction.create({
      user: userId,
      stockSymbol,
      type: "sell",
      shares,
      price: stock.currentPrice,
    });

    res
      .status(200)
      .json({ message: "Stock sold successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
