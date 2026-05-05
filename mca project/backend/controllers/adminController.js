const db = require("../config/db");
const { sendEmail } = require("../utils/emailer");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").where("role", "!=", "admin").get();
    const users = snapshot.docs.map((doc) => {
      const d = doc.data();
      return { id: doc.id, name: d.name, email: d.email, role: d.role, approved: d.approved, created_at: d.created_at };
    });
    users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    await db.collection("users").doc(id).update({ approved: true });

    const doc = await db.collection("users").doc(id).get();
    if (doc.exists) {
      const user = doc.data();
      await sendEmail(
        user.email,
        "Account Approved - ShareAbite",
        `Hello ${user.name},\n\nYour account has been approved by the admin. You can now log in and use the platform.\n\nThank you,\nShareAbite Team`
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

    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists || doc.data().role === "admin") {
      return res.status(403).json({ message: "Cannot update admin user" });
    }

    await db.collection("users").doc(id).update({ name, email, role, approved });
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get system statistics
exports.getStats = async (req, res) => {
  try {
    const [donationSnap, donorSnap, receiverSnap, pendingSnap, requestSnap] = await Promise.all([
      db.collection("donations").get(),
      db.collection("users").where("role", "==", "donor").where("approved", "==", true).get(),
      db.collection("users").where("role", "==", "receiver").where("approved", "==", true).get(),
      db.collection("users").where("approved", "==", false).get(),
      db.collection("requests").get(),
    ]);

    res.json({
      totalDonations: donationSnap.size,
      activeDonors: donorSnap.size,
      activeReceivers: receiverSnap.size,
      pendingApprovals: pendingSnap.size,
      totalRequests: requestSnap.size,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user (Reject)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists) return res.status(404).json({ message: "User not found" });
    const user = doc.data();
    if (user.role === "admin") return res.status(403).json({ message: "Cannot delete admin" });

    await db.collection("users").doc(id).delete();

    await sendEmail(
      user.email,
      "Account Rejected - ShareAbite",
      `Hello ${user.name},\n\nWe regret to inform you that your account registration on ShareAbite has been reviewed and rejected by the admin.\n\nIf you believe this is a mistake, please contact our support team.\n\nThank you,\nShareAbite Team`
    );

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restSnap = await db.collection("restaurants").get();
    const restaurants = await Promise.all(
      restSnap.docs.map(async (doc) => {
        const r = doc.data();
        const ownerDoc = r.user_id ? await db.collection("users").doc(r.user_id).get() : null;
        const owner = ownerDoc && ownerDoc.exists ? ownerDoc.data() : {};

        const donSnap = await db.collection("donations").where("restaurant_id", "==", doc.id).get();
        const total_donations = donSnap.size;
        const active_donations = donSnap.docs.filter((d) => d.data().status === "available").length;

        return {
          id: doc.id, ...r,
          owner_name: owner.name || "",
          owner_email: owner.email || "",
          total_donations,
          active_donations,
        };
      })
    );
    restaurants.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    await db.collection("restaurants").doc(id).update({ name, type, address, phone, email });
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
    await db.collection("restaurants").doc(id).delete();
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
    const donSnap = await db.collection("donations").where("restaurant_id", "==", id).get();

    const donations = await Promise.all(
      donSnap.docs.map(async (doc) => {
        const d = doc.data();
        const reqSnap = await db.collection("requests").where("donation_id", "==", doc.id).get();
        const request_count = reqSnap.size;
        const approved_count = reqSnap.docs.filter((r) => r.data().status === "approved").length;
        return { id: doc.id, ...d, request_count, approved_count };
      })
    );
    donations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(donations);
  } catch (error) {
    console.error("Get restaurant stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
