const libraryService = require("../services/libraryService");
const AuditLog = require("../models/AuditLog");

const generateCode = (name) => {
  const prefix = name.substring(0, 3).toUpperCase();
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}${random}`;
};

const createLibrary = async (req, res) => {
  try {
    const code = generateCode(req.body.name);

    const library = await libraryService.createLibrary({
      ...req.body,
      code,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Library Created Successfully",
      data: library
    });
  } catch (error) {
    if (error.message === "Library Already Exists" || error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Library Already Exists"
      });
    }

    if (error.name === "ValidationError" || error.message.includes("validation failed")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getLibraries = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, status, city, sort } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (status) {
      filter.status = status;
    } else {
      // Exclude soft-deleted (suspended) libraries by default
      filter.status = { $ne: "SUSPENDED" };
    }
    if (city) {
      filter.city = city;
    }

    let sortObj = { createdAt: -1 };
    if (sort) {
      sortObj = { [sort]: -1 };
    }

    const libraries = await libraryService.getLibraries(filter, skip, limit, sortObj);
    const total = await libraryService.getLibraryCount(filter);

    return res.json({
      success: true,
      data: libraries,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getLibraryById = async (req, res) => {
  try {
    const library = await libraryService.getLibraryById(req.params.id);
    if (!library) {
      return res.status(404).json({ success: false, message: "Library Not Found" });
    }
    return res.json({ success: true, data: library });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateLibrary = async (req, res) => {
  try {
    const allowedUpdates = ["name", "phone", "address", "city", "state", "logo", "website"];
    const updateData = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const library = await libraryService.updateLibrary(req.params.id, updateData);
    if (!library) {
      return res.status(404).json({ success: false, message: "Library Not Found" });
    }

    await AuditLog.create({
      action: "UPDATE_LIBRARY",
      entity: "LIBRARY",
      userId: req.user._id,
      libraryId: library._id,
      details: `Updated library ${library.name}`
    });

    return res.json({ success: true, data: library });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteLibrary = async (req, res) => {
  try {
    const library = await libraryService.deleteLibrary(req.params.id);
    if (!library) {
      return res.status(404).json({ success: false, message: "Library Not Found" });
    }

    await AuditLog.create({
      action: "DELETE_LIBRARY",
      entity: "LIBRARY",
      userId: req.user._id,
      libraryId: library._id,
      details: `Soft deleted library ${library.name}`
    });

    return res.json({ success: true, message: "Library Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const restoreLibrary = async (req, res) => {
  try {
    const library = await libraryService.restoreLibrary(req.params.id);
    if (!library) {
      return res.status(404).json({ success: false, message: "Library Not Found" });
    }

    await AuditLog.create({
      action: "RESTORE_LIBRARY",
      entity: "LIBRARY",
      userId: req.user._id,
      libraryId: library._id,
      details: `Restored library ${library.name}`
    });

    return res.json({ success: true, message: "Library Restored Successfully", data: library });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createLibrary,
  getLibraries,
  getLibraryById,
  updateLibrary,
  deleteLibrary,
  restoreLibrary
};
