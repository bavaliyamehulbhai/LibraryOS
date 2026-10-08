const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date() });
});

router.get("/readiness", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  if (isDbConnected) {
    res.json({ status: "READY", database: "Connected", timestamp: new Date() });
  } else {
    res.status(503).json({ status: "NOT_READY", database: "Disconnected", timestamp: new Date() });
  }
});

router.get("/debug-users", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ success: false, message: "Forbidden in production" });
  }
  const User = require("../models/User");
  const count = await User.countDocuments({});
  res.json({ totalUsers: count, status: "OK" });
});

module.exports = router;
