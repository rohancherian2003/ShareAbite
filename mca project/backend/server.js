const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://share-abite.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Root endpoint
app.get("/", (req, res) => {
  res.send("Food Waste Reduction Platform API is running");
});

// Test endpoint to check admin user
app.get("/api/test/admin", async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role, approved FROM users WHERE email = ?",
      ["admin@foodwaste.com"],
    );
    res.json({
      found: users.length > 0,
      user: users[0] || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for email
app.get("/api/test/email/:email", async (req, res) => {
  try {
    const { sendEmail } = require("./utils/emailer");
    const info = await sendEmail(req.params.email, "Test Email from Render", "This is a test email to verify SMTP configuration.");
    
    if (!process.env.SMTP_HOST) {
      res.json({ success: true, message: "Email sent using fallback Ethereal test account (Check Render Environment Variables!).", info });
    } else {
      res.json({ success: true, message: "Email successfully sent using Gmail SMTP!", info });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
