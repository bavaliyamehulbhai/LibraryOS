const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
 try {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false });
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Normalize user id so both legacy (_id) and current (id) payloads work.
  decoded.id = decoded.id || decoded._id;
  decoded._id = decoded._id || decoded.id;
  
  // Real-time Database Verification (Ghost User Protection)
  const user = await User.findById(decoded.id).select('isActive');
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: "Unauthorized. Account disabled or deleted." });
  }

  req.user = decoded;
  next();

 } catch (error) {
  return res.status(401).json({
    success: false,
    message: "Unauthorized"
  });
 }
};

module.exports = authMiddleware;

