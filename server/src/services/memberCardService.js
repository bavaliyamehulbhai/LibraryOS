const MemberCard = require("../models/MemberCard");
const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const bwipjs = require("bwip-js");
const qrcode = require("qrcode");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateMemberCardNumber = async (libraryId) => {
  // Simple generator: LIB-{YEAR}-{6 digit sequence}
  const year = new Date().getFullYear();
  const count = await MemberCard.countDocuments({ libraryId }) + 1;
  const sequence = count.toString().padStart(6, "0");
  return `LIB-${year}-${sequence}`;
};

const generateBarcodeBase64 = (text) => {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'code128',       // Barcode type
      text: text,            // Text to encode
      scale: 3,              // 3x scaling factor
      height: 10,            // Bar height, in millimeters
      includetext: true,     // Show human-readable text
      textxalign: 'center',  // Always good to set this
    }, (err, png) => {
      if (err) {
        reject(err);
      } else {
        resolve(`data:image/png;base64,${png.toString('base64')}`);
      }
    });
  });
};

const generateQRBase64 = async (data) => {
  try {
    return await qrcode.toDataURL(JSON.stringify(data));
  } catch (err) {
    throw err;
  }
};

const getExpiryDate = (planType) => {
  const expiry = new Date();
  switch (planType) {
    case 'STUDENT':
      expiry.setFullYear(expiry.getFullYear() + 1); // 1 Year
      break;
    case 'FACULTY':
    case 'TEACHER':
      expiry.setFullYear(expiry.getFullYear() + 5); // 5 Years
      break;
    case 'GUEST':
      expiry.setDate(expiry.getDate() + 30); // 30 Days
      break;
    case 'PREMIUM':
      expiry.setFullYear(expiry.getFullYear() + 2); // 2 Years
      break;
    default:
      expiry.setFullYear(expiry.getFullYear() + 1);
  }
  return expiry;
};

exports.generateCard = async (libraryId, memberId) => {
  const member = await Member.findOne({ _id: memberId, libraryId }).populate("membershipPlanId");
  if (!member) throw new Error("Member not found");

  // Deactivate existing active cards
  await MemberCard.updateMany(
    { memberId, libraryId, status: "ACTIVE" },
    { $set: { status: "EXPIRED" } }
  );

  const cardNumber = await this.generateMemberCardNumber(libraryId);
  const barcodeBase64 = await generateBarcodeBase64(cardNumber);
  
  const qrData = {
    memberId: member._id,
    memberCode: member.memberCode,
    cardNumber: cardNumber
  };
  const qrCodeBase64 = await generateQRBase64(qrData);

  let planType = "STUDENT";
  if (member.membershipPlanId) {
    planType = member.membershipPlanId.planType;
  }
  const expiryDate = getExpiryDate(planType);

  const card = await MemberCard.create({
    libraryId,
    memberId,
    cardNumber,
    barcode: barcodeBase64,
    qrCode: qrCodeBase64,
    expiryDate
  });

  // Update Member record
  member.memberCardNumber = cardNumber;
  member.barcode = barcodeBase64;
  member.qrCode = qrCodeBase64;
  member.cardIssuedDate = card.issueDate;
  member.cardExpiryDate = expiryDate;
  await member.save();

  return card;
};

exports.getCards = async (libraryId, filters = {}) => {
  return await MemberCard.find({ libraryId, ...filters })
    .populate("memberId", "firstName lastName memberCode email profileImage")
    .sort({ createdAt: -1 });
};

exports.getCardById = async (libraryId, id) => {
  const card = await MemberCard.findOne({ _id: id, libraryId }).populate({
    path: "memberId",
    populate: { path: "membershipPlanId" }
  });
  if (!card) throw new Error("Card not found");
  return card;
};

exports.verifyCard = async (libraryId, cardNumber) => {
  const card = await MemberCard.findOne({ cardNumber, libraryId });
  if (!card) {
    return { valid: false, reason: "Card not found" };
  }
  if (card.status !== "ACTIVE") {
    return { valid: false, reason: `Card is currently ${card.status}` };
  }
  if (new Date() > card.expiryDate) {
    // Auto expire
    card.status = "EXPIRED";
    await card.save();
    return { valid: false, reason: "Card has expired" };
  }
  return { valid: true, card };
};

