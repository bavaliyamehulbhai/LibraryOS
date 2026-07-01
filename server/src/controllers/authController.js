const User = require("../models/User");
const Library = require("../models/Library");
const AuditLog = require("../models/AuditLog");
const Session = require("../models/Session");
const LoginActivity = require("../models/LoginActivity");
const SecurityAlert = require("../models/SecurityAlert");
const Otp = require("../models/Otp");
const PasswordReset = require("../models/PasswordReset");
const ROLES = require("../constants/roles");
const { validateRegister } = require("../validators/authValidator");
const { validateLogin } = require("../validators/loginValidator");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const { sendOtpEmail, sendPasswordResetEmail, sendSecurityAlertEmail } = require("../services/emailService");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const { evaluateLogin } = require("../services/riskEngine");
const auditService = require("../services/auditService");

const getBrowser = (userAgent) => {
  if (!userAgent) return "Unknown";
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  return "Other";
};

const getOS = (userAgent) => {
  if (!userAgent) return "Unknown";
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac")) return "MacOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iOS")) return "iOS";
  return "Other";
};

const createSession = async (user, req, refreshToken) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  await Session.create({
    userId: user._id,
    refreshToken,
    deviceInfo: req.headers['user-agent'],
    ipAddress: req.ip,
    expiresAt
  });
};

const registerUser = async (req, res) => {
 try {
  const { name, email, password, role, libraryId } = req.body;

  const validationErrors = validateRegister(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ success: false, message: validationErrors.join(", ") });
  }

  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid Role" });
  }

  const library = await Library.findById(libraryId);
  if (!library) {
    return res.status(404).json({ success: false, message: "Library not found" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    libraryId
  });

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await createSession(user, req, refreshToken);

  const userData = user.toObject();
  delete userData.password;

  await auditService.createActivityLog({
    userId: user._id,
    libraryId: user.libraryId,
    action: "USER_CREATED",
    module: "AUTH",
    description: "New User Registered"
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: userData,
    token,
    refreshToken
  });
 } catch (error) {
  res.status(500).json({ success: false, message: error.message });
 }
};

const loginUser = async (req, res) => {
 try {
  const { email, password } = req.body;

  const validationErrors = validateLogin(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ success: false, message: validationErrors.join(", ") });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    await auditService.createSecurityLog({
      event: "FAILED_LOGIN",
      severity: "LOW",
      ipAddress: req.ip,
      details: `Invalid login attempt for email: ${email}`,
    });
    return res.status(401).json({ success: false, message: "Invalid Credentials" });
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    await LoginActivity.create({
      userId: user._id,
      libraryId: user.libraryId,
      email: user.email,
      ipAddress: req.ip,
      browser: getBrowser(req.headers['user-agent']),
      os: getOS(req.headers['user-agent']),
      status: "LOCKED"
    });
    return res.status(403).json({ success: false, message: "Account Locked. Try again later." });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: "Account Disabled" });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    user.loginAttempts += 1;
    let status = "FAILED";

    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 15 * 60 * 1000;
      status = "LOCKED";
      
      await auditService.createSecurityLog({
        userId: user._id,
        libraryId: user.libraryId,
        event: "MULTIPLE_FAILED_LOGINS",
        severity: "CRITICAL",
        ipAddress: req.ip,
        details: "Account locked due to multiple failed login attempts"
      });
    }
    await user.save();
    
    await auditService.createSecurityLog({
      event: "FAILED_LOGIN",
      severity: "MEDIUM",
      userId: user._id,
      ipAddress: req.ip,
      details: "Invalid password attempt",
      libraryId: user.libraryId
    });

    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // --- Risk Engine Evaluation ---
  const riskAssessment = await evaluateLogin(user, req);

  if (riskAssessment.riskLevel === "CRITICAL") {
    // Block entirely
    return res.status(403).json({ success: false, message: "Login blocked due to critical risk factors." });
  }

  // Adaptive MFA check (Force 2FA if risk is HIGH, even if user disabled it)
  const isAdaptiveMfaRequired = (riskAssessment.riskLevel === "HIGH");

  // 2FA Flow
  if (user.twoFactorEnabled || isAdaptiveMfaRequired) {
    if (user.twoFactorMethod === "TOTP") {
      return res.json({
        success: true,
        requires2FA: true,
        method: "TOTP",
        email: user.email,
        message: "Please enter code from your Authenticator App"
      });
    } else {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      await Otp.create({
        userId: user._id,
        code: otpCode,
        purpose: "LOGIN",
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 Minutes
      });

      await sendOtpEmail(user.email, otpCode);

      return res.json({
        success: true,
        requires2FA: true,
        method: "EMAIL",
        email: user.email,
        message: "OTP sent to your email"
      });
    }
  }

  // Normal Login Flow
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  await user.save();

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await createSession(user, req, refreshToken);

  const userData = user.toObject();
  delete userData.password;

  await auditService.createActivityLog({
    userId: user._id,
    libraryId: user.libraryId,
    action: "LOGIN_SUCCESS",
    module: "AUTH",
    description: "User logged in successfully"
  });

  await LoginActivity.create({
    userId: user._id,
    libraryId: user.libraryId,
    email: user.email,
    ipAddress: req.ip,
    browser: getBrowser(req.headers['user-agent']),
    os: getOS(req.headers['user-agent']),
    status: "SUCCESS"
  });

  res.json({
    success: true,
    message: "Login Successful",
    data: userData,
    token,
    refreshToken
  });
 } catch (error) {
  res.status(500).json({ success: false, message: error.message });
 }
};

