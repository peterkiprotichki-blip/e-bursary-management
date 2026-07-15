const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/e_bursary';

async function seedBursaryOffices() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✔ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Create tenants collection schema
    const tenantSchema = {
      name: String,
      slug: String,
      domain: String,
      logoUrl: String,
      isActive: Boolean,
      plan: String,
      settings: Object,
      ownerUserId: String,
      contactEmail: String,
      billingEmail: String,
      maxUsers: Number,
      maxProperties: Number,
      mpesaClientId: String,
      createdAt: Date,
      updatedAt: Date,
    };

    // Create a test bursary organization
    const bursaryOrg = {
      name: 'Kenya Bursary Fund - Nairobi Office',
      slug: 'kenya-bursary-fund',
      domain: 'bursary.co.ke',
      logoUrl: '',
      isActive: true,
      plan: 'pro',
      settings: {
        location: 'Nairobi',
        officeLocation: 'Nairobi CBD',
        campus: 'Main Campus',
        region: 'Nairobi',
        town: 'Nairobi',
      },
      ownerUserId: 'system-admin',
      contactEmail: 'admin@bursary.co.ke',
      billingEmail: 'billing@bursary.co.ke',
      maxUsers: 100,
      maxProperties: 500,
      mpesaClientId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    };

    // Create another organization for Nakuru location
    const nakuruOrg = {
      name: 'Kenya Bursary Fund - Nakuru Office',
      slug: 'kenya-bursary-fund-nakuru',
      domain: 'bursary.co.ke',
      logoUrl: '',
      isActive: true,
      plan: 'pro',
      settings: {
        location: 'Nakuru',
        officeLocation: 'Nakuru Town',
        campus: 'Nakuru Campus',
        region: 'Rift Valley',
        town: 'Nakuru',
      },
      ownerUserId: 'system-admin',
      contactEmail: 'nakuru@bursary.co.ke',
      billingEmail: 'nakuru-billing@bursary.co.ke',
      maxUsers: 100,
      maxProperties: 500,
      mpesaClientId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    };

    // Delete existing bursary orgs
    await db.collection('tenants').deleteMany({ slug: { $in: ['kenya-bursary-fund', 'kenya-bursary-fund-nakuru'] } });
    console.log('✔ Cleared existing bursary offices');

    // Insert the new organizations
    const result = await db.collection('tenants').insertMany([bursaryOrg, nakuruOrg]);
    console.log('✔ Bursary offices created:');
    console.log(`  ID: ${result.insertedIds[0]} - Nairobi Office`);
    console.log(`  ID: ${result.insertedIds[1]} - Nakuru Office`);

    console.log('\n✔ Seeding complete!');
    console.log('Applicants can now register using locations:');
    console.log('  - Nairobi');
    console.log('  - Nakuru');
  } catch (error) {
    console.error('❌ Error seeding bursary offices:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedBursaryOffices();
