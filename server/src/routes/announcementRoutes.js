const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements
} = require("../controllers/announcementController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.use(authMiddleware);

// Anyone in the tenant can view active announcements
router.get("/", getAnnouncements);

// Only admins can create
router.post("/", authorize("LIBRARY_ADMIN", "SUPER_ADMIN"), createAnnouncement);

module.exports = router;
