const Usage = require("../models/Usage");

const incrementUsers = async (libraryId, count = 1) => {
  return await Usage.findOneAndUpdate(
    { libraryId },
    { $inc: { usersCount: count } },
    { new: true, upsert: true }
  );
};

const incrementBooks = async (libraryId, count = 1) => {
  return await Usage.findOneAndUpdate(
    { libraryId },
    { $inc: { booksCount: count } },
    { new: true, upsert: true }
  );
};

const incrementBranches = async (libraryId, count = 1) => {
  return await Usage.findOneAndUpdate(
    { libraryId },
    { $inc: { branchesCount: count } },
    { new: true, upsert: true }
  );
};

const incrementStorage = async (libraryId, sizeMb) => {
  return await Usage.findOneAndUpdate(
    { libraryId },
    { $inc: { storageUsed: sizeMb } },
    { new: true, upsert: true }
  );
};

module.exports = {
  incrementUsers,
  incrementBooks,
  incrementBranches,
  incrementStorage
};
