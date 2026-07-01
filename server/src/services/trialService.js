const Trial = require("../models/Trial");
const TrialExtension = require("../models/TrialExtension");
const UsageTracking = require("../models/UsageTracking");
const Subscription = require("../models/Subscription");

exports.activateTrial = async (libraryId, trialDays = 14) => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + trialDays);

  const trial = new Trial({
    libraryId,
    startDate,
    endDate,
    trialDays,
    status: "ACTIVE"
  });

  await trial.save();
  return trial;
};

exports.getTrialStatus = async (libraryId) => {
  const trial = await Trial.findOne({ libraryId });
  if (!trial) return null;

  const now = new Date();
  const diffTime = trial.endDate - now;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Calculate Lead Score dynamically
  const usage = await UsageTracking.findOne({ libraryId });
  let leadScore = 0;
  if (usage) {
    leadScore += (usage.booksUsed > 0 ? Math.min(usage.booksUsed, 100) * 0.1 : 0); // up to 10 points for books
    leadScore += (usage.membersUsed > 0 ? Math.min(usage.membersUsed, 100) * 0.1 : 0); // up to 10 points for members
    
    // Add extra arbitrary points based on general engagement
    if (usage.booksUsed > 50 && usage.membersUsed > 20) {
      leadScore += 30;
    }
    leadScore = Math.min(Math.round(leadScore), 100);
  }

  // Update snapshot in DB for analytics queries
  if (trial.leadScore !== leadScore) {
    trial.leadScore = leadScore;
    await trial.save();
  }

  return {
    trial,
    daysLeft: daysLeft > 0 ? daysLeft : 0,
    leadScore
  };
};

exports.extendTrial = async (libraryId, daysAdded, adminUserId, reason) => {
  const trial = await Trial.findOne({ libraryId });
  if (!trial) throw new Error("Trial not found");

  const newEndDate = new Date(trial.endDate);
  newEndDate.setDate(newEndDate.getDate() + daysAdded);
  trial.endDate = newEndDate;
  trial.trialDays += daysAdded;
  trial.status = "ACTIVE"; // Reactivate if it was expired
  await trial.save();

  // Create extension record
  await TrialExtension.create({
    trialId: trial._id,
    extendedBy: adminUserId,
    reason,
    daysAdded
  });

  // Also push subscription expiry if applicable
  await Subscription.findOneAndUpdate(
    { libraryId, status: "TRIAL" },
    { expiryDate: newEndDate }
  );

  return trial;
};

exports.convertTrial = async (libraryId) => {
  const trial = await Trial.findOneAndUpdate(
    { libraryId },
    { status: "CONVERTED", convertedAt: new Date() },
    { new: true }
  );
  return trial;
};

exports.processExpiries = async () => {
  const now = new Date();
  const expiredTrials = await Trial.find({ 
    endDate: { $lt: now },
    status: "ACTIVE" 
  });

  for (let trial of expiredTrials) {
    trial.status = "EXPIRED";
    await trial.save();
    // Notification Service hook would trigger here
  }
};
