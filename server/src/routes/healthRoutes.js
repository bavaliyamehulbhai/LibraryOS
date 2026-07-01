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
  const User = require("../models/User");
  const users = await User.find({});
  res.json({
    totalUsers: users.length,
    superAdmins: users.filter(u => u.role === "SUPER_ADMIN").map(u => ({ email: u.email, libraryId: u.libraryId })),
    students: users.filter(u => u.role === "STUDENT").map(u => ({ email: u.email, libraryId: u.libraryId }))
  });
});

module.exports = router;
