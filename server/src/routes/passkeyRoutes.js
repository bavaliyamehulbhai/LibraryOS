const express = require("express");
const router = express.Router();
const {
  registerPasskeyOptions,
  registerPasskeyVerify,
  loginPasskeyOptions,
  loginPasskeyVerify
} = require("../controllers/passkeyController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes (Register new passkey for logged-in user)
router.get("/register/options", authMiddleware, registerPasskeyOptions);
router.post("/register/verify", authMiddleware, registerPasskeyVerify);

// Public routes (Login with passkey)
router.post("/login/options", loginPasskeyOptions);
router.post("/login/verify", loginPasskeyVerify);

module.exports = router;
