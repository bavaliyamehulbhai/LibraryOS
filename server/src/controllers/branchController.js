const branchService = require("../services/branchService");
const AuditLog = require("../models/AuditLog");
const { generateBranchCode } = require("../utils/generateBranchCode");

const createBranch = async (req, res) => {
  try {
    // Allow SUPER_ADMIN to pass a libraryId explicitly during onboarding
    const libraryId = req.body.libraryId || req.user.libraryId;
    console.log("Creating branch for libraryId:", libraryId);

    // Need to get organizationId
    const Organization = require("../models/Organization");
    let org = await Organization.findOne({ libraryId });
    if (!org) {
      console.log(`Auto-creating missing Organization for libraryId: ${libraryId}`);
      const Library = require("../models/Library");
      const library = await Library.findById(libraryId);
      if (!library) {
        return res.status(404).json({ success: false, message: "Library not found" });
      }
      
      const orgCount = await Organization.countDocuments();
      const organizationCode = `ORG-${String(orgCount + 1).padStart(6, '0')}`;
      org = new Organization({
        libraryId: library._id,
        organizationCode,
        name: library.name,
        email: library.email || "admin@example.com",
        phone: library.phone || "0000000000",
        status: "ACTIVE"
      });
      await org.save();
    }

    const code = await generateBranchCode(libraryId, req.body.name);

    const branch = await branchService.createBranch({
      libraryId,
      organizationId: org._id,
      branchName: req.body.name,
      branchCode: code,
      isHeadOffice: false,
      address: {
        state: req.body.state || (typeof req.body.address === 'object' ? req.body.address.state : ""),
        city: req.body.city || (typeof req.body.address === 'object' ? req.body.address.city : ""),
        addressLine1: typeof req.body.address === 'string' ? req.body.address : (req.body.address?.addressLine1 || "")
      },
      contactInfo: {
        phone: req.body.phone || "",
        email: req.body.email || "",
      },
      managerId: req.body.managerId
    });

    await AuditLog.create({
      action: "CREATE_BRANCH",
      entity: "BRANCH",
      userId: req.user._id,
      libraryId,
      details: `Created branch ${branch.branchName}`
    });

    return res.status(201).json({
      success: true,
      message: "Branch Created Successfully",
      data: branch
    });
  } catch (error) {
    console.error("Branch creation error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBranches = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, status, city, sort } = req.query;

    const filter = { libraryId }; // Isolation

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (status) {
      filter.status = status;
    }
    if (city) {
      filter.city = city;
    }

    let sortObj = { createdAt: -1 };
    if (sort) {
      sortObj = { [sort]: -1 };
    }

    const branches = await branchService.getBranches(filter, skip, limit, sortObj);
    const total = await branchService.getBranchCount(filter);

    return res.json({
      success: true,
      data: branches,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Error in getBranches:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBranchById = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const branch = await branchService.getBranchById(req.params.id, libraryId);
    
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch Not Found" });
    }
    
    return res.json({ success: true, data: branch });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateBranch = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const allowedUpdates = ["name", "phone", "address", "city", "state", "managerId", "email"];
    const updateData = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'address' && typeof req.body.address === 'string') {
          updateData.address = { addressLine1: req.body.address };
        } else {
          updateData[key] = req.body[key];
        }
      }
    });

    const branch = await branchService.updateBranch(req.params.id, libraryId, updateData);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch Not Found" });
    }

    await AuditLog.create({
      action: "UPDATE_BRANCH",
      entity: "BRANCH",
      userId: req.user._id,
      libraryId,
      details: `Updated branch ${branch.branchName || branch.name}`
    });

    return res.json({ success: true, data: branch });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const branch = await branchService.deleteBranch(req.params.id, libraryId);
    
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch Not Found" });
    }

    await AuditLog.create({
      action: "DELETE_BRANCH",
      entity: "BRANCH",
      userId: req.user._id,
      libraryId,
      details: `Deleted branch ${branch.branchName || branch.name}`
    });

    return res.json({ success: true, message: "Branch Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const restoreBranch = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const branch = await branchService.restoreBranch(req.params.id, libraryId);
    
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch Not Found" });
    }

    await AuditLog.create({
      action: "RESTORE_BRANCH",
      entity: "BRANCH",
      userId: req.user._id,
      libraryId,
      details: `Restored branch ${branch.branchName || branch.name}`
    });

    return res.json({ success: true, message: "Branch Restored Successfully", data: branch });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBranchDashboard = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const dashboard = await branchService.getBranchDashboard(req.params.id, libraryId);
    return res.json({ success: true, data: dashboard });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  restoreBranch,
  getBranchDashboard
};
