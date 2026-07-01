const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateInvoicePdf = async (invoice, library, plan) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      const fileName = `${invoice.invoiceNumber}.pdf`;
      const uploadDir = path.join(__dirname, "..", "..", "uploads", "invoices");
      
      // Ensure dir exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, fileName);
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);

      // Header
      doc.fillColor("#444444").fontSize(20).text("LibraryOS SaaS", 50, 57);
      doc.fontSize(10).text("Invoice Number:", 50, 90).text(invoice.invoiceNumber, 150, 90);
      doc.text("Invoice Date:", 50, 105).text(invoice.createdAt.toLocaleDateString(), 150, 105);
      doc.text("Due Date:", 50, 120).text(invoice.dueDate.toLocaleDateString(), 150, 120);
      doc.text("Status:", 50, 135).text(invoice.status, 150, 135);

      // Bill To
      doc.text("Billed To:", 300, 90);
      doc.font("Helvetica-Bold").text(library.name || "Library", 300, 105);
      doc.font("Helvetica").text(library.email || "", 300, 120);

      // Table Header
      const tableTop = 200;
      doc.font("Helvetica-Bold");
      doc.text("Item", 50, tableTop);
      doc.text("Billing Cycle", 250, tableTop);
      doc.text("Price", 450, tableTop);
      doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();

      // Table Row
      doc.font("Helvetica");
      doc.text(plan.planName || "Subscription Plan", 50, tableTop + 25);
      doc.text(invoice.billingCycle || "MONTHLY", 250, tableTop + 25);
      doc.text(`Rs. ${invoice.amount}`, 450, tableTop + 25);
      
      // Totals
      const subtotalTop = 300;
      doc.moveTo(50, subtotalTop).lineTo(500, subtotalTop).stroke();
      doc.text("Subtotal:", 350, subtotalTop + 15).text(`Rs. ${invoice.amount}`, 450, subtotalTop + 15);
      doc.text("GST (18%):", 350, subtotalTop + 30).text(`Rs. ${invoice.gst}`, 450, subtotalTop + 30);
      if (invoice.discountAmount > 0) {
        doc.text("Discount:", 350, subtotalTop + 45).text(`- Rs. ${invoice.discountAmount}`, 450, subtotalTop + 45);
      }
      
      doc.font("Helvetica-Bold");
      doc.text("Total:", 350, subtotalTop + 65).text(`Rs. ${invoice.totalAmount}`, 450, subtotalTop + 65);

      // Footer
      doc.font("Helvetica").fontSize(10).text(
        "Thank you for choosing LibraryOS.",
        50,
        700,
        { align: "center", width: 500 }
      );

      doc.end();

      stream.on("finish", () => {
        resolve(`/uploads/invoices/${fileName}`);
      });
      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};
