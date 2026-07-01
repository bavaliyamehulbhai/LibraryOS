const PDFDocument = require("pdfkit");

exports.generateReturnReceiptPDF = async (transaction) => {
  return new Promise((resolve, reject) => {
    try {
      // Create A5 size receipt
      const doc = new PDFDocument({ size: 'A5', margin: 40 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.rect(0, 0, doc.page.width, 60).fill('#2563eb');
      doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('LibraryOS', 40, 20);
      doc.fontSize(12).text('Return Receipt', 40, 24, { align: 'right' });

      // Body
      doc.moveDown(3);
      doc.fillColor('#111827').fontSize(16).text(`Transaction: ${transaction.transactionCode}`);
      
      doc.moveDown(1.5);
      doc.fontSize(10).fillColor('#6b7280').text('MEMBER DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fillColor('#111827').fontSize(12).text(`Name: ${transaction.memberId?.firstName} ${transaction.memberId?.lastName}`);
      doc.text(`Member ID: ${transaction.memberId?.memberCode}`);

      doc.moveDown(1.5);
      doc.fontSize(10).fillColor('#6b7280').text('BOOK DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fillColor('#111827').fontSize(12).text(`Title: ${transaction.bookId?.title}`);
      doc.text(`Barcode: ${transaction.bookCopyId?.barcode}`);
      
      doc.moveDown(1.5);
      doc.fontSize(10).fillColor('#6b7280').text('RETURN DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fillColor('#111827').fontSize(12);
      doc.text(`Issue Date: ${new Date(transaction.issueDate).toLocaleDateString()}`);
      doc.text(`Due Date: ${new Date(transaction.dueDate).toLocaleDateString()}`);
      doc.text(`Returned On: ${new Date(transaction.actualReturnDate).toLocaleDateString()}`);
      doc.text(`Condition: ${transaction.returnCondition}`);

      doc.moveDown(1.5);
      
      // Fine section
      if (transaction.fineAmount > 0) {
        doc.rect(40, doc.y, doc.page.width - 80, 40).fill('#fee2e2');
        doc.fillColor('#991b1b').fontSize(14).font('Helvetica-Bold').text(`Total Fine: ₹${transaction.fineAmount}`, 50, doc.y + 12);
      } else {
        doc.rect(40, doc.y, doc.page.width - 80, 40).fill('#dcfce7');
        doc.fillColor('#166534').fontSize(14).font('Helvetica-Bold').text(`Total Fine: ₹0 (On Time)`, 50, doc.y + 12);
      }

      // Footer
      doc.fillColor('#9ca3af').fontSize(8).font('Helvetica');
      doc.text('Thank you for using LibraryOS.', 40, doc.page.height - 60, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
