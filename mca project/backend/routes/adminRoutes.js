const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

// User management routes
router.get("/users", authMiddleware, adminController.getAllUsers);
router.put("/users/:id/approve", authMiddleware, adminController.approveUser);
router.put("/users/:id", authMiddleware, adminController.updateUser);
router.delete("/users/:id", authMiddleware, adminController.deleteUser);

// Restaurant management routes
router.get("/restaurants", authMiddleware, adminController.getAllRestaurants);
router.put(
  "/restaurants/:id",
  authMiddleware,
  adminController.updateRestaurant,
);
router.delete(
  "/restaurants/:id",
  authMiddleware,
  adminController.deleteRestaurant,
);
router.get(
  "/restaurants/:id/stats",
  authMiddleware,
  adminController.getRestaurantStats,
);

// Statistics
router.get("/stats", authMiddleware, adminController.getStats);

module.exports = router;
