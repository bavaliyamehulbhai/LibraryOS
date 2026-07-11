const mongoose = require("mongoose");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");
const Fine = require("../models/Fine");
const MembershipPlan = require("../models/MembershipPlan");
const { generateMemberCode } = require("./memberCodeService");

exports.createMember = async (libraryId, memberData) => {
  const existing = await Member.findOne({ libraryId, email: memberData.email });
  if (existing) {
    throw new Error(`Email ${memberData.email} already exists in this library.`);
  }

  if (memberData.membershipPlanId) {
    const plan = await MembershipPlan.findOne({ _id: memberData.membershipPlanId, libraryId });
    if (!plan) throw new Error("Invalid Membership Plan");
  }

  const memberCode = await generateMemberCode(libraryId);

  const member = await Member.create({
    ...memberData,
    memberCode,
    libraryId
  });

  return member;
};

exports.updateMember = async (libraryId, id, updateData) => {
  const member = await Member.findOneAndUpdate(
    { _id: id, libraryId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!member) throw new Error("Member not found");
  return member;
};

exports.getMemberHistory = async (libraryId, memberId) => {
  const member = await Member.findOne({ _id: memberId, libraryId }).populate('membershipPlanId');
  if (!member) throw new Error("Member not found");

  const transactions = await Transaction.find({ libraryId, memberId })
    .populate('bookId', 'title isbn')
    .populate('bookCopyId', 'barcode')
    .sort({ createdAt: -1 });

  const fines = await Fine.find({ libraryId, memberId }).sort({ createdAt: -1 });

  return {
    member,
    transactions,
    fines,
    stats: {
      totalFines: member.totalFines,
      activeCheckouts: member.activeCheckouts
    }
  };
};

exports.getAllMembers = async (libraryId, query = {}) => {
  const { search, status, memberType, page = 1, limit = 20, sort = '-createdAt' } = query;
  const filter = { libraryId };

  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { memberCode: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') }
    ];
  }

  if (status) filter.status = status;
  if (memberType) filter.memberType = memberType;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [data, total] = await Promise.all([
    Member.find(filter)
      .populate('membershipPlanId', 'name maxBooksAllowed')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Member.countDocuments(filter)
  ]);

  return {
    data,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit))
  };
};

exports.getMemberById = async (libraryId, id) => {
  const member = await Member.findOne({ _id: id, libraryId }).populate('membershipPlanId');
  if (!member) throw new Error("Member not found");
  return member;
};

exports.updateMemberStatus = async (libraryId, id, status) => {
  const validStatuses = ["ACTIVE", "INACTIVE", "BLOCKED", "SUSPENDED"];
  if (!validStatuses.includes(status)) throw new Error("Invalid status");

  const member = await Member.findOneAndUpdate(
    { _id: id, libraryId },
    { $set: { status } },
    { new: true }
  );
  if (!member) throw new Error("Member not found");
  return member;
};

exports.verifyMember = async (libraryId, id) => {
  const member = await Member.findOneAndUpdate(
    { _id: id, libraryId },
    { $set: { isVerified: true } },
    { new: true }
  );
  if (!member) throw new Error("Member not found");
  return member;
};

exports.getMemberAnalytics = async (libraryId) => {
  let libId;
  try {
    libId = new mongoose.Types.ObjectId(libraryId.toString());
  } catch (e) {
    libId = libraryId; // Fallback if it's already a valid query object
  }

  let typeBreakdown = [];
  try {
    typeBreakdown = await Member.aggregate([
      { $match: { libraryId: libId } },
      { $group: { _id: "$memberType", value: { $sum: 1 } } },
      { $project: { name: { $ifNull: ["$_id", "Standard"] }, value: 1, _id: 0 } }
    ]);
  } catch (err) {
    console.error("Aggregation error in member analytics:", err);
  }

  const [total, active, blocked, recent] = await Promise.all([
    Member.countDocuments({ libraryId }),
    Member.countDocuments({ libraryId, status: "ACTIVE" }),
    Member.countDocuments({ libraryId, status: "BLOCKED" }),
    Member.countDocuments({ libraryId, createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } })
  ]);
  
  const inactive = total - active - blocked;
  
  return { total, active, blocked, inactive, recent, typeBreakdown };
};
