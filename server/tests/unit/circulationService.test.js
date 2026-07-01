const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const circulationService = require("../../src/services/circulationService");
const Member = require("../../src/models/Member");
const Book = require("../../src/models/Book");
const BookCopy = require("../../src/models/BookCopy");
const MemberCard = require("../../src/models/MemberCard");
const Transaction = require("../../src/models/Transaction");
const MembershipPlan = require("../../src/models/MembershipPlan");

let mongoServer;
const libraryId = new mongoose.Types.ObjectId();
const issuedBy = new mongoose.Types.ObjectId();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Member.deleteMany({});
  await MemberCard.deleteMany({});
  await Book.deleteMany({});
  await BookCopy.deleteMany({});
  await Transaction.deleteMany({});
  await MembershipPlan.deleteMany({});
});

describe("Circulation Service", () => {
  let plan, member, book, copy;

  beforeEach(async () => {
    plan = await MembershipPlan.create({
      name: "Standard",
      libraryId,
      borrowLimit: 2,
      issueDuration: 14,
      finePerDay: 10,
      renewalLimit: 1
    });

    member = await Member.create({
      firstName: "Test",
      lastName: "Student",
      email: "test@example.com",
      phone: "1234567890",
      memberType: "STUDENT",
      memberCode: "MEM001",
      libraryId,
      membershipPlanId: plan._id,
      activeCheckouts: 0,
      totalFines: 0,
      isVerified: true,
      status: "ACTIVE"
    });

    await MemberCard.create({
      memberId: member._id,
      libraryId,
      cardNumber: "CARD001",
      barcode: "CARD001",
      status: "ACTIVE",
      expiryDate: new Date("2030-01-01")
    });

    book = await Book.create({
      title: "Test Book",
      isbn: "1234567890",
      libraryId
    });

    copy = await BookCopy.create({
      bookId: book._id,
      libraryId,
      copyCode: "COPY001",
      barcode: "COPY001",
      status: "AVAILABLE"
    });
  });

  it("should successfully issue a book", async () => {
    const tx = await circulationService.issueBook(libraryId, member._id, copy._id, issuedBy);
    
    expect(tx).toBeDefined();
    expect(tx.status).toBe("ISSUED");
    expect(tx.bookCopyId.toString()).toBe(copy._id.toString());
    
    const updatedMember = await Member.findById(member._id);
    expect(updatedMember.activeCheckouts).toBe(1);

    const updatedCopy = await BookCopy.findById(copy._id);
    expect(updatedCopy.status).toBe("ISSUED");
  });

  it("should fail if borrowing limit is reached", async () => {
    member.activeCheckouts = 2;
    await member.save();

    await expect(
      circulationService.issueBook(libraryId, member._id, copy._id, issuedBy)
    ).rejects.toThrow(/Borrowing limit reached/);
  });

  it("should successfully return a book without fine", async () => {
    const tx = await circulationService.issueBook(libraryId, member._id, copy._id, issuedBy);
    
    const returnTx = await circulationService.returnBook(libraryId, tx._id, issuedBy);
    expect(returnTx.status).toBe("RETURNED");
    expect(returnTx.fineAmount).toBe(0);

    const updatedMember = await Member.findById(member._id);
    expect(updatedMember.activeCheckouts).toBe(0);

    const updatedCopy = await BookCopy.findById(copy._id);
    expect(updatedCopy.status).toBe("AVAILABLE");
  });
});
