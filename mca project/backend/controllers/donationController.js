const db = require("../config/db");

// Register restaurant
exports.registerRestaurant = async (req, res) => {
  try {
    const { name, type, address, phone, email } = req.body;
    const userId = req.user.userId;

    // Check if restaurant already registered
    const [existing] = await db.query(
      "SELECT * FROM restaurants WHERE user_id = ?",
      [userId],
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Restaurant already registered" });
    }

    const [result] = await db.query(
      "INSERT INTO restaurants (user_id, name, type, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, name, type, address, phone, email],
    );

    res.status(201).json({
      message: "Restaurant registered successfully",
      restaurantId: result.insertId,
    });
  } catch (error) {
    console.error("Register restaurant error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const { name, type, address, phone, email } = req.body;
    const userId = req.user.userId;

    await db.query(
      "UPDATE restaurants SET name = ?, type = ?, address = ?, phone = ?, email = ? WHERE user_id = ?",
      [name, type, address, phone, email, userId],
    );

    res.json({ message: "Restaurant updated successfully" });
  } catch (error) {
    console.error("Update restaurant error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get donor's restaurant
exports.getRestaurant = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [restaurants] = await db.query(
      "SELECT * FROM restaurants WHERE user_id = ?",
      [userId],
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurants[0]);
  } catch (error) {
    console.error("Get restaurant error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create donation
exports.createDonation = async (req, res) => {
  try {
    const { foodName, quantity, expiryTime, imageUrl } = req.body;
    const donorId = req.user.userId;

    // Get restaurant ID
    const [restaurants] = await db.query(
      "SELECT id FROM restaurants WHERE user_id = ?",
      [donorId],
    );
    if (restaurants.length === 0) {
      return res
        .status(400)
        .json({ message: "Please register your restaurant first" });
    }

    const restaurantId = restaurants[0].id;

    const [result] = await db.query(
      "INSERT INTO donations (donor_id, restaurant_id, food_name, quantity, expiry_time, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [donorId, restaurantId, foodName, quantity, expiryTime, imageUrl || null],
    );

    res.status(201).json({
      message: "Donation created successfully",
      donationId: result.insertId,
    });
  } catch (error) {
    console.error("Create donation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all donations (for receivers)
exports.getAllDonations = async (req, res) => {
  try {
    const [donations] = await db.query(`
      SELECT d.*, r.name as donor_name, r.address as location, r.phone as donor_phone
      FROM donations d
      JOIN restaurants r ON d.restaurant_id = r.id
      WHERE d.status = 'available'
      ORDER BY d.created_at DESC
    `);

    res.json(donations);
  } catch (error) {
    console.error("Get donations error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get donor's donations
exports.getDonorDonations = async (req, res) => {
  try {
    const donorId = req.user.userId;
    const [donations] = await db.query(
      `
      SELECT * FROM donations 
      WHERE donor_id = ? 
      ORDER BY created_at DESC
    `,
      [donorId],
    );

    res.json(donations);
  } catch (error) {
    console.error("Get donor donations error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get requests for donor's donations
exports.getDonationRequests = async (req, res) => {
  try {
    const donorId = req.user.userId;

    const [requests] = await db.query(
      `
      SELECT req.*, 
             d.food_name, d.quantity, d.expiry_time, d.status as donation_status,
             u.name as receiver_name, u.email as receiver_email,
             r.name as restaurant_name
      FROM requests req
      JOIN donations d ON req.donation_id = d.id
      JOIN users u ON req.receiver_id = u.id
      JOIN restaurants r ON d.restaurant_id = r.id
      WHERE d.donor_id = ?
      ORDER BY req.created_at DESC
    `,
      [donorId],
    );

    res.json(requests);
  } catch (error) {
    console.error("Get donation requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update donation
exports.updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { foodName, quantity, expiryTime, status } = req.body;
    const donorId = req.user.userId;

    await db.query(
      "UPDATE donations SET food_name = ?, quantity = ?, expiry_time = ?, status = ? WHERE id = ? AND donor_id = ?",
      [foodName, quantity, expiryTime, status, id, donorId],
    );

    res.json({ message: "Donation updated successfully" });
  } catch (error) {
    console.error("Update donation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete donation
exports.deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const donorId = req.user.userId;

    await db.query("DELETE FROM donations WHERE id = ? AND donor_id = ?", [
      id,
      donorId,
    ]);

    res.json({ message: "Donation deleted successfully" });
  } catch (error) {
    console.error("Delete donation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
