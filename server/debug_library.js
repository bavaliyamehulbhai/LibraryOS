require('dotenv').config();
const mongoose = require('mongoose');

async function debugQuery() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check BookCopy
    const BookCopy = mongoose.connection.db.collection('bookcopies');
    const copy = await BookCopy.findOne({ copyCode: 'SUL-02-B0-C1' });
    console.log('Copy libraryId:', copy?.libraryId);
    
    // Check super admin user
    const User = mongoose.connection.db.collection('users');
    const superUser = await User.findOne({ email: 'super@libraryos.com' });
    console.log('Super Admin libraryId:', superUser?.libraryId);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

debugQuery();
