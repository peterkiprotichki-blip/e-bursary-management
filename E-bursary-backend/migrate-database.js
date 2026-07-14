const { MongoClient } = require('mongodb');

async function migrateDatabase() {
  const sourceUri = 'mongodb://localhost:27017/rentium';
  const targetUri = 'mongodb://localhost:27017/e-bursary';

  const sourceClient = new MongoClient(sourceUri);
  const targetClient = new MongoClient(targetUri);

  try {
    console.log('🔗 Connecting to source database (rentium)...');
    await sourceClient.connect();
    const sourceDb = sourceClient.db('rentium');

    console.log('🔗 Connecting to target database (e-bursary)...');
    await targetClient.connect();
    const targetDb = targetClient.db('e-bursary');

    // Get all collection names
    const collections = await sourceDb.listCollections().toArray();
    console.log(`\n📦 Found ${collections.length} collections to migrate\n`);

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`📋 Migrating collection: ${collectionName}`);

      const sourceCollection = sourceDb.collection(collectionName);
      const targetCollection = targetDb.collection(collectionName);

      // Get all documents
      const documents = await sourceCollection.find({}).toArray();
      
      if (documents.length === 0) {
        console.log(`   ✓ No documents to migrate\n`);
        continue;
      }

      // Clear target collection first
      await targetCollection.deleteMany({});

      // Insert documents into target collection
      if (documents.length > 0) {
        await targetCollection.insertMany(documents);
        console.log(`   ✓ Migrated ${documents.length} documents\n`);
      }
    }

    console.log('✅ Database migration completed successfully!');
    console.log('✓ All data has been transferred from "rentium" to "e-bursary"');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

migrateDatabase();