const requestOtpLogin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const Invitation = require("../models/Invitation");
      const invitation = await Invitation.findOne({ email: email.toLowerCase() });
      
      if (!invitation) {
        return res.status(401).json({ success: false, message: "Account not found. Please ask your Administrator for an invitation." });
      }

      user = await User.create({
        name: email.split("@")[0],
        email: email.toLowerCase(),
        password: Math.random().toString(36).slice(-10),
        role: invitation.role,
        libraryId: invitation.organizationId,
        emailVerified: true
      });
      await Invitation.deleteOne({ _id: invitation._id });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account Disabled" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    await Otp.create({
      userId: user._id,
      code: otpCode,
      purpose: "LOGIN",
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 Minutes
    });

    await sendOtpEmail(user.email, otpCode);

    res.json({
      success: true,
      message: "OTP sent to your email",
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.twoFactorMethod === "TOTP") {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: otp,
        window: 1 // Allow 30 seconds before/after
      });

      if (!verified) {
        return res.status(400).json({ success: false, message: "Invalid Authenticator Code" });
      }
    } else {
      const otpRecord = await Otp.findOne({
        userId: user._id,
        purpose: "LOGIN",
        isUsed: false,
        expiresAt: { $gt: Date.now() }
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return res.status(400).json({ success: false, message: "OTP expired or invalid" });
      }

      if (otpRecord.code !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        
        if (otpRecord.attempts >= 5) {
          otpRecord.isUsed = true;
          await otpRecord.save();
          return res.status(400).json({ success: false, message: "Too many failed attempts. Request a new OTP." });
        }
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }

      otpRecord.isUsed = true;
      await otpRecord.save();
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await createSession(user, req, refreshToken);

    const userData = user.toObject();
    delete userData.password;

    await LoginActivity.create({
      userId: user._id,
      libraryId: user.libraryId,
      email: user.email,
      ipAddress: req.ip,
      browser: getBrowser(req.headers['user-agent']),
      os: getOS(req.headers['user-agent']),
      status: "SUCCESS"
    });

    res.json({
      success: true,
      message: "Login Successful",
      data: userData,
      token,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Option 1: Prevent user enumeration by returning generic success
      return res.json({ success: true, message: "If an account with this email exists, a password reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    await PasswordReset.create({
      userId: user._id,
      token: resetToken,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    res.json({ success: true, message: "If an account with this email exists, a password reset link has been sent." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const resetRecord = await PasswordReset.findOne({
      token,
      expiresAt: { $gt: Date.now() }
    });

    if (!resetRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    const user = await User.findById(resetRecord.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.password = password;
    await user.save();

    await PasswordReset.deleteOne({ _id: resetRecord._id });

    // Force Logout All Sessions
    await Session.updateMany({ userId: user._id }, { isActive: false });

    await sendSecurityAlertEmail(user.email, "Password Changed", "Your password was recently changed. All active sessions were logged out.");

    res.json({ success: true, message: "Password reset successful. Please login again." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
 try {
  const user = await User.findById(req.user.id).select("-password -loginAttempts -lockUntil");
  
  if (!user) {
    return res.status(404).json({ success: false, message: "User Not Found" });
  }

  res.json({
   success: true,
   data: user
  });
 } catch (error) {
  res.status(500).json({ success: false, message: error.message });
 }
};

const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.body?.refreshToken;
    
    if (refreshToken) {
      await Session.findOneAndUpdate(
        { refreshToken, userId: req.user.id },
        { isActive: false }
      );
    }

    await AuditLog.create({
      action: "LOGOUT",
      userId: req.user.id,
      libraryId: req.user.libraryId,
      entity: "AUTH",
      details: "User Logged Out"
    });

    res.status(200).json({
      success: true,
      message: "Logout Successful"
    });
  } catch (error) {
    require('fs').writeFileSync('logout_error.log', error.stack || error.message);
    console.error("Logout Error Detailed:", error);
    res.status(500).json({ success: false, message: error.stack || error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const session = await Session.findOne({ refreshToken, userId: decoded.id, isActive: true });
    if (!session) {
      return res.status(401).json({ success: false, message: "Session revoked or not found" });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User disabled or not found" });
    }

    const token = generateAccessToken(user);

    res.json({
      success: true,
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logoutAll = async (req, res) => {
  try {
    await Session.updateMany(
      { userId: req.user.id },
      { isActive: false }
    );

    await AuditLog.create({
      action: "LOGOUT",
      userId: req.user.id,
      libraryId: req.user.libraryId,
      module: "AUTH",
      description: "User Logged Out from all devices"
    });

    res.json({ success: true, message: "Logged out from all devices" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const secret = speakeasy.generateSecret({ name: `LibraryOS (${user.email})` });
    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({ success: true, secret: secret.base32, qrCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verify2FASetup = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: "2FA not initiated" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1
    });

    if (verified) {
      user.twoFactorEnabled = true;
      user.twoFactorMethod = "TOTP";
      await user.save();
      return res.json({ success: true, message: "Google Authenticator setup successful" });
    }

    res.status(400).json({ success: false, message: "Invalid token" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  logoutUser,
  refreshAccessToken,
  logoutAll,
  setup2FA,
  verify2FASetup,
  requestOtpLogin
};
