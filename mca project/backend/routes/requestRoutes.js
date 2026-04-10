const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, requestController.createRequest);
router.get(
  "/my-requests",
  authMiddleware,
  requestController.getReceiverRequests,
);
router.put(
  "/:id/status",
  authMiddleware,
  requestController.updateRequestStatus,
);

module.exports = router;
