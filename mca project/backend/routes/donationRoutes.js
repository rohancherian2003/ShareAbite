const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donationController");
const authMiddleware = require("../middleware/authMiddleware");

// Restaurant routes
router.post(
  "/restaurant",
  authMiddleware,
  donationController.registerRestaurant,
);
router.get("/restaurant", authMiddleware, donationController.getRestaurant);
router.put("/restaurant", authMiddleware, donationController.updateRestaurant);

// Donation routes
router.post("/", authMiddleware, donationController.createDonation);
router.get("/", donationController.getAllDonations); // Public - for receivers to browse
router.get(
  "/my-donations",
  authMiddleware,
  donationController.getDonorDonations,
);
router.get("/requests", authMiddleware, donationController.getDonationRequests); // Get requests for donor's donations
router.put("/:id", authMiddleware, donationController.updateDonation);
router.delete("/:id", authMiddleware, donationController.deleteDonation);

module.exports = router;