exports.reportLost = async (libraryId, id) => {
  const card = await MemberCard.findOneAndUpdate(
    { _id: id, libraryId },
    { $set: { status: "LOST" } },
    { new: true }
  );
  if (!card) throw new Error("Card not found");
  return card;
};

exports.replaceCard = async (libraryId, id) => {
  const oldCard = await MemberCard.findOne({ _id: id, libraryId });
  if (!oldCard) throw new Error("Card not found");

  oldCard.status = "LOST"; // Ensure old is deactivated
  await oldCard.save();

  return await this.generateCard(libraryId, oldCard.memberId);
};

exports.getAnalytics = async (libraryId) => {
  const totalCards = await MemberCard.countDocuments({ libraryId });
  const activeCards = await MemberCard.countDocuments({ libraryId, status: "ACTIVE" });
  const expiredCards = await MemberCard.countDocuments({ libraryId, status: "EXPIRED" });
  const lostCards = await MemberCard.countDocuments({ libraryId, status: "LOST" });

  return { totalCards, activeCards, expiredCards, lostCards };
};

exports.printCardToPDF = async (libraryId, id) => {
  const card = await this.getCardById(libraryId, id);
  const member = card.memberId;
  const planName = member.membershipPlanId ? member.membershipPlanId.name : "N/A";

  return new Promise((resolve, reject) => {
    try {
      // Standard CR80 card size (3.375 x 2.125 inches) -> points (1 inch = 72 points)
      // width: 243, height: 153
      // We'll create a 2-page document (Front & Back)
      const doc = new PDFDocument({
        size: [243, 153],
        margins: { top: 10, bottom: 10, left: 10, right: 10 }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- Front Side ---
      doc.rect(0, 0, 243, 153).fill('#ffffff'); // white background
      
      // Header Ribbon
      doc.rect(0, 0, 243, 30).fill('#2563eb');
      doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold').text('LibraryOS', 10, 10);
      
      // Photo placeholder (Left side)
      doc.rect(10, 40, 60, 75).fill('#e5e7eb');
      doc.fillColor('#9ca3af').fontSize(8).font('Helvetica').text('PHOTO', 25, 75);

      // Details (Right side)
      doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold').text(`${member.firstName} ${member.lastName}`, 80, 45);
      doc.fillColor('#4b5563').fontSize(9).font('Helvetica').text(`ID: ${member.memberCode}`, 80, 60);
      doc.fillColor('#4b5563').fontSize(9).text(`Plan: ${planName}`, 80, 72);
      
      // Barcode
      if (card.barcode) {
        const barcodeBuffer = Buffer.from(card.barcode.split(',')[1], 'base64');
        doc.image(barcodeBuffer, 80, 95, { width: 140, height: 25 });
      }

      doc.addPage();

      // --- Back Side ---
      doc.rect(0, 0, 243, 153).fill('#ffffff');
      doc.rect(0, 0, 243, 20).fill('#1f2937'); // dark header
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('If found, please return to the library.', 10, 6, { align: 'center' });

      // QR Code
      if (card.qrCode) {
        const qrBuffer = Buffer.from(card.qrCode.split(',')[1], 'base64');
        doc.image(qrBuffer, 10, 30, { width: 60, height: 60 });
      }

      doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold').text('Terms & Conditions', 80, 30);
      doc.fillColor('#4b5563').fontSize(6).font('Helvetica')
         .text('1. This card is non-transferable.', 80, 45)
         .text('2. The cardholder is responsible for all materials borrowed.', 80, 55)
         .text('3. Report lost cards immediately.', 80, 65);

      doc.fillColor('#ef4444').fontSize(8).font('Helvetica-Bold').text(`Expires: ${new Date(card.expiryDate).toLocaleDateString()}`, 80, 85);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
