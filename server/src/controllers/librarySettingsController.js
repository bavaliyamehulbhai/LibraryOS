const LibrarySettings = require("../models/LibrarySettings");

exports.getSettings = async (req, res) => {
  try {
    let settings = await LibrarySettings.findOne({ libraryId: req.user.libraryId });
    if (!settings) {
      // Return default settings if none exist yet
      settings = new LibrarySettings({ libraryId: req.user.libraryId });
      await settings.save();
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { language, timezone, currency, branding, features, billing } = req.body;
    
    let settings = await LibrarySettings.findOne({ libraryId: req.user.libraryId });
    if (!settings) {
      settings = new LibrarySettings({ libraryId: req.user.libraryId });
    }

    if (language) settings.language = language;
    if (timezone) settings.timezone = timezone;
    if (currency) settings.currency = currency;
    
    if (branding) {
      if (branding.logo !== undefined) settings.branding.logo = branding.logo;
      if (branding.primaryColor !== undefined) settings.branding.primaryColor = branding.primaryColor;
      if (branding.theme !== undefined) settings.branding.theme = branding.theme;
      if (branding.libraryNameAlias !== undefined) settings.branding.libraryNameAlias = branding.libraryNameAlias;
    }

    if (features) {
      if (features.whatsappEnabled !== undefined) settings.features.whatsappEnabled = features.whatsappEnabled;
      if (features.apiAccess !== undefined) settings.features.apiAccess = features.apiAccess;
      if (features.customDomain !== undefined) settings.features.customDomain = features.customDomain;
    }

    if (billing) {
      if (billing.billingEmail !== undefined) settings.billing.billingEmail = billing.billingEmail;
      if (billing.gstNumber !== undefined) settings.billing.gstNumber = billing.gstNumber;
    }

    await settings.save();
    res.status(200).json({ success: true, data: settings, message: "Settings updated successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
