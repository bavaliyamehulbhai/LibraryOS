const auditService = require("../services/auditService");

const auditMiddleware = (moduleName) => {
  return async (req, res, next) => {
    const start = Date.now();
    
    // Intercept response to calculate response time
    res.on("finish", () => {
      if (req.user && req.method !== "GET") {
        const duration = Date.now() - start;
        
        auditService.createActivityLog({
          userId: req.user._id,
          action: `${req.method} ${req.originalUrl}`,
          module: moduleName || "SYSTEM",
          description: `API Request completed in ${duration}ms with status ${res.statusCode}`,
          libraryId: req.user.libraryId
        });
      }
    });

    next();
  };
};

module.exports = auditMiddleware;
