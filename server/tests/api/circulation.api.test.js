const request = require("supertest");
const app = require("../../src/app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const Member = require("../../src/models/Member");
const User = require("../../src/models/User");
const Book = require("../../src/models/Book");
const BookCopy = require("../../src/models/BookCopy");
const MemberCard = require("../../src/models/MemberCard");
const MembershipPlan = require("../../src/models/MembershipPlan");

let mongoServer;
const libraryId = new mongoose.Types.ObjectId();
const adminId = new mongoose.Types.ObjectId();

let adminToken;
let plan, member, book, copy;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  adminToken = jwt.sign(
    { _id: adminId, role: "LIBRARY_ADMIN", libraryId },
    process.env.JWT_SECRET || "testsecret",
    { expiresIn: "1h" }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Member.deleteMany({});
  await User.deleteMany({});
  await MemberCard.deleteMany({});
  await Book.deleteMany({});
  await BookCopy.deleteMany({});
  await MembershipPlan.deleteMany({});

  plan = await MembershipPlan.create({
    name: "Standard Plan",
    libraryId,
    borrowLimit: 3,
    issueDuration: 14,
    finePerDay: 10
  });

  await User.create({
    _id: adminId,
    name: "Admin User",
    email: "admin@test.com",
    password: "password123",
    role: "SUPER_ADMIN",
    libraryId
  });

  member = await Member.create({
    firstName: "API",
    lastName: "Student",
    email: "api@test.com",
    phone: "1234567890",
    memberType: "STUDENT",
    memberCode: "API001",
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
    cardNumber: "API_CARD_1",
    barcode: "API_CARD_1",
    status: "ACTIVE",
    expiryDate: new Date("2030-01-01")
  });

  book = await Book.create({
    title: "API Book",
    isbn: "1111111111",
    libraryId
  });

  copy = await BookCopy.create({
    bookId: book._id,
    libraryId,
    copyCode: "APICOPY1",
    barcode: "APICOPY1",
    status: "AVAILABLE"
  });
});

describe("Circulation API", () => {
  it("should issue a book via POST /api/v1/circulation/issue", async () => {
    const res = await request(app)
      .post("/api/v1/circulation/issue")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        memberId: member._id,
        bookCopyId: copy._id
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ISSUED");
    expect(res.body.data.bookCopyId.toString()).toBe(copy._id.toString());
  });

  it("should fail to issue book if borrowing limit reached", async () => {
    member.activeCheckouts = 3;
    await member.save();

    const res = await request(app)
      .post("/api/v1/circulation/issue")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        memberId: member._id,
        bookCopyId: copy._id
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Borrowing limit reached/);
  });
});
