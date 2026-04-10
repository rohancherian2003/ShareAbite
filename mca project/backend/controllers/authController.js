const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user already exists
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Insert user with plain text password
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role, approved) VALUES (?, ?, ?, ?, ?)",
      [name, email, password, role, role === "admin" ? true : false],
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
      needsApproval: role !== "admin",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log("Login attempt:", { email, role, password: "***" });

    // Find user
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? AND role = ?",
      [email, role],
    );

    console.log("Users found:", users.length);

    if (users.length === 0) {
      console.log("No user found with email and role");
      return res.status(401).json({ message: "Email not found. Please check your email address." });
    }

    const user = users[0];
    console.log("User found:", {
      id: user.id,
      email: user.email,
      role: user.role,
      approved: user.approved,
    });

    // Check if approved (except for admin)
    if (role !== "admin" && !user.approved) {
      console.log("User not approved");
      return res.status(403).json({ message: "Account pending approval" });
    }

    // Verify password (plain text comparison)
    console.log("Password match:", password === user.password);

    if (password !== user.password) {
      console.log("Password mismatch");
      return res.status(401).json({ message: "Invalid password. Please check your password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "24h" },
    );

    console.log("Login successful, token generated");

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role, approved FROM users WHERE id = ?",
      [req.user.userId],
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(users[0]);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
