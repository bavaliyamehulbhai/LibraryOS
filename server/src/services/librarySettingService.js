const LibrarySetting = require("../models/LibrarySetting");

const getSettings = async (libraryId) => {
  let settings = await LibrarySetting.findOne({ libraryId }).lean();
  if (!settings) {
    // Should exist from Phase 2, but fallback
    settings = await LibrarySetting.create({ libraryId });
  }
  return settings;
};

const updateSettings = async (libraryId, updateData) => {
  return await LibrarySetting.findOneAndUpdate(
    { libraryId },
    updateData,
    { new: true, runValidators: true, upsert: true }
  );
};

module.exports = {
  getSettings,
  updateSettings
};
