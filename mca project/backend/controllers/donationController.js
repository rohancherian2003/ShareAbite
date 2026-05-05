const db = require("../config/db");

// Register restaurant
exports.registerRestaurant = async (req, res) => {
  try {
    const { name, type, address, phone, email } = req.body;
    const userId = req.user.userId;

    const existing = await db.collection("restaurants").where("user_id", "==", userId).get();
    if (!existing.empty) {
      return res.status(400).json({ message: "Restaurant already registered" });
    }

    const result = await db.collection("restaurants").add({
      user_id: userId, name, type, address, phone, email,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ message: "Restaurant registered successfully", restaurantId: result.id });
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

    const snap = await db.collection("restaurants").where("user_id", "==", userId).get();
    if (snap.empty) return res.status(404).json({ message: "Restaurant not found" });

    await db.collection("restaurants").doc(snap.docs[0].id).update({ name, type, address, phone, email });
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
    const snap = await db.collection("restaurants").where("user_id", "==", userId).get();
    if (snap.empty) return res.status(404).json({ message: "Restaurant not found" });

    const doc = snap.docs[0];
    res.json({ id: doc.id, ...doc.data() });
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

    const restSnap = await db.collection("restaurants").where("user_id", "==", donorId).get();
    if (restSnap.empty) {
      return res.status(400).json({ message: "Please register your restaurant first" });
    }
    const restaurantId = restSnap.docs[0].id;

    const result = await db.collection("donations").add({
      donor_id: donorId,
      restaurant_id: restaurantId,
      food_name: foodName,
      quantity,
      expiry_time: expiryTime,
      image_url: imageUrl || null,
      status: "available",
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ message: "Donation created successfully", donationId: result.id });
  } catch (error) {
    console.error("Create donation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all donations (for receivers)
exports.getAllDonations = async (req, res) => {
  try {
    const snap = await db.collection("donations").where("status", "==", "available").get();

    const donations = await Promise.all(
      snap.docs.map(async (doc) => {
        const d = doc.data();
        const restDoc = await db.collection("restaurants").doc(d.restaurant_id).get();
        const rest = restDoc.exists ? restDoc.data() : {};
        return {
          id: doc.id, ...d,
          donor_name: rest.name || "",
          location: rest.address || "",
          donor_phone: rest.phone || "",
        };
      })
    );
    donations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    const snap = await db.collection("donations").where("donor_id", "==", donorId).get();
    const donations = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    donations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

    const donSnap = await db.collection("donations").where("donor_id", "==", donorId).get();
    const donationIds = donSnap.docs.map((d) => d.id);

    if (donationIds.length === 0) return res.json([]);

    const reqSnap = await db.collection("requests").get();
    const allRequests = reqSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((r) => donationIds.includes(r.donation_id));

    const requests = await Promise.all(
      allRequests.map(async (r) => {
        const donDoc = await db.collection("donations").doc(r.donation_id).get();
        const don = donDoc.exists ? donDoc.data() : {};

        const userDoc = await db.collection("users").doc(r.receiver_id).get();
        const user = userDoc.exists ? userDoc.data() : {};

        const restSnap = await db.collection("restaurants").where("user_id", "==", don.donor_id).get();
        const rest = !restSnap.empty ? restSnap.docs[0].data() : {};

        return {
          ...r,
          food_name: don.food_name,
          quantity: don.quantity,
          expiry_time: don.expiry_time,
          donation_status: don.status,
          receiver_name: user.name || "",
          receiver_email: user.email || "",
          restaurant_name: rest.name || "",
        };
      })
    );
    requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

    const doc = await db.collection("donations").doc(id).get();
    if (!doc.exists || doc.data().donor_id !== donorId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db.collection("donations").doc(id).update({
      food_name: foodName, quantity, expiry_time: expiryTime, status,
    });
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

    const doc = await db.collection("donations").doc(id).get();
    if (!doc.exists || doc.data().donor_id !== donorId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db.collection("donations").doc(id).delete();
    res.json({ message: "Donation deleted successfully" });
  } catch (error) {
    console.error("Delete donation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
