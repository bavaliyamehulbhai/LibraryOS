const mongoose = require("mongoose");
const Library = require("../models/Library");
const User = require("../models/User");
const Category = require("../models/Category");
const Author = require("../models/Author");
const Publisher = require("../models/Publisher");
const Book = require("../models/Book");
const Inventory = require("../models/Inventory");
const BookCopy = require("../models/BookCopy");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");
const Fine = require("../models/Fine");
const Payment = require("../models/Payment");
const ActivityLog = require("../models/ActivityLog");
const SecurityLog = require("../models/SecurityLog");

async function seedEnterpriseData(targetLibraryId = null) {
  console.log("=== [LibraryOS 2.0] Enterprise Data Seeder Initiated ===");

  // 1. Identify Target Library & Admin User
  let library;
  if (targetLibraryId) {
    library = await Library.findById(targetLibraryId);
  }
  
  if (!library) {
    const superAdmin = await User.findOne({ 
      $or: [{ email: "super@libraryos.com" }, { role: "SUPER_ADMIN" }] 
    });
    if (superAdmin && superAdmin.libraryId) {
      library = await Library.findById(superAdmin.libraryId);
    }
  }

  if (!library) {
    library = await Library.findOne();
  }

  if (!library) {
    console.log("Creating default flagship enterprise library...");
    library = await Library.create({
      name: "Central National Institute of Technology Library",
      code: "CNIT-01",
      email: "contact@cnit-library.org",
      phone: "+91 98765 43210",
      address: "Knowledge Boulevard, Tech Park",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      pincode: "560100",
      createdBy: new mongoose.Types.ObjectId(),
      status: "ACTIVE"
    });
  }

  const libraryId = library._id;
  const libPrefix = (library.code || libraryId.toString().slice(-4)).toUpperCase();
  console.log(`Using Library: "${library.name}" (ID: ${libraryId}, Prefix: ${libPrefix})`);

  // Ensure super admin has this libraryId
  const superAdmin = await User.findOne({ email: "super@libraryos.com" });
  if (superAdmin && (!superAdmin.libraryId || superAdmin.libraryId.toString() !== libraryId.toString())) {
    superAdmin.libraryId = libraryId;
    await superAdmin.save();
    console.log(`Updated super@libraryos.com to use library ${libraryId}`);
  }

  const adminUserId = superAdmin ? superAdmin._id : new mongoose.Types.ObjectId();

  // 2. Seed Categories
  const categoryDefs = [
    { name: "Computer Science & AI", description: "Machine learning, algorithms, distributed architecture, and software design", color: "#6366f1", icon: "cpu" },
    { name: "Data Science & Quantum Computing", description: "Statistical inference, big data, and quantum information processing", color: "#06b6d4", icon: "database" },
    { name: "Modern Astrophysics & Physics", description: "Theoretical physics, general relativity, quantum mechanics, and cosmology", color: "#ec4899", icon: "compass" },
    { name: "Philosophy & Behavioral Science", description: "Ethics, epistemology, cognitive biases, and behavioral economics", color: "#8b5cf6", icon: "brain" },
    { name: "Financial Markets & Strategy", description: "Macroeconomics, portfolio theory, fintech, and quantitative trading", color: "#10b981", icon: "trending-up" },
    { name: "Biomedical Sciences & Genetics", description: "Genomics, computational biology, neuroscience, and medical innovations", color: "#ef4444", icon: "activity" },
    { name: "Classic & Contemporary Literature", description: "World literature, timeless fiction, essays, and literary criticism", color: "#f59e0b", icon: "book-open" },
    { name: "Global History & Geopolitics", description: "World civilizations, international diplomacy, warfare, and cultural evolution", color: "#64748b", icon: "globe" }
  ];

  const categories = [];
  for (const cat of categoryDefs) {
    let doc = await Category.findOne({ name: cat.name, libraryId });
    if (!doc) {
      doc = await Category.create({ ...cat, libraryId, isActive: true });
    }
    categories.push(doc);
  }
  console.log(`Categories ready: ${categories.length}`);

  // 3. Seed Authors
  const authorDefs = [
    { name: "Martin Kleppmann", country: "United Kingdom", biography: "Researcher in distributed systems and author of Designing Data-Intensive Applications." },
    { name: "Stuart Russell & Peter Norvig", country: "United States", biography: "Pioneers of modern Artificial Intelligence and educators at UC Berkeley and Stanford." },
    { name: "Brian Greene", country: "United States", biography: "Theoretical physicist, string theorist, and professor of physics and mathematics at Columbia University." },
    { name: "Daniel Kahneman", country: "Israel/United States", biography: "Nobel Memorial Prize winner in Economic Sciences and pioneer of behavioral economics." },
    { name: "Robert C. Martin", country: "United States", biography: "Software engineer, co-author of Agile Manifesto, known widely as Uncle Bob." },
    { name: "Yuval Noah Harari", country: "Israel", biography: "Historian, philosopher, and bestselling author of Sapiens: A Brief History of Humankind." },
    { name: "Richard Feynman", country: "United States", biography: "Nobel laureate theoretical physicist celebrated for work in quantum electrodynamics." },
    { name: "Carl Sagan", country: "United States", biography: "Astronomer, planetary scientist, and legendary science communicator." },
    { name: "Walter Isaacson", country: "United States", biography: "Acclaimed biographer of Steve Jobs, Albert Einstein, Leonardo da Vinci, and Elon Musk." },
    { name: "F. Scott Fitzgerald", country: "United States", biography: "Celebrated American novelist and short story writer of the Jazz Age." }
  ];

  const authors = [];
  for (const auth of authorDefs) {
    let doc = await Author.findOne({ name: auth.name, libraryId });
    if (!doc) {
      doc = await Author.create({ ...auth, libraryId, isActive: true });
    }
    authors.push(doc);
  }
  console.log(`Authors ready: ${authors.length}`);

  // 4. Seed Publishers
  const publisherDefs = [
    { name: "O'Reilly Media", country: "United States", website: "https://oreilly.com", email: "info@oreilly.com" },
    { name: "MIT Press", country: "United States", website: "https://mitpress.mit.edu", email: "info@mitpress.com" },
    { name: "Penguin Random House", country: "United States", website: "https://penguinrandomhouse.com", email: "contact@penguin.com" },
    { name: "Cambridge University Press", country: "United Kingdom", website: "https://cambridge.org", email: "queries@cambridge.org" },
    { name: "Pearson Education", country: "United Kingdom", website: "https://pearson.com", email: "support@pearson.com" },
    { name: "HarperCollins Publishers", country: "United States", website: "https://harpercollins.com", email: "press@harpercollins.com" }
  ];

  const publishers = [];
  for (const pub of publisherDefs) {
    let doc = await Publisher.findOne({ name: pub.name, libraryId });
    if (!doc) {
      doc = await Publisher.create({ ...pub, libraryId, isActive: true });
    }
    publishers.push(doc);
  }
  console.log(`Publishers ready: ${publishers.length}`);

  // 5. Seed Realistic Books
  const bookCatalog = [
    {
      title: "Designing Data-Intensive Applications",
      subtitle: "The Big Ideas Behind Reliable, Scalable, and Maintainable Systems",
      isbn: "978-1449373320",
      categoryIdx: 0,
      authorIdx: 0,
      publisherIdx: 0,
      pages: 616,
      publicationYear: 2021,
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
      totalCopies: 8,
      issuedCopies: 6 // Leaves 2 available -> Will trigger low stock sentinel!
    },
    {
      title: "Artificial Intelligence: A Modern Approach",
      subtitle: "Fourth Edition Global Framework",
      isbn: "978-0134610993",
      categoryIdx: 0,
      authorIdx: 1,
      publisherIdx: 4,
      pages: 1152,
      publicationYear: 2022,
      coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
      totalCopies: 12,
      issuedCopies: 7
    },
    {
      title: "Clean Architecture: A Craftsman's Guide to Software Structure",
      subtitle: "Robert C. Martin Series on Software Craftsmanship",
      isbn: "978-0134494166",
      categoryIdx: 0,
      authorIdx: 4,
      publisherIdx: 4,
      pages: 432,
      publicationYear: 2020,
      coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=600",
      totalCopies: 10,
      issuedCopies: 4
    },
    {
      title: "Quantum Computation and Quantum Information",
      subtitle: "10th Anniversary Cambridge Standard Edition",
      isbn: "978-1107002173",
      categoryIdx: 1,
      authorIdx: 6,
      publisherIdx: 3,
      pages: 702,
      publicationYear: 2021,
      coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600",
      totalCopies: 6,
      issuedCopies: 5 // Leaves 1 available -> Triggers low stock sentinel!
    },
    {
      title: "Thinking, Fast and Slow",
      subtitle: "The International Bestselling Study on Human Cognition",
      isbn: "978-0374533557",
      categoryIdx: 3,
      authorIdx: 3,
      publisherIdx: 2,
      pages: 512,
      publicationYear: 2019,
      coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
      totalCopies: 14,
      issuedCopies: 6
    },
    {
      title: "Sapiens: A Brief History of Humankind",
      subtitle: "From Animals into Gods",
      isbn: "978-0062316097",
      categoryIdx: 7,
      authorIdx: 5,
      publisherIdx: 5,
      pages: 464,
      publicationYear: 2018,
      coverImage: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600",
      totalCopies: 15,
      issuedCopies: 8
    },
    {
      title: "The Elegant Universe: Superstrings, Hidden Dimensions",
      subtitle: "The Quest for the Ultimate Theory of Reality",
      isbn: "978-0393058581",
      categoryIdx: 2,
      authorIdx: 2,
      publisherIdx: 2,
      pages: 464,
      publicationYear: 2020,
      coverImage: "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&q=80&w=600",
      totalCopies: 9,
      issuedCopies: 3
    },
    {
      title: "Surely You're Joking, Mr. Feynman!",
      subtitle: "Adventures of a Curious Character",
      isbn: "978-0393316049",
      categoryIdx: 2,
      authorIdx: 6,
      publisherIdx: 2,
      pages: 352,
      publicationYear: 2018,
      coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
      totalCopies: 11,
      issuedCopies: 5
    },
    {
      title: "Cosmos",
      subtitle: "The Story of Cosmic Evolution, Science and Civilization",
      isbn: "978-0345539434",
      categoryIdx: 2,
      authorIdx: 7,
      publisherIdx: 2,
      pages: 384,
      publicationYear: 2019,
      coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
      totalCopies: 12,
      issuedCopies: 4
    },
    {
      title: "The Intelligent Investor: The Definitive Book on Value Investing",
      subtitle: "Revised Edition with Commentary by Jason Zweig",
      isbn: "978-0060555665",
      categoryIdx: 4,
      authorIdx: 3,
      publisherIdx: 5,
      pages: 640,
      publicationYear: 2021,
      coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600",
      totalCopies: 10,
      issuedCopies: 4
    },
    {
      title: "Principles for Dealing with the Changing World Order",
      subtitle: "Why Nations Succeed and Fail",
      isbn: "978-1982160272",
      categoryIdx: 4,
      authorIdx: 3,
      publisherIdx: 5,
      pages: 576,
      publicationYear: 2022,
      coverImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600",
      totalCopies: 8,
      issuedCopies: 3
    },
    {
      title: "The Gene: An Intimate History",
      subtitle: "From Aristotle to Modern Molecular Medicine",
      isbn: "978-1476733524",
      categoryIdx: 5,
      authorIdx: 8,
      publisherIdx: 2,
      pages: 608,
      publicationYear: 2020,
      coverImage: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=600",
      totalCopies: 7,
      issuedCopies: 5 // Leaves 2 available -> Triggers low stock sentinel!
    },
    {
      title: "The Great Gatsby",
      subtitle: "The Authorized Scribner Paperback Edition",
      isbn: "978-0743273565",
      categoryIdx: 6,
      authorIdx: 9,
      publisherIdx: 2,
      pages: 180,
      publicationYear: 2021,
      coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
      totalCopies: 16,
      issuedCopies: 9
    },
    {
      title: "Steve Jobs",
      subtitle: "The Exclusive Biography",
      isbn: "978-1451648539",
      categoryIdx: 7,
      authorIdx: 8,
      publisherIdx: 5,
      pages: 656,
      publicationYear: 2021,
      coverImage: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&q=80&w=600",
      totalCopies: 10,
      issuedCopies: 4
    },
    {
      title: "Introduction to Algorithms (CLRS)",
      subtitle: "Fourth Edition - The Gold Standard in Computer Algorithms",
      isbn: "978-0262046305",
      categoryIdx: 0,
      authorIdx: 1,
      publisherIdx: 1,
      pages: 1312,
      publicationYear: 2022,
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600",
      totalCopies: 14,
      issuedCopies: 8
    }
  ];

  const seededBooks = [];
  const seededCopies = [];

  for (let i = 0; i < bookCatalog.length; i++) {
    const item = bookCatalog[i];
    let book = await Book.findOne({ isbn: item.isbn, libraryId });
    if (!book) {
      book = await Book.create({
        title: item.title,
        subtitle: item.subtitle,
        isbn: item.isbn,
        category: categories[item.categoryIdx]._id,
        author: authors[item.authorIdx]._id,
        publisher: publishers[item.publisherIdx]._id,
        pages: item.pages,
        publicationYear: item.publicationYear,
        coverImage: item.coverImage,
        thumbnail: item.coverImage,
        libraryId,
        isActive: true,
        description: `${item.title} is an authoritative work in ${categories[item.categoryIdx].name}, acclaimed globally for its rigorous insight and educational clarity.`
      });
    }
    seededBooks.push(book);

    // Seed Inventory (respecting invariant: totalCopies = availableCopies + issuedCopies)
    const available = item.totalCopies - item.issuedCopies;
    let inventory = await Inventory.findOne({ bookId: book._id, libraryId });
    if (!inventory) {
      inventory = await Inventory.create({
        bookId: book._id,
        libraryId,
        totalCopies: item.totalCopies,
        availableCopies: available,
        issuedCopies: item.issuedCopies,
        reservedCopies: 0,
        damagedCopies: 0,
        lostCopies: 0
      });
    } else {
      inventory.totalCopies = item.totalCopies;
      inventory.availableCopies = available;
      inventory.issuedCopies = item.issuedCopies;
      inventory.reservedCopies = 0;
      inventory.damagedCopies = 0;
      inventory.lostCopies = 0;
      await inventory.save();
    }

    // Seed BookCopies
    for (let c = 1; c <= item.totalCopies; c++) {
      const copyCode = `BC-${libPrefix}-${item.isbn.slice(-4)}-${c.toString().padStart(3, '0')}`;
      let copy = await BookCopy.findOne({ copyCode });
      const isIssued = c <= item.issuedCopies;
      if (!copy) {
        copy = await BookCopy.create({
          bookId: book._id,
          libraryId,
          copyCode,
          barcode: copyCode,
          status: isIssued ? "ISSUED" : "AVAILABLE",
          condition: c % 4 === 0 ? "GOOD" : "NEW"
        });
      } else {
        copy.libraryId = libraryId;
        copy.bookId = book._id;
        copy.status = isIssued ? "ISSUED" : "AVAILABLE";
        copy.condition = c % 4 === 0 ? "GOOD" : "NEW";
        await copy.save();
      }
      seededCopies.push(copy);
    }
  }
  console.log(`Seeded ${seededBooks.length} books and ${seededCopies.length} item copies.`);

  // 6. Seed Members
  const memberDefs = [
    { firstName: "Aarav", lastName: "Sharma", email: `aarav.sharma.${libPrefix.toLowerCase()}@example.com`, phone: "+91 98200 11001", memberType: "STUDENT", gender: "MALE" },
    { firstName: "Elena", lastName: "Rostova", email: `elena.rostova.${libPrefix.toLowerCase()}@university.edu`, phone: "+91 98200 11002", memberType: "FACULTY", gender: "FEMALE" },
    { firstName: "Siddharth", lastName: "Patel", email: `sid.patel.${libPrefix.toLowerCase()}@techmail.com`, phone: "+91 98200 11003", memberType: "STUDENT", gender: "MALE" },
    { firstName: "Priya", lastName: "Nair", email: `priya.nair.${libPrefix.toLowerCase()}@edukendra.org`, phone: "+91 98200 11004", memberType: "TEACHER", gender: "FEMALE" },
    { firstName: "Rohan", lastName: "Gupta", email: `rohan.gupta.${libPrefix.toLowerCase()}@gmail.com`, phone: "+91 98200 11005", memberType: "STUDENT", gender: "MALE" },
    { firstName: "Ananya", lastName: "Sengupta", email: `ananya.s.${libPrefix.toLowerCase()}@literaryhub.in`, phone: "+91 98200 11006", memberType: "STUDENT", gender: "FEMALE" },
    { firstName: "Marcus", lastName: "Vance", email: `m.vance.${libPrefix.toLowerCase()}@mitresearch.org`, phone: "+91 98200 11007", memberType: "FACULTY", gender: "MALE" },
    { firstName: "Sneha", lastName: "Kulkarni", email: `sneha.k.${libPrefix.toLowerCase()}@datascience.in`, phone: "+91 98200 11008", memberType: "STUDENT", gender: "FEMALE" },
    { firstName: "Aditya", lastName: "Verma", email: `aditya.v.${libPrefix.toLowerCase()}@quantumfoundry.io`, phone: "+91 98200 11009", memberType: "STUDENT", gender: "MALE" },
    { firstName: "Devanshi", lastName: "Mehta", email: `devanshi.mehta.${libPrefix.toLowerCase()}@fintech.co`, phone: "+91 98200 11010", memberType: "STUDENT", gender: "FEMALE" },
    { firstName: "Sarah", lastName: "Jenkins", email: `sarah.jenkins.${libPrefix.toLowerCase()}@oxon.edu`, phone: "+91 98200 11011", memberType: "TEACHER", gender: "FEMALE" },
    { firstName: "Vikram", lastName: "Malhotra", email: `vikram.m.${libPrefix.toLowerCase()}@iitdelhi.ac.in`, phone: "+91 98200 11012", memberType: "STUDENT", gender: "MALE" },
    { firstName: "Rajiv", lastName: "Menon", email: `rajiv.menon.${libPrefix.toLowerCase()}@aiims.res.in`, phone: "+91 98200 11013", memberType: "FACULTY", gender: "MALE" },
    { firstName: "Ishaan", lastName: "Joshi", email: `ishaan.j.${libPrefix.toLowerCase()}@spacetech.org`, phone: "+91 98200 11014", memberType: "STUDENT", gender: "MALE" },
    { firstName: "Neha", lastName: "Bansal", email: `neha.bansal.${libPrefix.toLowerCase()}@biotech.ac.in`, phone: "+91 98200 11015", memberType: "STUDENT", gender: "FEMALE" }
  ];

  const seededMembers = [];
  for (let m = 0; m < memberDefs.length; m++) {
    const mem = memberDefs[m];
    const memberCode = `MEM-${libPrefix}-2026-${(m + 1).toString().padStart(3, '0')}`;
    let doc = await Member.findOne({ 
      $or: [{ email: mem.email }, { memberCode }] 
    });
    if (!doc) {
      doc = await Member.create({
        ...mem,
        memberCode,
        libraryId,
        status: "ACTIVE",
        isVerified: true,
        memberCardNumber: `CARD-${libPrefix}-${1000 + m}`,
        cardIssuedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        cardExpiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000)
      });
    } else {
      doc.libraryId = libraryId;
      doc.status = "ACTIVE";
      await doc.save();
    }
    seededMembers.push(doc);
  }
  console.log(`Members ready: ${seededMembers.length}`);

  // 7. Seed Circulation Transactions (Past 6 Months + Active Issues)
  // Clean old transactions for this library to produce pristine realistic timeline
  await Transaction.deleteMany({ libraryId });
  await Fine.deleteMany({ libraryId });
  await Payment.deleteMany({ libraryId });
  console.log("Flushed existing transactions, fines, and payments for library.");

  const now = new Date();
  const issuedCopiesPool = seededCopies.filter(c => c.status === "ISSUED");
  let copyIndex = 0;

  // A. Active currently ISSUED transactions (12 transactions)
  for (let i = 0; i < Math.min(12, issuedCopiesPool.length); i++) {
    const copy = issuedCopiesPool[i];
    const member = seededMembers[i % seededMembers.length];
    const daysAgo = 2 + (i % 8);
    const issueDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000); // due in future

    await Transaction.create({
      transactionCode: `TX-${Date.now()}-${i + 1}`,
      libraryId,
      bookId: copy.bookId,
      bookCopyId: copy._id,
      memberId: member._id,
      issueDate,
      dueDate,
      status: "ISSUED",
      issuedBy: adminUserId,
      createdAt: issueDate
    });
    copyIndex++;
  }

  // B. Active OVERDUE transactions (5 transactions)
  for (let i = 0; i < 5; i++) {
    const book = seededBooks[i % seededBooks.length];
    const copy = seededCopies.find(c => c.bookId.toString() === book._id.toString() && c.status === "ISSUED") || seededCopies[i];
    const member = seededMembers[(i + 5) % seededMembers.length];
    const daysAgo = 28 + (i * 3); // Issued ~30-40 days ago
    const issueDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000); // Due 14-26 days ago

    const overdueTx = await Transaction.create({
      transactionCode: `TX-OD-${Date.now()}-${i + 1}`,
      libraryId,
      bookId: copy.bookId,
      bookCopyId: copy._id,
      memberId: member._id,
      issueDate,
      dueDate,
      status: "OVERDUE",
      lateDays: Math.floor((now - dueDate) / (24 * 60 * 60 * 1000)),
      fineAmount: (i + 1) * 120,
      issuedBy: adminUserId,
      createdAt: issueDate
    });

    // Create Fine record for overdue transaction
    const fineAmount = (i + 1) * 120;
    await Fine.create({
      fineCode: `FN-${Date.now()}-${i + 1}`,
      memberId: member._id,
      transactionId: overdueTx._id,
      fineType: "LATE_RETURN",
      amount: fineAmount,
      paidAmount: 0,
      pendingAmount: fineAmount,
      reason: `Overdue book checkout (${overdueTx.lateDays} days past due date)`,
      status: "PENDING",
      libraryId,
      createdBy: adminUserId,
      createdAt: new Date(dueDate.getTime() + 24 * 60 * 60 * 1000)
    });
  }

  // C. Historical RETURNED transactions across past 5 months (35 transactions)
  // Spreading dates across previous months to ensure month-over-month trend graph is lush!
  for (let m = 0; m < 35; m++) {
    const book = seededBooks[m % seededBooks.length];
    const copy = seededCopies[m % seededCopies.length];
    const member = seededMembers[m % seededMembers.length];

    // Spread across past 150 days
    const daysAgo = 10 + (m * 4);
    const issueDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const returnDays = 5 + (m % 10);
    const returnDate = new Date(issueDate.getTime() + returnDays * 24 * 60 * 60 * 1000);
    const dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    const isLate = returnDate > dueDate;
    const fine = isLate ? 80 : 0;

    const returnedTx = await Transaction.create({
      transactionCode: `TX-RET-${Date.now()}-${m + 1}`,
      libraryId,
      bookId: book._id,
      bookCopyId: copy._id,
      memberId: member._id,
      issueDate,
      dueDate,
      returnDate,
      actualReturnDate: returnDate,
      status: "RETURNED",
      fineAmount: fine,
      lateDays: isLate ? 3 : 0,
      returnCondition: "GOOD",
      issuedBy: adminUserId,
      returnedBy: adminUserId,
      createdAt: issueDate
    });

    // If late, log fine and successful payment
    if (isLate) {
      const fineDoc = await Fine.create({
        fineCode: `FN-PD-${Date.now()}-${m + 1}`,
        memberId: member._id,
        transactionId: returnedTx._id,
        fineType: "LATE_RETURN",
        amount: fine,
        paidAmount: fine,
        pendingAmount: 0,
        reason: "Late return fine cleared on checkin",
        status: "PAID",
        libraryId,
        createdBy: adminUserId,
        createdAt: returnDate
      });

      await Payment.create({
        paymentCode: `PAY-${Date.now()}-${m + 1}`,
        memberId: member._id,
        purpose: "FINE",
        referenceId: fineDoc._id,
        amount: fine,
        paymentMethod: m % 2 === 0 ? "UPI" : "CASH",
        status: "SUCCESS",
        receivedBy: adminUserId,
        libraryId,
        createdAt: returnDate
      });
    }
  }

  // D. Create Additional Treasury Fee Payments (Membership Fees) across the 5 months
  const feeAmounts = [500, 750, 1000, 500, 1200, 800, 500, 1500, 600, 900];
  for (let f = 0; f < feeAmounts.length; f++) {
    const member = seededMembers[f % seededMembers.length];
    const daysAgo = 5 + (f * 14);
    const paymentDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    await Payment.create({
      paymentCode: `PAY-MEM-${Date.now()}-${f + 1}`,
      memberId: member._id,
      purpose: "MEMBERSHIP",
      referenceId: member._id,
      amount: feeAmounts[f],
      paymentMethod: f % 3 === 0 ? "RAZORPAY" : (f % 2 === 0 ? "UPI" : "CARD"),
      status: "SUCCESS",
      receivedBy: adminUserId,
      libraryId,
      createdAt: paymentDate
    });
  }

  // 8. Seed Security Logs (for Sentinel alerts)
  await SecurityLog.deleteMany({ libraryId });
  await SecurityLog.create([
    {
      event: "Multiple Failed Passkey Auth Attempts",
      severity: "HIGH",
      ipAddress: "192.168.1.145",
      details: "3 consecutive invalid biometric cryptographic handshakes detected on terminal node #4",
      libraryId,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
    },
    {
      event: "Simultaneous Geographic Login Anomaly",
      severity: "HIGH",
      ipAddress: "103.21.244.0",
      details: "Session token initiated from Zurich within 18 minutes of physical Bangalore badge punch",
      libraryId,
      createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000)
    },
    {
      event: "Rate Limit Exceeded on Catalog API",
      severity: "MEDIUM",
      ipAddress: "172.56.21.89",
      details: "Patron app client exceeded 450 requests/min during batch ISBN scanner loop",
      libraryId,
      createdAt: new Date(now.getTime() - 22 * 60 * 60 * 1000)
    }
  ]);
  console.log("Seeded 3 Security Logs for Sentinels widget.");

  // 9. Seed Activity Feed
  await ActivityLog.deleteMany({ libraryId });
  const activities = [
    { module: "CIRCULATION", action: "ISSUE", description: "Checked out 'Designing Data-Intensive Applications' to Aarav Sharma" },
    { module: "FINANCE", action: "COLLECTION", description: "Collected ₹250 late return assessment via Instant UPI" },
    { module: "CATALOG", action: "INVENTORY_AUDIT", description: "Completed scheduled shelf scan of Rack B4 (100% concordance)" },
    { module: "MEMBERS", action: "REGISTER", description: "Enrolled Dr. Rajiv Menon with Tier-1 Faculty privileges" },
    { module: "CIRCULATION", action: "RETURN", description: "Processed return of 'Artificial Intelligence: A Modern Approach'" },
    { module: "SECURITY", action: "ALERT", description: "Sentinel flagged unusual rate sweep from IP 172.56.21.89" },
    { module: "CATALOG", action: "ACQUISITION", description: "Accessioned 3 additional copies of 'Introduction to Algorithms (CLRS)'" },
    { module: "FINANCE", action: "MEMBERSHIP", description: "Renewed annual research institutional plan for Marcus Vance" }
  ];

  for (let a = 0; a < activities.length; a++) {
    const act = activities[a];
    await ActivityLog.create({
      userId: adminUserId,
      module: act.module,
      action: act.action,
      description: act.description,
      libraryId,
      createdAt: new Date(now.getTime() - (a * 45 + 10) * 60 * 1000)
    });
  }
  console.log("Seeded 8 Activity Log entries for Live Radar.");

  console.log("=== [LibraryOS 2.0] Enterprise Data Seeding Completed Successfully! ===");
  return {
    libraryId: libraryId.toString(),
    libraryName: library.name,
    totalBooks: seededBooks.length,
    totalCopies: seededCopies.length,
    totalMembers: seededMembers.length,
    activeIssues: 12,
    overdueIssues: 5,
    returnedHistory: 35
  };
}

module.exports = seedEnterpriseData;

if (require.main === module) {
  require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
  const connectDB = require("../config/db");
  connectDB().then(async () => {
    try {
      const targetLib = process.argv[2] || null;
      const res = await seedEnterpriseData(targetLib);
      console.log("Summary:", res);
      process.exit(0);
    } catch (e) {
      console.error("Seeding Failed:", e);
      process.exit(1);
    }
  });
}
