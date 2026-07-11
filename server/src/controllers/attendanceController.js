const AttendanceLog = require("../models/AttendanceLog");
const Visitor = require("../models/Visitor");
const User = require("../models/User");

// Member Punch In/Out
exports.punch = async (req, res) => {
  try {
    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({ success: false, message: "Member ID is required" });
    }

    // Find user by memberId (this could be email, student ID, or object ID depending on your system)
    // Here we assume memberId is either _id or a unique identifier (like library card number).
    // Let's check by _id or email for flexibility.
    let user;
    if (memberId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(memberId);
    } 
    if (!user) {
      user = await User.findOne({ email: memberId });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    const libraryId = user.libraryId || req.user.libraryId;

    // Check if there is an active IN session
    const activeSession = await AttendanceLog.findOne({
      user: user._id,
      libraryId,
      status: "IN"
    });

    if (activeSession) {
      // Punch OUT
      activeSession.exitTime = new Date();
      activeSession.status = "OUT";
      // Calculate duration in minutes
      activeSession.durationMinutes = Math.round((activeSession.exitTime - activeSession.entryTime) / 60000);
      await activeSession.save();

      return res.json({ 
        success: true, 
        action: "OUT", 
        message: `Goodbye, ${user.firstName}! Have a great day.`,
        user: { name: `${user.firstName} ${user.lastName}`, id: user._id },
        durationMinutes: activeSession.durationMinutes
      });
    } else {
      // Punch IN
      await AttendanceLog.create({
        user: user._id,
        libraryId,
        status: "IN"
      });

      return res.json({ 
        success: true, 
        action: "IN", 
        message: `Welcome, ${user.firstName}!`,
        user: { name: `${user.firstName} ${user.lastName}`, id: user._id }
      });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActive = async (req, res) => {
  try {
    const libraryId = req.user.libraryId;
    
    const activeMembers = await AttendanceLog.find({ libraryId, status: "IN" })
      .populate("user", "firstName lastName email role profilePicture")
      .sort({ entryTime: -1 });
      
    const activeVisitors = await Visitor.find({ libraryId, status: "IN" })
      .sort({ entryTime: -1 });

    res.json({ 
      success: true, 
      data: {
        members: activeMembers,
        visitors: activeVisitors,
        totalActive: activeMembers.length + activeVisitors.length
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.registerVisitor = async (req, res) => {
  try {
    const { name, phone, purpose, idProof, idNumber } = req.body;
    const libraryId = req.user.libraryId;

    if (!name || !phone || !purpose) {
      return res.status(400).json({ success: false, message: "Name, phone, and purpose are required" });
    }

    const visitor = await Visitor.create({
      name, phone, purpose, idProof, idNumber, libraryId, status: "IN"
    });

    res.json({ success: true, message: `Visitor ${name} punched in successfully!`, data: visitor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.punchOutVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findById(id);
    if (!visitor || visitor.status === "OUT") {
      return res.status(400).json({ success: false, message: "Visitor not found or already punched out" });
    }

    visitor.exitTime = new Date();
    visitor.status = "OUT";
    visitor.durationMinutes = Math.round((visitor.exitTime - visitor.entryTime) / 60000);
    await visitor.save();

    res.json({ success: true, message: "Visitor punched out successfully", data: visitor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
