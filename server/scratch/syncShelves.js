require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Shelf = require('../src/models/Shelf');
const BookCopy = require('../src/models/BookCopy');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/libraryos";

const syncShelves = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log("Resetting all shelf capacities to 0...");
    await Shelf.updateMany({}, { occupiedSlots: 0 });

    console.log("Counting active book copies per shelf...");
    const copies = await BookCopy.find({ shelfId: { $ne: null }, status: { $in: ["AVAILABLE", "ISSUED", "RESERVED"] } });

    const shelfCounts = {};
    copies.forEach(copy => {
      const id = copy.shelfId.toString();
      shelfCounts[id] = (shelfCounts[id] || 0) + 1;
    });

    console.log(`Found ${Object.keys(shelfCounts).length} shelves with books.`);

    let updated = 0;
    for (const [shelfId, count] of Object.entries(shelfCounts)) {
      await Shelf.findByIdAndUpdate(shelfId, { occupiedSlots: count });
      updated++;
    }

    console.log(`Successfully updated ${updated} shelves!`);
    console.log("Done. You can now test the Physical Shelves heatmap.");

  } catch (error) {
    console.error("Error during sync:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
};

syncShelves();
