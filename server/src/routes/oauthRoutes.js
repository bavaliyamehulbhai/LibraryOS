const express = require("express");
const passport = require("passport");
const router = express.Router();
const { googleCallback } = require("../controllers/oauthController");

// Initialize Passport (should normally be in app.js, but keeping localized for MVP)
router.use(passport.initialize());

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=OAuthFailed` }),
  googleCallback
);

// Microsoft OAuth Routes
router.get(
  "/microsoft",
  passport.authenticate("microsoft", { session: false, prompt: "select_account" })
);

router.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=OAuthFailed` }),
  googleCallback
);

module.exports = router;
