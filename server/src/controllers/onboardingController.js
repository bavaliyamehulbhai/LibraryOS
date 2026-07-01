const onboardingService = require("../services/onboardingService");

exports.registerLibrary = async (req, res) => {
  try {
    const { libraryName, adminName, email, phone, password } = req.body;
    
    // Validations
    if (!libraryName || !adminName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    // Call service to orchestrate the entire Zero-Touch onboarding
    const result = await onboardingService.registerLibrary({
      libraryName, adminName, email, phone, password
    });

    res.status(201).json({
      success: true,
      message: "Library registered successfully! Welcome to LibraryOS.",
      data: result
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const status = await onboardingService.getOnboardingStatus(libraryId);
    
    return res.json({
      success: true,
      data: {
        progress: status.completionPercentage,
        currentStep: status.currentStep,
        completedSteps: status.completedSteps
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.completeStep = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    const { stepCompleted, nextStep } = req.body;

    const result = await onboardingService.updateProgress(libraryId, stepCompleted, nextStep);

    res.json({
      success: true,
      message: "Progress updated",
      data: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
