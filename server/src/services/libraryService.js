const mongoose = require("mongoose");
const Library = require("../models/Library");
const User = require("../models/User");
const LibrarySetting = require("../models/LibrarySetting");
const Subscription = require("../models/Subscription");
const AuditLog = require("../models/AuditLog");

/**
 * Creates a new library with transaction
 */
const createLibrary = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingLibrary = await Library.findOne({ email: data.email }).session(session);
    if (existingLibrary) {
      throw new Error("Library Already Exists");
    }

    const library = new Library({
      name: data.name,
      code: data.code,
      email: data.email,
      phone: data.phone || "0000000000",
      address: data.address || data.city || "Pending",
      city: data.city || "Pending",
      state: data.state || "Pending",
      pincode: data.pincode || "000000",
      createdBy: data.createdBy,
      status: "TRIAL",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      isActive: true,
      onboardingCompleted: true
    });
    await library.save({ session });

    const adminUser = new User({
      name: data.adminName,
      email: data.adminEmail,
      password: "Password123!",
      role: "LIBRARY_ADMIN",
      libraryId: library._id,
      emailVerified: true
    });
    await adminUser.save({ session });

    library.ownerId = adminUser._id;
    await library.save({ session });

    const Organization = require("../models/Organization");
    const orgCount = await Organization.countDocuments();
    const organizationCode = `ORG-${String(orgCount + 1).padStart(6, '0')}`;
    const organization = new Organization({
      libraryId: library._id,
      organizationCode,
      name: data.name,
      email: data.email,
      phone: data.phone || "0000000000",
      status: "ACTIVE"
    });
    await organization.save({ session });

    await LibrarySetting.create([{
      libraryId: library._id,
      finePerDay: 5,
      maxBorrowDays: 14
    }], { session });

    // Ensure a free plan exists (find or create)
    const Plan = require("../models/Plan");
    let freePlan = await Plan.findOne({ planCode: "PLAN-FREE" }).session(session);
    if (!freePlan) {
      freePlan = new Plan({
        planCode: "PLAN-FREE",
        planName: "Free Plan",
        price: 0,
        billingCycle: "YEARLY",
        maxBooks: 500,
        maxMembers: 100,
        maxBranches: 1,
        status: "ACTIVE"
      });
      await freePlan.save({ session });
    }

    const subscription = new Subscription({
      libraryId: library._id,
      planId: freePlan._id,
      status: "ACTIVE",
      startDate: new Date(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      autoRenew: false
    });
    await subscription.save({ session });
    
    library.subscriptionId = subscription._id;
    await library.save({ session });

    const Usage = require("../models/Usage");
    await Usage.create([{
      libraryId: library._id,
      usersCount: 1, // the admin user
      booksCount: 0,
      branchesCount: 0,
      storageUsed: 0
    }], { session });

    await AuditLog.create([{
      libraryId: library._id,
      action: "CREATE_LIBRARY",
      entity: "LIBRARY",
      userId: data.createdBy,
      details: `Created ${library.name}`
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return library;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get a list of all libraries with filters, pagination, and sorting
 */
const getLibraries = async (filter, skip, limit, sortObj) => {
  return await Library.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sortObj)
    .populate("ownerId", "name email")
    .populate({
      path: "subscriptionId",
      populate: { path: "planId", select: "planName planCode" }
    })
    .lean();
};

/**
 * Get total count for pagination
 */
const getLibraryCount = async (filter) => {
  return await Library.countDocuments(filter);
};

/**
 * Get a library by its ID
 */
const getLibraryById = async (id) => {
  return await Library.findById(id)
    .populate("ownerId", "name email")
    .populate({
      path: "subscriptionId",
      populate: { path: "planId", select: "planName planCode" }
    })
    .lean();
};

/**
 * Update a library by ID
 */
const updateLibrary = async (id, updateData) => {
  return await Library.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Delete a library (hard delete)
 */
const deleteLibrary = async (id) => {
  const library = await Library.findById(id);
  if (!library) return null;

  // Hard delete related entities to free up unique constraints (emails, codes, etc)
  const mongoose = require("mongoose");
  await mongoose.model("User").deleteMany({ libraryId: id });
  await mongoose.model("Branch").deleteMany({ libraryId: id });
  await mongoose.model("LibrarySetting").deleteMany({ libraryId: id });
  await mongoose.model("Organization").deleteMany({ libraryId: id });

  return await Library.findByIdAndDelete(id);
};

/**
 * Restore a library
 */
const restoreLibrary = async (id) => {
  return await Library.findByIdAndUpdate(id, { isActive: true, status: "ACTIVE" }, { new: true });
};

module.exports = {
  createLibrary,
  getLibraries,
  getLibraryCount,
  getLibraryById,
  updateLibrary,
  deleteLibrary,
  restoreLibrary
};
