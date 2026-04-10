const db = require("../config/db");
const { sendEmail } = require("../utils/emailer");

// Create food request
exports.createRequest = async (req, res) => {
  try {
    const { donationId } = req.body;
    const receiverId = req.user.userId;

    // Check if donation exists and is available
    const [donations] = await db.query(
      'SELECT * FROM donations WHERE id = ? AND status = "available"',
      [donationId],
    );
    if (donations.length === 0) {
      return res.status(404).json({ message: "Donation not available" });
    }

    // Check if already requested
    const [existing] = await db.query(
      "SELECT * FROM requests WHERE receiver_id = ? AND donation_id = ?",
      [receiverId, donationId],
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Already requested this donation" });
    }

    const [result] = await db.query(
      "INSERT INTO requests (receiver_id, donation_id) VALUES (?, ?)",
      [receiverId, donationId],
    );

    // Update donation status to requested
    await db.query('UPDATE donations SET status = "requested" WHERE id = ?', [
      donationId,
    ]);

    const [receiverData] = await db.query("SELECT email, name FROM users WHERE id = ?", [receiverId]);
    if (receiverData.length > 0) {
      await sendEmail(
        receiverData[0].email,
        "Food Request Submitted - ShareAbite",
        `Hello ${receiverData[0].name},\n\nYour request for the donation has been successfully submitted. You will be notified once the donor approves it.\n\nThank you,\nShareAbite Team`
      );
    }

    res.status(201).json({
      message: "Request created successfully",
      requestId: result.insertId,
    });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get receiver's requests
exports.getReceiverRequests = async (req, res) => {
  try {
    const receiverId = req.user.userId;
    const [requests] = await db.query(
      `
      SELECT r.*, d.food_name, d.quantity, d.expiry_time, rest.name as donor_name
      FROM requests r
      JOIN donations d ON r.donation_id = d.id
      JOIN restaurants rest ON d.restaurant_id = rest.id
      WHERE r.receiver_id = ?
      ORDER BY r.created_at DESC
    `,
      [receiverId],
    );

    res.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update request status (for donor approval)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Get the request details
    const [requests] = await db.query("SELECT * FROM requests WHERE id = ?", [
      id,
    ]);
    if (requests.length === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    const request = requests[0];

    // If approving, check if another request for this donation is already approved
    if (status === "approved") {
      const [approvedRequests] = await db.query(
        'SELECT * FROM requests WHERE donation_id = ? AND status = "approved" AND id != ?',
        [request.donation_id, id],
      );

      if (approvedRequests.length > 0) {
        return res
          .status(400)
          .json({
            message:
              "Another request has already been approved for this donation",
          });
      }

      // Update donation status to completed
      await db.query('UPDATE donations SET status = "completed" WHERE id = ?', [
        request.donation_id,
      ]);

      // Reject all other pending requests for this donation
      await db.query(
        'UPDATE requests SET status = "rejected" WHERE donation_id = ? AND id != ? AND status = "pending"',
        [request.donation_id, id],
      );
    }

    // Update the request status
    await db.query("UPDATE requests SET status = ? WHERE id = ?", [status, id]);

    const [receiverData] = await db.query("SELECT email, name FROM users WHERE id = ?", [request.receiver_id]);
    if (receiverData.length > 0) {
      const subject = status === "approved" ? "Food Request Approved - ShareAbite" : "Food Request Rejected - ShareAbite";
      const text = status === "approved" 
        ? `Hello ${receiverData[0].name},\n\nGood news! Your food pickup request has been approved. Please contact the donor to coordinate pickup.\n\nThank you,\nShareAbite Team`
        : `Hello ${receiverData[0].name},\n\nUnfortunately, your food pickup request has been rejected.\n\nThank you,\nShareAbite Team`;
        
      await sendEmail(receiverData[0].email, subject, text);
    }

    res.json({ message: "Request status updated successfully" });
  } catch (error) {
    console.error("Update request status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
