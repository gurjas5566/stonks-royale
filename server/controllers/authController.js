// server/controllers/authController.js
const User = require("../models/user");
const Transaction = require("../models/transaction"); // Add this import
const jwt = require("jsonwebtoken");

// A function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      password,
    });

    if (user) {
      res.status(201).json({
        user: {
          _id: user._id,
          username: user.username,
          cash: user.cash,
          portfolio: user.portfolio || [],
        },
        message: "User registered successfully",
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).select("+password");

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        user: {
          // Changed: Return user object instead of individual fields
          _id: user._id,
          username: user.username,
          cash: user.cash,
          portfolio: user.portfolio || [],
        },
        message: "Login successful",
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile/:userId
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        cash: user.cash,
        portfolio: user.portfolio || [],
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get transaction history
// @route   GET /api/auth/transactions/:userId
// @access  Private
exports.getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.params.userId,
    }).sort({ timestamp: -1 });

    if (transactions && transactions.length > 0) {
      res.status(200).json(transactions);
    } else {
      res.status(200).json([]); // Return an empty array if no transactions are found
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
