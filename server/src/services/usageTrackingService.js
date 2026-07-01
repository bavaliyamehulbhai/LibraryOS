const Book = require("../models/Book");
const Member = require("../models/Member");
const Subscription = require("../models/Subscription");

/**
 * Helper to fetch the current active limits for a library
 */
const getLibraryLimits = async (libraryId) => {
  const subscription = await Subscription.findOne({ libraryId, status: "ACTIVE" }).populate("planId");
  
  if (!subscription || !subscription.planId) {
    // Fallback to strict defaults if no active subscription
    return {
      maxBooks: 50,
      maxMembers: 10,
      maxStorageMB: 10
    };
  }
  
  return {
    maxBooks: subscription.planId.maxBooks,
    maxMembers: subscription.planId.maxMembers,
    maxStorageMB: subscription.planId.maxStorageMB
  };
};

exports.checkBookLimit = async (libraryId) => {
  const limits = await getLibraryLimits(libraryId);
  if (limits.maxBooks === -1) return true; // Unlimited

  const currentBooks = await Book.countDocuments({ libraryId });
  if (currentBooks >= limits.maxBooks) {
    throw new Error(`Plan limit reached! You can only add up to ${limits.maxBooks} books. Please upgrade your plan.`);
  }
  
  return true;
};

exports.checkMemberLimit = async (libraryId) => {
  const limits = await getLibraryLimits(libraryId);
  if (limits.maxMembers === -1) return true; // Unlimited

  const currentMembers = await Member.countDocuments({ libraryId });
  if (currentMembers >= limits.maxMembers) {
    throw new Error(`Plan limit reached! You can only add up to ${limits.maxMembers} members. Please upgrade your plan.`);
  }
  
  return true;
};

exports.getUsageOverview = async (libraryId) => {
  const limits = await getLibraryLimits(libraryId);
  
  const currentBooks = await Book.countDocuments({ libraryId });
  const currentMembers = await Member.countDocuments({ libraryId });
  
  // Storage logic is mocked for phase 12
  const currentStorage = 0; 
  
  return {
    books: {
      used: currentBooks,
      limit: limits.maxBooks,
      percentage: limits.maxBooks === -1 ? 0 : Math.round((currentBooks / limits.maxBooks) * 100)
    },
    members: {
      used: currentMembers,
      limit: limits.maxMembers,
      percentage: limits.maxMembers === -1 ? 0 : Math.round((currentMembers / limits.maxMembers) * 100)
    },
    storage: {
      used: currentStorage,
      limit: limits.maxStorageMB,
      percentage: limits.maxStorageMB === -1 ? 0 : Math.round((currentStorage / limits.maxStorageMB) * 100)
    }
  };
};
