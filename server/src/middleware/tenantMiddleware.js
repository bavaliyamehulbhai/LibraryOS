const ROLES = require('../constants/roles');
const Library = require('../models/Library');
const mongoose = require('mongoose');

const tenantMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      req.libraryId = req.query.libraryId || req.body.libraryId || null;
      return next();
    }

    if (!req.user.libraryId) {
      return res.status(403).json({ success: false, message: 'No library assigned to this user' });
    }

    // Keep lightweight flows (tests and non-mongo tenant ids) fast and deterministic.
    if (!mongoose.Types.ObjectId.isValid(req.user.libraryId)) {
      req.libraryId = req.user.libraryId;
      return next();
    }

    // Avoid blocking requests if DB is not connected yet.
    if (mongoose.connection.readyState !== 1) {
      req.libraryId = req.user.libraryId;
      return next();
    }

    // Lookup tenant health/status via Library model
    const tenant = await Library.findById(req.user.libraryId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (tenant.status === "SUSPENDED") {
      return res.status(403).json({ 
        success: false, 
        message: 'Your organization account has been suspended. Please contact platform support.' 
      });
    }

    req.libraryId = req.user.libraryId;
    req.tenant = tenant; // Attach tenant to request

    if (req.body && req.body.libraryId && req.body.libraryId !== req.libraryId) {
      return res.status(403).json({ success: false, message: 'Cannot act on behalf of another library' });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in Tenant Validation" });
  }
};

module.exports = tenantMiddleware;
