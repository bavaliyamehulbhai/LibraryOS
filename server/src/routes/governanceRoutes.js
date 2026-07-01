const express = require("express");
const router = express.Router();
const { 
  initiateAccessReview, 
  getAccessReviews, 
  approveAccessReview, 
  requestAccess, 
  approveAccessRequest 
} = require("../controllers/governanceController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Regular users can request access
router.post("/request-access", authMiddleware, requestAccess);

// Only Super Admins and Security Admins handle governance
router.post("/reviews/initiate", authMiddleware, roleMiddleware("SUPER_ADMIN"), initiateAccessReview);
router.get("/reviews", authMiddleware, roleMiddleware("SUPER_ADMIN"), getAccessReviews);
router.post("/reviews/approve", authMiddleware, roleMiddleware("SUPER_ADMIN"), approveAccessReview);

router.post("/requests/approve", authMiddleware, roleMiddleware("SUPER_ADMIN"), approveAccessRequest);

module.exports = router;
