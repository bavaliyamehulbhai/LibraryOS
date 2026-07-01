const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Book = require("../../src/models/Book");
const Inventory = require("../../src/models/Inventory");

let mongoServer;

describe("Book Service Unit Tests", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });

  it("should create a new book successfully", async () => {
    const libraryId = new mongoose.Types.ObjectId();
    const bookData = {
      title: "Clean Code",
      isbn: "978-0132350884",
      libraryId,
    };

    const book = await Book.create(bookData);
    
    expect(book).toBeDefined();
    expect(book.title).toBe("Clean Code");
    expect(book.isbn).toBe("978-0132350884");
    expect(book.libraryId).toEqual(libraryId);
  });

  it("should fail to create a book without required fields", async () => {
    const libraryId = new mongoose.Types.ObjectId();
    const invalidBookData = {
      title: "Clean Code",
      // missing isbn
      libraryId,
    };

    await expect(Book.create(invalidBookData)).rejects.toThrow(mongoose.Error.ValidationError);
  });
});
