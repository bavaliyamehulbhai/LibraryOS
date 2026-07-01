const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.code && err.code === 11000) {
    return res.status(400).json({ success: false, message: "Duplicate field value entered" });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong on our end"
  });
};

module.exports = errorHandler;
