const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
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

