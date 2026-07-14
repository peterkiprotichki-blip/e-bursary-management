const mongoose = require('mongoose');

async function migrate() {
  try {
    await mongoose.connect('mongodb://localhost:27017/e-bursary');
    console.log('Connected to MongoDB...');

    const propertyCollection = mongoose.connection.collection('properties');
    
    // Add floors field to all properties that don't have it
    const result = await propertyCollection.updateMany(
      { floors: { $exists: false } },
      { $set: { floors: 0 } }
    );

    console.log(`Migration complete!`);
    console.log(`  Matched: ${result.matchedCount} documents`);
    console.log(`  Modified: ${result.modifiedCount} documents`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();


