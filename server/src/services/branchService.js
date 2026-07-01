const Branch = require("../models/Branch");
const BranchSetting = require("../models/BranchSetting");
const mongoose = require("mongoose");

const createBranch = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const branch = new Branch(data);
    await branch.save({ session });

    await BranchSetting.create([{
      branchId: branch._id,
      openingTime: "09:00",
      closingTime: "18:00",
      maxBorrowDays: 14,
      finePerDay: 5
    }], { session });

    await session.commitTransaction();
    session.endSession();
    return branch;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getBranches = async (filter, skip, limit, sortObj) => {
  return await Branch.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sortObj)
    .populate("managerId", "name email")
    .lean();
};

const getBranchCount = async (filter) => {
  return await Branch.countDocuments(filter);
};

const getBranchById = async (id, libraryId) => {
  return await Branch.findOne({ _id: id, libraryId })
    .populate("managerId", "name email")
    .lean();
};

const updateBranch = async (id, libraryId, updateData) => {
  return await Branch.findOneAndUpdate(
    { _id: id, libraryId },
    updateData,
    { new: true, runValidators: true }
  );
};

const deleteBranch = async (id, libraryId) => {
  return await Branch.findOneAndUpdate(
    { _id: id, libraryId },
    { isActive: false, status: "INACTIVE" },
    { new: true }
  );
};

const restoreBranch = async (id, libraryId) => {
  return await Branch.findOneAndUpdate(
    { _id: id, libraryId },
    { isActive: true, status: "ACTIVE" },
    { new: true }
  );
};

const getBranchDashboard = async (id, libraryId) => {
  const mongoose = require("mongoose");
  const BookCopy = require("../models/BookCopy");
  const Member = require("../models/Member");
  const User = require("../models/User");
  
  const booksCount = await BookCopy.countDocuments({ libraryId, branchId: id });
  const membersCount = await Member.countDocuments({ libraryId, branchId: id });
  const staffCount = await User.countDocuments({ libraryId, branchId: id });
  
  // A simplistic revenue placeholder
  const revenue = membersCount * 500; 
  
  return {
    booksCount,
    membersCount,
    staffCount,
    revenue
  };
};

module.exports = {
  createBranch,
  getBranches,
  getBranchCount,
  getBranchById,
  updateBranch,
  deleteBranch,
  restoreBranch,
  getBranchDashboard
};
