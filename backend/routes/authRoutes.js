// routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register Route
router.post("/register", async (req, res) => {
  console.log("Registration attempt:", req.body);
  const { username, email, password } = req.body;

  try {
    // Validate inputs
    if (!username || !email || !password) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      console.log("Password too short");
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    console.log("Checking for existing user...");
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log("User already exists");
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already in use" });
      }
      return res.status(400).json({ message: "Username already taken" });
    }

    console.log("Creating new user...");
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    console.log("User registered successfully");
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login Route (support username or email)
router.post("/login", async (req, res) => {
  console.log("Login attempt:", { loginInput: req.body.loginInput });
  const { loginInput, password } = req.body;

  try {
    // Validate inputs
    if (!loginInput || !password) {
      console.log("Missing login credentials");
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("Looking for user...");
    const user = await User.findOne({
      $or: [{ email: loginInput }, { username: loginInput }],
    });

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Verifying password...");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Login successful");
    const token = generateToken(user._id);
    res.json({ token, username: user.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get User Data Route (Protected)
router.get("/user", requireAuth, async (req, res) => {
  try {
    // User data is already attached to req.user by the requireAuth middleware
    // We exclude the password from the response
    const userData = {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email
    };

    res.json(userData);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;