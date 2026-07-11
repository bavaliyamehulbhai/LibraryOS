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
  const query = { _id: id };
  if (libraryId) query.libraryId = libraryId;
  return await Branch.findOne(query)
    .populate("managerId", "name email")
    .lean();
};

const updateBranch = async (id, libraryId, updateData) => {
  const query = { _id: id };
  if (libraryId) query.libraryId = libraryId;
  return await Branch.findOneAndUpdate(
    query,
    updateData,
    { new: true, runValidators: true }
  );
};

const deleteBranch = async (id, libraryId) => {
  const query = { _id: id };
  if (libraryId) query.libraryId = libraryId;
  return await Branch.findOneAndUpdate(
    query,
    { isActive: false, status: "INACTIVE" },
    { new: true }
  );
};

const restoreBranch = async (id, libraryId) => {
  const query = { _id: id };
  if (libraryId) query.libraryId = libraryId;
  return await Branch.findOneAndUpdate(
    query,
    { isActive: true, status: "ACTIVE" },
    { new: true }
  );
};

const getBranchDashboard = async (id, libraryId) => {
  const mongoose = require("mongoose");
  const BookCopy = require("../models/BookCopy");
  const Member = require("../models/Member");
  const User = require("../models/User");
  
  const query = { branchId: id };
  if (libraryId) query.libraryId = libraryId;
  
  const booksCount = await BookCopy.countDocuments(query);
  const membersCount = await Member.countDocuments(query);
  const staffCount = await User.countDocuments(query);
  
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
