const db = require("../config/db");
const { sendEmail } = require("../utils/emailer");

// Create food request
exports.createRequest = async (req, res) => {
  try {
    const { donationId } = req.body;
    const receiverId = req.user.userId;

    // Check if donation exists and is available
    const donDoc = await db.collection("donations").doc(donationId).get();
    if (!donDoc.exists || donDoc.data().status !== "available") {
      return res.status(404).json({ message: "Donation not available" });
    }

    // Check if already requested
    const existing = await db.collection("requests")
      .where("receiver_id", "==", receiverId)
      .where("donation_id", "==", donationId)
      .get();
    if (!existing.empty) {
      return res.status(400).json({ message: "Already requested this donation" });
    }

    const result = await db.collection("requests").add({
      receiver_id: receiverId,
      donation_id: donationId,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    // Update donation status to requested
    await db.collection("donations").doc(donationId).update({ status: "requested" });

    // Send email to receiver
    const userDoc = await db.collection("users").doc(receiverId).get();
    if (userDoc.exists) {
      const user = userDoc.data();
      sendEmail(
        user.email,
        "Food Request Submitted - ShareAbite",
        `Hello ${user.name},\n\nYour request for the donation has been successfully submitted. You will be notified once the donor approves it.\n\nThank you,\nShareAbite Team`
      ).catch(err => console.error("Email failed:", err));
    }

    // Send email to donor
    const don = donDoc.data();
    if (don.donor_id) {
      const donorDoc = await db.collection("users").doc(don.donor_id).get();
      if (donorDoc.exists) {
        const donor = donorDoc.data();
        sendEmail(
          donor.email,
          "New Food Request - ShareAbite",
          `Hello ${donor.name},\n\nYou have received a new food request for your donation. Please log in to your account to review and approve it.\n\nThank you,\nShareAbite Team`
        ).catch(err => console.error("Email failed:", err));
      }
    }

    res.status(201).json({ message: "Request created successfully", requestId: result.id });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get receiver's requests
exports.getReceiverRequests = async (req, res) => {
  try {
    const receiverId = req.user.userId;
    const snap = await db.collection("requests").where("receiver_id", "==", receiverId).get();

    const requests = await Promise.all(
      snap.docs.map(async (doc) => {
        const r = doc.data();
        const donDoc = await db.collection("donations").doc(r.donation_id).get();
        const don = donDoc.exists ? donDoc.data() : {};

        const restSnap = don.restaurant_id
          ? await db.collection("restaurants").doc(don.restaurant_id).get()
          : null;
        const rest = restSnap && restSnap.exists ? restSnap.data() : {};

        return {
          id: doc.id, ...r,
          food_name: don.food_name,
          quantity: don.quantity,
          expiry_time: don.expiry_time,
          donor_name: rest.name || "",
        };
      })
    );
    requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update request status (for donor approval/rejection)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reqDoc = await db.collection("requests").doc(id).get();
    if (!reqDoc.exists) {
      return res.status(404).json({ message: "Request not found" });
    }
    const request = reqDoc.data();

    if (status === "approved") {
      // Check if another request for this donation is already approved
      const approvedSnap = await db.collection("requests")
        .where("donation_id", "==", request.donation_id)
        .where("status", "==", "approved")
        .get();
      const alreadyApproved = approvedSnap.docs.filter((d) => d.id !== id);
      if (alreadyApproved.length > 0) {
        return res.status(400).json({ message: "Another request has already been approved for this donation" });
      }

      // Mark donation as completed
      await db.collection("donations").doc(request.donation_id).update({ status: "completed" });

      // Reject all other pending requests for this donation
      const pendingSnap = await db.collection("requests")
        .where("donation_id", "==", request.donation_id)
        .where("status", "==", "pending")
        .get();
      const batch = db.batch();
      
      const rejectedReceivers = [];
      pendingSnap.docs.forEach((doc) => {
        if (doc.id !== id) {
          batch.update(doc.ref, { status: "rejected" });
          rejectedReceivers.push(doc.data().receiver_id);
        }
      });
      await batch.commit();

      // Send rejection emails to automatically rejected receivers concurrently
      rejectedReceivers.map(async (recId) => {
        const recDoc = await db.collection("users").doc(recId).get();
        if (recDoc.exists) {
          const recUser = recDoc.data();
          sendEmail(
            recUser.email,
            "Food Request Rejected - ShareAbite",
            `Hello ${recUser.name},\n\nUnfortunately, your food pickup request has been rejected because another request for this donation was approved.\n\nThank you,\nShareAbite Team`
          ).catch(err => console.error("Email failed:", err));
        }
      });
    }

    // Update this request status
    await db.collection("requests").doc(id).update({ status });

    // Send email to receiver
    const userDoc = await db.collection("users").doc(request.receiver_id).get();
    if (userDoc.exists) {
      const user = userDoc.data();
      const subject = status === "approved"
        ? "Food Request Approved - ShareAbite"
        : "Food Request Rejected - ShareAbite";
      const text = status === "approved"
        ? `Hello ${user.name},\n\nGood news! Your food pickup request has been approved. Please contact the donor to coordinate pickup.\n\nThank you,\nShareAbite Team`
        : `Hello ${user.name},\n\nUnfortunately, your food pickup request has been rejected.\n\nThank you,\nShareAbite Team`;
      sendEmail(user.email, subject, text).catch(err => console.error("Email failed:", err));
    }

    res.json({ message: "Request status updated successfully" });
  } catch (error) {
    console.error("Update request status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
