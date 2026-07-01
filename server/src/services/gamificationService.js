const GamificationProfile = require("../models/GamificationProfile");
const User = require("../models/User");

// 500 XP per level
const XP_PER_LEVEL = 500;

exports.getProfile = async (userId, libraryId) => {
  let profile = await GamificationProfile.findOne({ userId }).populate("userId", "name email");
  if (!profile) {
    profile = await GamificationProfile.create({ userId, libraryId });
    profile = await GamificationProfile.findById(profile._id).populate("userId", "name email");
  }
  return profile;
};

exports.addXP = async (userId, libraryId, amount) => {
  const profile = await this.getProfile(userId, libraryId);
  
  profile.xp += amount;
  
  // Calculate level
  const newLevel = Math.floor(profile.xp / XP_PER_LEVEL) + 1;
  let levelUp = false;

  if (newLevel > profile.level) {
    profile.level = newLevel;
    levelUp = true;
  }

  // Update streak logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!profile.lastActiveDate) {
    profile.currentStreak = 1;
    profile.longestStreak = 1;
  } else {
    const lastActive = new Date(profile.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 1) {
      profile.currentStreak += 1;
      if (profile.currentStreak > profile.longestStreak) {
        profile.longestStreak = profile.currentStreak;
      }
    } else if (diffDays > 1) {
      profile.currentStreak = 1; // reset streak
    }
  }
  
  profile.lastActiveDate = new Date();
  
  // Badge Logic (Hardcoded for demo)
  if (amount === 50) { // Assuming 50 XP is a book read
     profile.booksRead += 1;
     
     if (profile.booksRead === 1 && !profile.badges.find(b => b.name === "First Book")) {
        profile.badges.push({ name: "First Book", icon: "📖", description: "Completed first book" });
     }
     if (profile.booksRead === 10 && !profile.badges.find(b => b.name === "Bookworm")) {
        profile.badges.push({ name: "Bookworm", icon: "🐛", description: "Read 10 books" });
     }
  }

  await profile.save();
  return { profile, levelUp };
};

exports.getLeaderboard = async (libraryId) => {
  return await GamificationProfile.find({ libraryId })
    .populate("userId", "name avatar")
    .sort({ xp: -1 })
    .limit(10);
};
