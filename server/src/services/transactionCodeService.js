const Transaction = require("../models/Transaction");
const Payment = require("../models/Payment");

exports.generateTransactionCode = async (libraryId, prefix = "ISS") => {
  const year = new Date().getFullYear();
  
  let lastRecord = null;
  let codeField = null;

  if (prefix === "PAY") {
    lastRecord = await Payment.findOne({ 
      paymentCode: { $regex: `^${prefix}-${year}-` }
    }).sort({ createdAt: -1 });
    codeField = lastRecord?.paymentCode;
  } else if (prefix === "FIN") {
    const Fine = require("../models/Fine");
    lastRecord = await Fine.findOne({ 
      fineCode: { $regex: `^${prefix}-${year}-` }
    }).sort({ createdAt: -1 });
    codeField = lastRecord?.fineCode;
  } else if (prefix === "EML") {
    const EmailLog = require("../models/EmailLog");
    lastRecord = await EmailLog.findOne({
      emailCode: { $regex: `^${prefix}-${year}-` }
    }).sort({ createdAt: -1 });
    codeField = lastRecord?.emailCode;
  } else if (prefix === "RES") {
    const Reservation = require("../models/Reservation");
    lastRecord = await Reservation.findOne({
      reservationCode: { $regex: `^${prefix}-${year}-` }
    }).sort({ createdAt: -1 });
    codeField = lastRecord?.reservationCode;
  } else {
    lastRecord = await Transaction.findOne({ 
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
