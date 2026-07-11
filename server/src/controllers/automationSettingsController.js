const Library = require("../models/Library");

exports.getSettings = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const library = await Library.findById(libraryId);
    
    if (!library) {
      return res.status(404).json({ success: false, message: "Library not found" });
    }

    res.json({ success: true, data: library.automationSettings || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const { dailyFineAmount, maxFineLimit, enableEmailReminders, enableAutoBlock } = req.body;

    const library = await Library.findById(libraryId);
    if (!library) {
      return res.status(404).json({ success: false, message: "Library not found" });
    }

    library.automationSettings = {
      dailyFineAmount: Number(dailyFineAmount) || library.automationSettings.dailyFineAmount,
      maxFineLimit: Number(maxFineLimit) || library.automationSettings.maxFineLimit,
      enableEmailReminders: enableEmailReminders !== undefined ? enableEmailReminders : library.automationSettings.enableEmailReminders,
      enableAutoBlock: enableAutoBlock !== undefined ? enableAutoBlock : library.automationSettings.enableAutoBlock
    };

    await library.save();

    res.json({ success: true, message: "Automation settings updated successfully", data: library.automationSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
