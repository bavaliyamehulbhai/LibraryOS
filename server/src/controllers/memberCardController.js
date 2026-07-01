const cardService = require("../services/memberCardService");
const auditService = require("../services/auditService");

exports.generateCard = async (req, res) => {
  try {
    const card = await cardService.generateCard(req.user.libraryId, req.body.memberId);
    await auditService.createActivityLog({
      userId: req.user._id,
      action: "CARD_CREATED",
      module: "MEMBER_CARD",
      description: `Generated new ID card ${card.cardNumber}`,
      libraryId: req.user.libraryId
    });
    res.status(201).json({ success: true, data: card });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCards = async (req, res) => {
  try {
    const cards = await cardService.getCards(req.user.libraryId, req.query);
    res.status(200).json({ success: true, data: cards });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCardById = async (req, res) => {
  try {
    const card = await cardService.getCardById(req.user.libraryId, req.params.id);
    res.status(200).json({ success: true, data: card });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.verifyCard = async (req, res) => {
  try {
    const result = await cardService.verifyCard(req.user.libraryId, req.body.cardNumber);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.reportLost = async (req, res) => {
  try {
    const card = await cardService.reportLost(req.user.libraryId, req.params.id);
    await auditService.createActivityLog({
      userId: req.user._id,
      action: "CARD_BLOCKED",
      module: "MEMBER_CARD",
      description: `Reported card ${card.cardNumber} as lost/blocked`,
      libraryId: req.user.libraryId
    });
    res.status(200).json({ success: true, data: card });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.replaceCard = async (req, res) => {
  try {
    const card = await cardService.replaceCard(req.user.libraryId, req.params.id);
    await auditService.createActivityLog({
      userId: req.user._id,
      action: "CARD_REPLACED",
      module: "MEMBER_CARD",
      description: `Issued replacement card ${card.cardNumber}`,
      libraryId: req.user.libraryId
    });
    res.status(200).json({ success: true, data: card });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.printCard = async (req, res) => {
  try {
    const pdfBuffer = await cardService.printCardToPDF(req.user.libraryId, req.params.id);
    
    await auditService.createActivityLog({
      userId: req.user._id,
      action: "CARD_PRINTED",
      module: "MEMBER_CARD",
      description: `Printed ID card PDF`,
      libraryId: req.user.libraryId
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=MemberCard_${req.params.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const stats = await cardService.getAnalytics(req.user.libraryId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
