require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const User = mongoose.connection.db.collection('users');
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Mehul@Bavaliya14321', salt);

    // Update the user
    const result = await User.updateOne(
      { email: 'super@libraryos.com' },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount > 0) {
      console.log('✅ Password successfully updated for super@libraryos.com');
    } else {
      console.log('❌ User super@libraryos.com not found!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updatePassword();
