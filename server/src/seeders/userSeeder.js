const User = require('../models/User'); // Assuming model exists

const userSeeder = async () => {
  try {
    // Basic logic to seed demo users
    console.log('Seeding demo users...');
  } catch (error) {
    console.error('Error seeding users', error);
  }
};

module.exports = userSeeder;
