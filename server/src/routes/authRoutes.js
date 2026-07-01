const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: { success: false, message: "Too many registration attempts, please try again later." }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts
  message: { success: false, message: "Too many login attempts, please try again later." }
});

const {
 registerUser,
 loginUser,
 verifyOtp,
 requestOtpLogin,
 forgotPassword,
 resetPassword,
 getCurrentUser,
 logoutUser,
 refreshAccessToken,
 logoutAll,
 setup2FA,
 verify2FASetup
} = require("../controllers/authController");

router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/request-otp-login", loginLimiter, requestOtpLogin);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logoutUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout-all", authMiddleware, logoutAll);

// 2FA Setup
router.post("/2fa/setup", authMiddleware, setup2FA);
router.post("/2fa/verify-setup", authMiddleware, verify2FASetup);

module.exports = router;
