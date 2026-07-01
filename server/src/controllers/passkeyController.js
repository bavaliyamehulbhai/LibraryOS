const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require("@simplewebauthn/server");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const Session = require("../models/Session");

// In-memory store for challenges (In production use Redis)
const challengesStore = {};

const rpName = "LibraryOS";
const rpID = "localhost"; // Must match your domain
const origin = `${process.env.CLIENT_URL || "http://localhost:5173"}`;

const registerPasskeyOptions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const userPasskeys = user.passkeys.map(key => ({
      id: Buffer.from(key.credentialId, 'base64url'),
      type: "public-key",
      transports: ["internal"]
    }));

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(user._id.toString(), 'utf8')),
      userName: user.email,
      attestationType: "none",
      excludeCredentials: userPasskeys,
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "required"
      }
    });

    challengesStore[user._id.toString()] = options.challenge;

    res.json({ success: true, options });
  } catch (error) {
    console.error("Passkey Options Error:", error);
    res.status(500).json({ success: false, message: error.stack || error.message });
  }
};

const registerPasskeyVerify = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const expectedChallenge = challengesStore[user._id.toString()];

    if (!expectedChallenge) {
      return res.status(400).json({ success: false, message: "Challenge expired" });
    }

    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credentialID, credentialPublicKey, counter } = registrationInfo;
      
      user.passkeys.push({
        credentialId: Buffer.from(credentialID).toString('base64url'),
        publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
        counter
      });
      await user.save();
      
      delete challengesStore[user._id.toString()];
      return res.json({ success: true, message: "Passkey registered successfully" });
    }

    res.status(400).json({ success: false, message: "Verification failed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.stack || error.message });
  }
};

const loginPasskeyOptions = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.passkeys.length === 0) {
      // Return a generic options anyway to prevent email enumeration, 
      // but without valid credentials to match against.
      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: []
      });
      challengesStore[email] = options.challenge;
      return res.json({ success: true, options });
    }

    const allowCredentials = user.passkeys.map(key => ({
      id: Buffer.from(key.credentialId, 'base64url'),
      type: "public-key",
      transports: ["internal", "usb", "ble", "nfc"]
    }));

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: "required"
    });

    challengesStore[email] = options.challenge;

    res.json({ success: true, options });
  } catch (error) {
    res.status(500).json({ success: false, message: error.stack || error.message });
  }
};

const loginPasskeyVerify = async (req, res) => {
  try {
    const { email, response } = req.body;
    const user = await User.findOne({ email });
    const expectedChallenge = challengesStore[email];

    if (!user || !expectedChallenge) {
      return res.status(400).json({ success: false, message: "Invalid challenge or user" });
    }

    const passkey = user.passkeys.find(p => p.credentialId === response.id);
    if (!passkey) {
      return res.status(400).json({ success: false, message: "Passkey not found" });
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      authenticator: {
        credentialPublicKey: Buffer.from(passkey.publicKey, 'base64url'),
        credentialID: Buffer.from(passkey.credentialId, 'base64url'),
        counter: passkey.counter
      }
    });

    const { verified, authenticationInfo } = verification;

    if (verified) {
      // Update counter
      passkey.counter = authenticationInfo.newCounter;
      await user.save();
      delete challengesStore[email];

      const token = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Create Session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await Session.create({
        userId: user._id,
        refreshToken,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt
      });

      const userData = user.toObject();
      delete userData.password;

      return res.json({
        success: true,
        message: "Login Successful",
        data: userData,
        token,
        refreshToken
      });
    }

    res.status(400).json({ success: false, message: "Verification failed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.stack || error.message });
  }
};

module.exports = {
  registerPasskeyOptions,
  registerPasskeyVerify,
  loginPasskeyOptions,
  loginPasskeyVerify
};
