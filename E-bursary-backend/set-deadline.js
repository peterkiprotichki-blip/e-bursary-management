const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function main() {
  const envPath = path.resolve(__dirname, '.env');
  let mongoUri = 'mongodb://localhost:27017/e_bursary';
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .reduce((acc, line) => {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m) acc[m[1].trim()] = m[2].trim();
        return acc;
      }, {});
    if (env.MONGODB_URI) mongoUri = env.MONGODB_URI;
  }

  console.log('Connecting to MongoDB at', mongoUri);
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  const tenantSchema = new mongoose.Schema({}, { strict: false, collection: 'tenants' });
  const Tenant = mongoose.model('TenantForScript', tenantSchema);

  const now = new Date();
  const deadline = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const res = await Tenant.updateMany(
    {},
    { $set: { 'settings.bursaryOpen': true, 'settings.applicationDeadline': deadline } },
    { upsert: false }
  );

  console.log('Updated tenants:', res.modifiedCount || res.nModified || res.modified);
  await mongoose.disconnect();
  console.log('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
