const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || (err.code === "LIMIT_FILE_SIZE" || err.name === "ValidationError" || (err.code && err.code === 11000) ? 400 : 500);
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ 
      success: false, 
      message: "File size exceeds the 5MB limit. Please compress your file or use the 'External Link' storage method." 
    });
  }

  if (err.code && err.code === 11000) {
    return res.status(400).json({ success: false, message: "Duplicate field value entered" });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong on our end"
  });
};

module.exports = errorHandler;
