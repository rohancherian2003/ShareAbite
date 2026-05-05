const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user already exists
    const existing = await db.collection("users").where("email", "==", email).get();
    if (!existing.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Insert user
    const newUser = {
      name,
      email,
      password,
      role,
      approved: role === "admin" ? true : false,
      created_at: new Date().toISOString(),
    };
    const result = await db.collection("users").add(newUser);

    res.status(201).json({
      message: "User registered successfully",
      userId: result.id,
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

    const snapshot = await db.collection("users")
      .where("email", "==", email)
      .get();

    console.log("Users found:", snapshot.size);

    if (snapshot.empty) {
      return res.status(401).json({ message: "Email not found. Please check your email address." });
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    if (user.role !== role) {
      return res.status(401).json({ message: `Invalid role selected. You are registered as a ${user.role}.` });
    }

    console.log("User found:", { id: user.id, email: user.email, role: user.role, approved: user.approved });

    if (role !== "admin" && !user.approved) {
      return res.status(403).json({ message: "Account pending approval" });
    }

    console.log("Password match:", password === user.password);
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid password. Please check your password." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "24h" }
    );

    console.log("Login successful, token generated");

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.user.userId).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = doc.data();
    res.json({ id: doc.id, name: user.name, email: user.email, role: user.role, approved: user.approved });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
