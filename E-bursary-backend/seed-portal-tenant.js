/**
 * Seed a test tenant portal user.
 *
 * Usage:
 *   node seed-portal-tenant.js
 *
 * The script will:
 *  1. Connect to MongoDB (reads MONGODB_URI from .env, falls back to localhost)
 *  2. Load the first active organisation (tenant) it finds in the `tenants` collection
 *  3. Create (or reset) a PropertyTenant record with a known email + password
 *     so you can immediately log into /tenant-portal/login
 *
 * Credentials after seeding
 *  Email   : tenant.test@e-bursary.co.ke
 *  Password: Tenant@1234
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PORTAL_EMAIL    = 'tenant.test@e-bursary.co.ke';
const PORTAL_PASSWORD = 'Tenant@1234';
const PORTAL_NAME     = 'Test Tenant';
const PORTAL_PHONE    = '0712345678';

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/e-bursary';
  await mongoose.connect(uri);
  console.log('✔  Connected to MongoDB');

  // ── 1. Grab the first organisation tenant so we have a tenantId ────────────
  const orgSchema = new mongoose.Schema({}, { strict: false, collection: 'tenants' });
  const OrgModel  = mongoose.model('OrgTenantSeed', orgSchema);

  const org = await OrgModel.findOne({ isDeleted: { $ne: true } }).sort({ createdAt: 1 });
  if (!org) {
    console.error('✘  No organisation found in `tenants` collection.');
    console.error('   Please run the app, sign up and create a tenant first.');
    await mongoose.disconnect();
    process.exit(1);
  }

  const orgTenantId = org._id.toString();
  console.log(`✔  Using organisation: "${org.name || org.email || orgTenantId}" (${orgTenantId})`);

  // ── 2. Upsert the PropertyTenant portal user ───────────────────────────────
  const ptSchema = new mongoose.Schema({}, { strict: false, collection: 'propertytenants' });
  const PT        = mongoose.model('PropertyTenantSeed', ptSchema);

  const hashedPassword = await bcrypt.hash(PORTAL_PASSWORD, 10);

  const existing = await PT.findOne({ email: PORTAL_EMAIL });

  if (existing) {
    // Reset password so the seed credentials always work
    await PT.updateOne(
      { _id: existing._id },
      {
        $set: {
          portalPassword:       hashedPassword,
          portalPasswordSet:    true,
          portalInviteToken:    '',
          portalInviteTokenUsed: true,
          isActive:             true,
          isDeleted:            false,
          updatedAt:            new Date(),
        },
      },
    );
    console.log('✔  Existing portal tenant found — password has been reset.');
  } else {
    await PT.create({
      tenantId:              orgTenantId,
      name:                  PORTAL_NAME,
      email:                 PORTAL_EMAIL,
      phone:                 PORTAL_PHONE,
      idNumber:              '',
      kraPin:                '',
      emergencyContactName:  '',
      emergencyContactPhone: '',
      occupation:            'Software Tester',
      employer:              'e-bursary Dev',
      avatar:                '',
      currentPropertyId:     '',
      currentLeaseId:        '',
      isActive:              true,
      isDeleted:             false,
      documents:             [],
      metadata:              {},
      // ── Portal auth ──────────────────────────────────────────────────────
      portalPassword:        hashedPassword,
      portalPasswordSet:     true,
      portalInviteToken:     '',
      portalInviteTokenExpiry: null,
      portalInviteTokenUsed: true,
      createdAt:             new Date(),
      updatedAt:             new Date(),
    });
    console.log('✔  New portal tenant created.');
  }

  // ── 3. Print summary ───────────────────────────────────────────────────────
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Tenant Portal Test Credentials');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  URL      : http://localhost:4200/tenant-portal/login`);
  console.log(`  Email    : ${PORTAL_EMAIL}`);
  console.log(`  Password : ${PORTAL_PASSWORD}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('✘  Seed failed:', err.message);
  process.exit(1);
});


