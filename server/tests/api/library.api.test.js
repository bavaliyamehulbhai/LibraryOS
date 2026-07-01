const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Library = require('../../src/models/Library');
const User = require('../../src/models/User');
const { generateAccessToken } = require('../../src/utils/generateToken');

const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Library API Tests', () => {
  let token;
  let libraryId;
  let mongoServer;

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

  beforeEach(async () => {
    // Create a mock user ID for createdBy
    const mockCreatedBy = new mongoose.Types.ObjectId();

    const library = await Library.create({
      name: 'Supertest Library',
      domain: 'supertest.libraryos.com',
      code: 'SUPERTEST1',
      status: 'ACTIVE',
      createdBy: mockCreatedBy,
      pincode: '123456',
      state: 'Test State',
      city: 'Test City',
      address: '123 Test Street',
      phone: '1234567890',
      email: 'test@libraryos.com'
    });
    libraryId = library._id;

    // Create an Admin user
    const user = await User.create({
      name: 'Admin',
      email: 'admin@supertest.com',
      password: 'password123',
      libraryId: library._id,
      roleId: new mongoose.Types.ObjectId() // Mock Role ID
    });

    token = generateAccessToken(user);
  });

  it('should prevent unauthenticated access', async () => {
    const res = await request(app).get('/api/v1/settings');
    expect(res.statusCode).toEqual(401);
  });

  // Since actual API requires exact role permissions, we'll test the generic health endpoint if it existed, or just mock the basic response format
  it('should return 403 if missing permissions', async () => {
    const res = await request(app)
      .get('/api/v1/settings')
      .set('Authorization', `Bearer ${token}`);
    
    // Expecting 403 because we mocked a random Role ID that lacks permissions
    expect(res.statusCode).toEqual(403);
  });
});
