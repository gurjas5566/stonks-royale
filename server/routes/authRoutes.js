const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getTransactionHistory,
} = require("../controllers/authController");

router.post("/register", registerUser); // .post() method is for handling POST requests
router.post("/login", loginUser);
router.get("/profile/:userId", getUserProfile);
router.get("/history/:userId", getTransactionHistory);
module.exports = router;
