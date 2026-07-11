const MemberCard = require("../models/MemberCard");
const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const Library = require("../models/Library");
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
      includetext: false,    // Do not show human-readable text (prevents clipping)
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
    const textData = typeof data === 'string' ? data : JSON.stringify(data);
    return await qrcode.toDataURL(textData);
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
  
  const library = await Library.findById(libraryId);
  const qrDataText = `Library: ${library ? library.name : 'LibraryOS'}
Member: ${member.firstName} ${member.lastName}
ID: ${member.memberCode}
Card: ${cardNumber}
Plan: ${member.membershipPlanId?.name || 'N/A'}
Expires: ${getExpiryDate(member.membershipPlanId?.planType).toLocaleDateString()}`;
  const qrCodeBase64 = await generateQRBase64(qrDataText);

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
  const card = await MemberCard.findOne({ _id: id, libraryId })
    .populate({
      path: "memberId",
      populate: { path: "membershipPlanId" }
    })
    .populate("libraryId", "name");
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

  let freshBarcode, freshQr;
  try {
    freshBarcode = await generateBarcodeBase64(card.cardNumber);
    const qrDataText = `Library: ${card.libraryId?.name || 'LibraryOS'}
Member: ${member.firstName} ${member.lastName}
ID: ${member.memberCode}
Card: ${card.cardNumber}
Plan: ${planName}
Expires: ${new Date(card.expiryDate).toLocaleDateString()}`;
    freshQr = await generateQRBase64(qrDataText);
  } catch (e) {
    console.error("Failed generating images for PDF", e);
  }

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
      doc.save();
      // Draw rounded rectangle for clipping (radius 10)
      doc.roundedRect(0, 0, 243, 153, 10).clip();
      
      doc.rect(0, 0, 243, 153).fill('#ffffff'); // white background

      // Header Ribbon
      doc.rect(0, 0, 243, 40).fill('#3b82f6'); 
      doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('LibraryOS', 15, 12);
      doc.fillColor('#eff6ff').fontSize(7).font('Helvetica-Bold').text('MEMBER ID', 180, 16);

      // Photo placeholder (Left side)
      const initial = member.firstName ? member.firstName.charAt(0).toUpperCase() : '?';
      doc.roundedRect(15, 50, 45, 45, 5).fill('#e0e7ff'); 
      doc.fillColor('#6366f1').fontSize(26).font('Helvetica-Bold').text(initial, 15, 62, { width: 45, align: 'center' });

      // QR Code (Bottom Left)
      if (freshQr && freshQr.includes(',')) {
        const qrBuffer = Buffer.from(freshQr.split(',')[1], 'base64');
        doc.image(qrBuffer, 15, 100, { width: 45, height: 45 });
      }

      // Details (Right side)
      doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold').text(`${member.firstName} ${member.lastName}`.toUpperCase(), 75, 50);
      doc.fillColor('#4f46e5').fontSize(7).font('Helvetica-Bold').text(planName.toUpperCase(), 75, 65);
      
      doc.fillColor('#9ca3af').fontSize(7).font('Helvetica-Bold').text('ID:', 75, 80);
      doc.fillColor('#4b5563').fontSize(7).font('Helvetica').text(member.memberCode, 115, 80);
      
      doc.fillColor('#9ca3af').fontSize(7).font('Helvetica-Bold').text('ISSUED:', 75, 90);
      doc.fillColor('#4b5563').fontSize(7).font('Helvetica').text(new Date(card.issueDate).toLocaleDateString(), 115, 90);

      doc.fillColor('#9ca3af').fontSize(7).font('Helvetica-Bold').text('EXPIRES:', 75, 100);
      doc.fillColor('#4b5563').fontSize(7).font('Helvetica').text(new Date(card.expiryDate).toLocaleDateString(), 115, 100);

      // Barcode (Bottom Right)
      if (freshBarcode && freshBarcode.includes(',')) {
        const barcodeBuffer = Buffer.from(freshBarcode.split(',')[1], 'base64');
        doc.image(barcodeBuffer, 125, 115, { width: 105, height: 25 });
      }

      doc.restore();

      doc.addPage();

      // --- Back Side ---
      doc.save();
      doc.roundedRect(0, 0, 243, 153, 10).clip();

      doc.rect(0, 0, 243, 153).fill('#ffffff');
      doc.rect(0, 0, 243, 20).fill('#1f2937'); // dark header
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('If found, please return to the library.', 10, 6, { align: 'center' });

      doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold').text('Terms & Conditions', 25, 35);
      
      doc.fillColor('#4b5563').fontSize(6).font('Helvetica');
      doc.text('1. This card is non-transferable.', 25, 50, { width: 190 });
      doc.text('2. The cardholder is responsible for all materials borrowed.', { width: 190 });
      doc.text('3. Report lost cards immediately.', { width: 190 });

      doc.fillColor('#ef4444').fontSize(8).font('Helvetica-Bold').text(`Expires: ${new Date(card.expiryDate).toLocaleDateString()}`, 25, 120);

      doc.restore();

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
