const Member = require("../models/Member");

exports.generateMemberCode = async (libraryId) => {
  const currentYear = new Date().getFullYear();
  const prefix = `LIB-${currentYear}-`;

  // Find the highest member code for this library and year
  const lastMember = await Member.findOne({ 
    libraryId, 
    memberCode: { $regex: `^${prefix}` } 
  }).sort({ memberCode: -1 });

  let sequenceNumber = 1;
  if (lastMember && lastMember.memberCode) {
    const lastSequence = parseInt(lastMember.memberCode.split("-")[2], 10);
    if (!isNaN(lastSequence)) {
      sequenceNumber = lastSequence + 1;
    }
  }

  // Format as 6-digit zero-padded number
  const paddedSequence = sequenceNumber.toString().padStart(6, "0");
  return `${prefix}${paddedSequence}`;
};
