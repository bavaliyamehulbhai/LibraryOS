const User = require('../../src/models/User');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Auth Unit Tests', () => {
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

  it('should hash the password before saving', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      libraryId: '5f9f1b9b9c9d440000000000'
    });

    await user.save();
    
    expect(user.password).not.toBe('password123');
    expect(user.password).toBeDefined();
  });

  it('should validate correct password', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test2@example.com',
      password: 'password123',
      libraryId: '5f9f1b9b9c9d440000000000'
    });
    
    await user.save();
    
    const isMatch = await user.matchPassword('password123');
    expect(isMatch).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test3@example.com',
      password: 'password123',
      libraryId: '5f9f1b9b9c9d440000000000'
    });
    
    await user.save();
    
    const isMatch = await user.matchPassword('wrongpassword');
    expect(isMatch).toBe(false);
  });
});
