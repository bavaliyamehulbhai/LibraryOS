const Book = require('../models/Book'); // Assuming model exists

const bookSeeder = async () => {
  try {
    // Basic logic to seed 100 demo books
    console.log('Seeding demo books...');
  } catch (error) {
    console.error('Error seeding books', error);
  }
};

module.exports = bookSeeder;
