require('dotenv').config();
const mongoose = require('mongoose');

async function findIds() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find a user/member
    const User = mongoose.connection.db.collection('users');
    const user = await User.findOne({ email: 'aarav.sharma.cpl-01@example.com' }) || await User.findOne({ role: 'MEMBER' });
    
    // Find a book copy
    const BookCopy = mongoose.connection.db.collection('bookcopies');
    const copy = await BookCopy.findOne({});

    console.log('\n======================================');
    console.log('       LIBRARYOS - DATA FINDER        ');
    console.log('======================================\n');
    
    if (user) {
      console.log('MEMBER DETAILS TO USE:');
      console.log('- Member Name: ', user.name);
      console.log('- Member Email:', user.email);
      console.log('- MEMBER CODE: ', user.memberCode || user.cardNumber || user._id.toString());
    } else {
      console.log('No Member found! You need to register a member first.');
    }

    console.log('\n--------------------------------------\n');

    if (copy) {
      console.log('BOOK COPY DETAILS TO USE:');
      console.log('- Copy Status: ', copy.status);
      console.log('- COPY CODE:   ', copy.copyCode || copy.barcode || copy._id.toString());
    } else {
      console.log('No physical book copies found! You need to add a physical book in the catalog first.');
    }
    
    console.log('\n======================================\n');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

findIds();
