const express = require("express");
const mongoose = require("mongoose");
const { resolve } = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();
const app = express();
const port = 3010;


// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static("static"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create User Model
const User = mongoose.model("User", UserSchema);

// Register Route
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if all fields are filled
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create New User
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Serve HTML page
app.get("/", (req, res) => {
  res.sendFile(resolve(__dirname, "pages/index.html"));
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
