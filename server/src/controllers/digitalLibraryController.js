const digitalLibraryService = require("../services/digitalLibraryService");
const storageService = require("../services/storageService");
const DigitalResource = require("../models/DigitalResource");
const ReadingHistory = require("../models/ReadingHistory");

exports.uploadResource = async (req, res) => {
  try {
    const { title, description, resourceType, author, accessLevel, externalUrl } = req.body;

    if (!req.file && !externalUrl) {
      return res.status(400).json({ success: false, message: "Please provide a file or an external URL." });
    }

    let actualUrl = externalUrl;
    let coverImage = null;
    let fileSize = 0;
    let meta = { totalPages: 0 };

    if (req.file) {
      const fileUrl = storageService.getFileUrl(req.file);
      actualUrl = req.file.secure_url || (req.file.path && req.file.path.startsWith('http') ? req.file.path : null) || fileUrl;
      fileSize = req.file.size || 0;
      
      if (req.file.mimetype === 'application/pdf' && actualUrl.includes('cloudinary.com')) {
         coverImage = actualUrl.replace(/\.pdf$/i, '.jpg');
      } else if (req.file.mimetype.startsWith('image/')) {
         coverImage = actualUrl;
      }
      
      try {
        meta = await digitalLibraryService.extractMetadata(req.file.path, req.file.mimetype);
      } catch (e) {
        console.log("Could not extract metadata locally, relying on defaults.");
      }
    }

    const resourceData = {
      title,
      description,
      resourceType,
      author,
      accessLevel,
      fileUrl: actualUrl,
      coverImage: coverImage,
      fileSize: fileSize,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // For members, only show PUBLIC or MEMBERS_ONLY. Admins see all.
    let query = { libraryId: req.user.libraryId };
    
    if (["MEMBER", "STUDENT"].includes(req.user.role)) {
      query.accessLevel = { $in: ["PUBLIC", "MEMBERS_ONLY"] };
    }

    if (req.query.category) {
      query.categoryId = req.query.category;
    }
    
    if (req.query.resourceType) {
      query.resourceType = req.query.resourceType;
    }

    // Basic Search
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { author: { $regex: req.query.search, $options: "i" } }
      ];
    }

    let total = await DigitalResource.countDocuments(query);
    
    // Fix existing mock data to have real PDFs
    await DigitalResource.updateMany(
      { fileUrl: "https://example.com/ai.pdf" },
      { $set: { fileUrl: "https://pdfobject.com/pdf/sample.pdf", totalPages: 1 } }
    );
    await DigitalResource.updateMany(
      { fileUrl: "https://example.com/quantum.pdf" },
      { $set: { fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", totalPages: 1 } }
    );
    await DigitalResource.updateMany(
      { fileUrl: "https://example.com/react.pdf" },
      { $set: { fileUrl: "https://pdfobject.com/pdf/sample.pdf", totalPages: 1 } }
    );
    await DigitalResource.updateMany(
      { fileUrl: "https://example.com/space.pdf" },
      { $set: { fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", totalPages: 1 } }
    );
    
    // Auto-seed mock data if empty to allow testing
    if (total === 0 && !req.query.search && !req.query.category && !req.query.resourceType) {
      const mockData = [
        {
          title: "Introduction to Artificial Intelligence",
          description: "A comprehensive guide to AI fundamentals.",
          resourceType: "EBOOK",
          author: "Dr. Alan Turing",
          accessLevel: "PUBLIC",
          fileUrl: "https://pdfobject.com/pdf/sample.pdf",
          coverImage: "https://m.media-amazon.com/images/I/71V23NLYPUL._AC_UF1000,1000_QL80_.jpg",
          fileSize: 2048576,
          totalPages: 1,
          libraryId: req.user.libraryId,
          uploadedBy: req.user._id
        },
        {
          title: "Quantum Computing Advances",
          description: "Latest research on quantum bits and supremacy.",
          resourceType: "RESEARCH_PAPER",
          author: "Dr. Richard Feynman",
          accessLevel: "MEMBERS_ONLY",
          fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          coverImage: "https://m.media-amazon.com/images/I/61r-P0wXyUL._AC_UF1000,1000_QL80_.jpg",
          fileSize: 1048576,
          totalPages: 1,
          libraryId: req.user.libraryId,
          uploadedBy: req.user._id
        },
        {
          title: "Modern React Architecture",
          description: "Building scalable web apps.",
          resourceType: "EBOOK",
          author: "Dan Abramov",
          accessLevel: "PUBLIC",
          fileUrl: "https://pdfobject.com/pdf/sample.pdf",
          coverImage: "https://m.media-amazon.com/images/I/71R3yX9F7GL._AC_UF1000,1000_QL80_.jpg",
          fileSize: 3048576,
          totalPages: 1,
          libraryId: req.user.libraryId,
          uploadedBy: req.user._id
        },
        {
          title: "The Future of Space Exploration",
          description: "Journal of astrophysics and cosmology.",
          resourceType: "JOURNAL",
          author: "Carl Sagan",
          accessLevel: "MEMBERS_ONLY",
          fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          coverImage: "https://m.media-amazon.com/images/I/81xX9+oWjOL._AC_UF1000,1000_QL80_.jpg",
          fileSize: 4048576,
          totalPages: 1,
          libraryId: req.user.libraryId,
          uploadedBy: req.user._id
        }
      ];
      await DigitalResource.insertMany(mockData);
      total = await DigitalResource.countDocuments(query);
    }

    const resources = await DigitalResource.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ 
      success: true, 
      data: resources,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const query = {
      libraryId: req.user.libraryId,
      userId: req.user._id
    };

    const total = await ReadingHistory.countDocuments(query);
    const history = await ReadingHistory.find(query)
      .populate("resourceId")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({ 
      success: true, 
      data: history,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromMyLibrary = async (req, res) => {
  try {
    const historyItem = await ReadingHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
      libraryId: req.user.libraryId
    });

    if (!historyItem) {
      return res.status(404).json({ success: false, message: "Item not found in your library." });
    }

    res.json({ success: true, message: "Removed from your library." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleSaveForLater = async (req, res) => {
  try {
    const resourceId = req.params.id || req.params.resourceId;
    let history = await ReadingHistory.findOne({
      userId: req.user._id,
      resourceId: resourceId
    });

    if (history) {
      history.isSaved = !history.isSaved;
      await history.save();
    } else {
      history = await ReadingHistory.create({
        libraryId: req.user.libraryId,
        userId: req.user._id,
        resourceId: resourceId,
        isSaved: true
      });
    }

    res.json({ success: true, isSaved: history.isSaved, message: history.isSaved ? "Saved for later" : "Removed from saved" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resourceId = req.params.id;
    
    // Build query based on role
    const query = { _id: resourceId };
    if (req.user.role !== "SUPER_ADMIN" && req.user.libraryId) {
      query.libraryId = req.user.libraryId;
    }

    const resource = await DigitalResource.findOneAndDelete(query);

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found or you don't have permission to delete it" });
    }

    // Also delete reading history for this resource so it doesn't cause errors
    await ReadingHistory.deleteMany({ resourceId: resourceId });

    res.json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
