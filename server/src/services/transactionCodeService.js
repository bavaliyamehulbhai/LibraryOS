const Transaction = require("../models/Transaction");
const Payment = require("../models/Payment");

exports.generateTransactionCode = async (libraryId, prefix = "ISS") => {
  const year = new Date().getFullYear();
  
  let lastRecord = null;
  let codeField = null;

  if (prefix === "PAY") {
    lastRecord = await Payment.findOne({ 
      libraryId,
      paymentCode: { $regex: `^${prefix}-${year}-` }
    }).sort({ createdAt: -1 });
    codeField = lastRecord?.paymentCode;
  } else if (prefix === "FIN") {
    const Fine = require("../models/Fine");
    lastRecord = await Fine.findOne({ 
      libraryId,
      fineCode: { $regex: `^${prefix}-${year}-` }
    }).sort({ createdAt: -1 });
    codeField = lastRecord?.fineCode;
  } else {
    lastRecord = await Transaction.findOne({ 
      libraryId,
      transactionCode: { $regex: `^${prefix}-${year}-` }
    }).sort({ createdAt: -1 });
    codeField = lastRecord?.transactionCode;
  }

  let sequenceNumber = 1;

  if (lastRecord && codeField) {
    const parts = codeField.split('-');
    if (parts.length === 3) {
      sequenceNumber = parseInt(parts[2], 10) + 1;
    }
  }

  const sequence = sequenceNumber.toString().padStart(6, "0");
  return `${prefix}-${year}-${sequence}`;
};
