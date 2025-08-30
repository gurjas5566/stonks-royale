const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: false,
  },
  cash: {
    type: Number,
    required: true,
    default: 10000,
  },
  portfolio: [
    {
      stockSymbol: {
        type: String,
        required: true,
      },
      shares: {
        type: Number,
        required: true,
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  // Check if the password has been modified
  if (!this.isModified("password")) {
    next();
  }
  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10); //A string added to password before hashing it.
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords for login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
