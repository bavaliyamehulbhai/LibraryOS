const LibrarySetting = require("../models/LibrarySetting");

const getSettings = async (libraryId) => {
  let settings = await LibrarySetting.findOne({ libraryId });
  if (!settings) {
    settings = await LibrarySetting.create({ libraryId });
  }
  return settings;
};

const updateSettings = async (libraryId, updateData) => {
  return await LibrarySetting.findOneAndUpdate(
    { libraryId },
    { $set: updateData },
    { new: true, upsert: true }
  );
};

module.exports = { getSettings, updateSettings };
