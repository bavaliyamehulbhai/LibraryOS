const digitalLibraryService = require("../services/digitalLibraryService");
const storageService = require("../services/storageService");
const DigitalResource = require("../models/DigitalResource");
const ReadingHistory = require("../models/ReadingHistory");

exports.uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const { title, description, resourceType, author, accessLevel } = req.body;
    const fileUrl = storageService.getFileUrl(req.file);
    
    // Cloudinary returns the secure_url in req.file.path or req.file.secure_url when using multer-storage-cloudinary
    const actualUrl = req.file.secure_url || req.file.path || fileUrl;
    
    let coverImage = null;
    
    // If it's a PDF, Cloudinary can automatically generate a thumbnail image!
    // We just change the extension from .pdf to .jpg
    if (req.file.mimetype === 'application/pdf') {
       coverImage = actualUrl.replace(/\.pdf$/i, '.jpg');
    } else if (req.file.mimetype.startsWith('image/')) {
       coverImage = actualUrl; // If they uploaded an image directly
    }
    
    // Extract metadata (like pages) from the file (this might fail if local path is expected, so wrap in try-catch)
    let meta = { totalPages: 0 };
    try {
      meta = await digitalLibraryService.extractMetadata(req.file.path, req.file.mimetype);
    } catch (e) {
      console.log("Could not extract metadata locally, relying on defaults.");
    }

    const resourceData = {
      title,
      description,
      resourceType,
      author,
      accessLevel,
      fileUrl: actualUrl,
      coverImage: coverImage,
      fileSize: req.file.size || 0,
      totalPages: meta.totalPages || 0,
      libraryId: req.user.libraryId,
      uploadedBy: req.user._id
    };

    const newResource = await digitalLibraryService.createResource(resourceData);
    res.status(201).json({ success: true, message: "Resource uploaded successfully", data: newResource });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllResources = async (req, res) => {
  try {
    // For members, only show PUBLIC or MEMBERS_ONLY. Admins see all.
    let query = { libraryId: req.user.libraryId };
    
    if (["MEMBER", "STUDENT"].includes(req.user.role)) {
      query.accessLevel = { $in: ["PUBLIC", "MEMBERS_ONLY"] };
    }

    // Basic Search
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { author: { $regex: req.query.search, $options: "i" } }
      ];
    }

    const resources = await DigitalResource.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getResourceDetails = async (req, res) => {
  try {
    const resource = await DigitalResource.findOne({ _id: req.params.id, libraryId: req.user.libraryId });
    if (!resource) return res.status(404).json({ success: false, message: "Resource not found" });
    
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReadingProgress = async (req, res) => {
  try {
    const { resourceId, lastPage } = req.body;
    
    let history = await ReadingHistory.findOne({
      libraryId: req.user.libraryId,
      userId: req.user._id,
      resourceId
    });

    const resource = await DigitalResource.findById(resourceId);
    let progress = 0;
    if (resource && resource.totalPages > 0) {
      progress = Math.min(100, Math.round((lastPage / resource.totalPages) * 100));
    }

    if (history) {
      history.lastPage = lastPage;
      history.progress = progress;
      await history.save();
    } else {
      history = await ReadingHistory.create({
        libraryId: req.user.libraryId,
        userId: req.user._id,
        resourceId,
        lastPage,
        progress
      });
    }

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyLibrary = async (req, res) => {
  try {
    const history = await ReadingHistory.find({
      libraryId: req.user.libraryId,
      userId: req.user._id
    }).populate("resourceId").sort({ updatedAt: -1 });
    
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
