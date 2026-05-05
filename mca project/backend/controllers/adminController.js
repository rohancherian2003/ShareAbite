const db = require("../config/db");
const { sendEmail } = require("../utils/emailer");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, email, role, approved, created_at 
      FROM users 
      WHERE role != 'admin'
      ORDER BY created_at DESC
    `);

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("UPDATE users SET approved = TRUE WHERE id = ?", [id]);

    const [users] = await db.query("SELECT email, name FROM users WHERE id = ?", [id]);
    if (users.length > 0) {
      await sendEmail(
        users[0].email,
        "Account Approved - ShareAbite",
        `Hello ${users[0].name},\n\nYour account has been approved by the admin. You can now log in and use the platform.\n\nThank you,\nShareAbite Team`,
      );
    }

    res.json({ message: "User approved successfully" });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, approved } = req.body;

    await db.query(
      'UPDATE users SET name = ?, email = ?, role = ?, approved = ? WHERE id = ? AND role != "admin"',
      [name, email, role, approved, id],
    );

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get system statistics
exports.getStats = async (req, res) => {
  try {
    const [donationCount] = await db.query(
      "SELECT COUNT(*) as count FROM donations",
    );
    const [donorCount] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "donor" AND approved = TRUE',
    );
    const [receiverCount] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "receiver" AND approved = TRUE',
    );
    const [pendingCount] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE approved = FALSE",
    );
    const [requestCount] = await db.query(
      "SELECT COUNT(*) as count FROM requests",
    );

    res.json({
      totalDonations: donationCount[0].count,
      activeDonors: donorCount[0].count,
      activeReceivers: receiverCount[0].count,
      pendingApprovals: pendingCount[0].count,
      totalRequests: requestCount[0].count,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query("SELECT email, name FROM users WHERE id = ?", [id]);

    await db.query('DELETE FROM users WHERE id = ? AND role != "admin"', [id]);

    if (users.length > 0) {
      await sendEmail(
        users[0].email,
        "Account Rejected - ShareAbite",
        `Hello ${users[0].name},\n\nWe regret to inform you that your account registration on ShareAbite has been reviewed and rejected by the admin.\n\nIf you believe this is a mistake, please contact our support team.\n\nThank you,\nShareAbite Team`,
      );
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const [restaurants] = await db.query(`
      SELECT r.*, u.name as owner_name, u.email as owner_email,
             COUNT(DISTINCT d.id) as total_donations,
             COUNT(DISTINCT CASE WHEN d.status = 'available' THEN d.id END) as active_donations
      FROM restaurants r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN donations d ON r.id = d.restaurant_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);

    res.json(restaurants);
  } catch (error) {
    console.error("Get restaurants error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, address, phone, email } = req.body;

    await db.query(
      "UPDATE restaurants SET name = ?, type = ?, address = ?, phone = ?, email = ? WHERE id = ?",
      [name, type, address, phone, email, id],
    );

    res.json({ message: "Restaurant updated successfully" });
  } catch (error) {
    console.error("Update restaurant error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM restaurants WHERE id = ?", [id]);

    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error("Delete restaurant error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get restaurant statistics
exports.getRestaurantStats = async (req, res) => {
  try {
    const { id } = req.params;

    const [donations] = await db.query(
      `
      SELECT d.*, 
             COUNT(r.id) as request_count,
             COUNT(CASE WHEN r.status = 'approved' THEN 1 END) as approved_count
      FROM donations d
      LEFT JOIN requests r ON d.id = r.donation_id
      WHERE d.restaurant_id = ?
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `,
      [id],
    );

    res.json(donations);
  } catch (error) {
    console.error("Get restaurant stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
