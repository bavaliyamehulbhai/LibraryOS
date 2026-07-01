const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const Session = require("../models/Session");
const ComplianceLog = require("../models/ComplianceLog");
const ROLES = require("../constants/roles");
const MicrosoftStrategy = require("passport-microsoft").Strategy;

const handleOAuthLogin = async (profile, provider, done) => {
  try {
    const email = (profile.emails && profile.emails[0]?.value) || profile.userPrincipalName;
    if (!email) {
      return done(null, false, { message: "No email provided by OAuth provider" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (user.provider !== provider) {
        user.provider = provider;
        user.providerId = profile.id;
        await user.save();
      }
      return done(null, user);
    }
    
    const Invitation = require("../models/Invitation"); 
    const invitation = await Invitation.findOne({ email: email.toLowerCase() });

    if (!invitation) {
      // Option A: Strict Mode - Reject if no account and no invite
      return done(null, false, { message: "Account not found. Please ask your Administrator for an invitation." });
    }

    let role = invitation.role;
    let libraryId = invitation.organizationId;
    await Invitation.deleteOne({ _id: invitation._id });

    user = await User.create({
      name: profile.displayName || email.split("@")[0],
      email: email.toLowerCase(),
      password: Math.random().toString(36).slice(-10),
      role: role,
      libraryId: libraryId,
      provider: provider,
      providerId: profile.id,
      emailVerified: true
    });

    await ComplianceLog.create({
      action: "SCIM_PROVISIONING",
      actorId: user._id,
      targetId: user._id,
      metadata: { provider: provider, invited: !!invitation }
    });

    return done(null, user);
  } catch (err) {
    console.error("OAuth Strategy Error:", err);
    return done(err, null);
  }
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "mock_id",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_secret",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    return handleOAuthLogin(profile, "GOOGLE", done);
  }
));

passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID || "mock_id",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "mock_secret",
    callbackURL: process.env.MICROSOFT_CALLBACK_URL || "/api/v1/oauth/microsoft/callback",
    scope: ["user.read"]
  },
  async (accessToken, refreshToken, profile, done) => {
    return handleOAuthLogin(profile, "MICROSOFT", done);
  }
));

const googleCallback = async (req, res) => {
  // Passport passes the authenticated user in req.user
  if (!req.user) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=OAuthFailed`);
  }

  const user = req.user;
  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Create session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  await Session.create({
    userId: user._id,
    refreshToken,
    deviceInfo: req.headers['user-agent'],
    ipAddress: req.ip,
    expiresAt
  });

  // Redirect to frontend with tokens (typically passed via URL params or set in cookie)
  res.redirect(`${process.env.CLIENT_URL}/oauth/callback?token=${token}&refreshToken=${refreshToken}`);
};

module.exports = {
  googleCallback
};
