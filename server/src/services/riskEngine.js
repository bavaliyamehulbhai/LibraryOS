const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const RiskAssessment = require("../models/RiskAssessment");
const SecurityIncident = require("../models/SecurityIncident");

const evaluateLogin = async (user, req) => {
  const ip = req.ip || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "";

  let riskScore = 0;
  let reasons = [];

  // Parse Location
  const location = geoip.lookup(ip);
  if (location) {
    // Impossible travel check (simplistic for MVP: check if last login was in a different country within X hours)
    const lastAssessment = await RiskAssessment.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (lastAssessment && lastAssessment.location && lastAssessment.location.country !== location.country) {
      const timeDiff = Date.now() - new Date(lastAssessment.createdAt).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        riskScore += 50;
        reasons.push("Impossible Travel Detected: Country changed within 24h.");
      }
    }
  } else {
    // Unknown IP ranges (like localhost during dev) are slightly risky in production but we ignore for MVP
    if (process.env.NODE_ENV === "production") {
      riskScore += 10;
      reasons.push("Unknown IP Geolocation.");
    }
  }

  // Parse Device Fingerprint
  const parser = new UAParser(userAgent);
  const deviceInfo = parser.getResult();
  const deviceString = `${deviceInfo.os.name} ${deviceInfo.browser.name}`;

  const knownDevices = user.trustedDevices || [];
  const isKnownDevice = knownDevices.some(d => d.browser === deviceString);
  if (!isKnownDevice && knownDevices.length > 0) {
    riskScore += 30;
    reasons.push("New or Untrusted Device.");
  }

  // Failed Attempts Check
  if (user.loginAttempts > 2) {
    riskScore += 20;
    reasons.push("Multiple Failed Login Attempts.");
  }

  // Determine Level
  let riskLevel = "LOW";
  if (riskScore >= 80) riskLevel = "CRITICAL";
  else if (riskScore >= 50) riskLevel = "HIGH";
  else if (riskScore >= 30) riskLevel = "MEDIUM";

  // Create Assessment
  const assessment = await RiskAssessment.create({
    userId: user._id,
    riskScore,
    riskLevel,
    reason: reasons,
    ipAddress: ip,
    deviceInfo,
    location
  });

  // Handle CRITICAL (Spawns a Security Incident)
  if (riskLevel === "CRITICAL") {
    await SecurityIncident.create({
      title: `Critical Risk Login Detected for ${user.email}`,
      severity: "CRITICAL",
      affectedUsers: [user._id]
    });
  }

  return assessment;
};

module.exports = {
  evaluateLogin
};
