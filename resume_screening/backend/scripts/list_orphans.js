const mongoose = require('mongoose');
const Resume = require('../models/Resume');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/resume_ai_db', { serverSelectionTimeoutMS: 5000 });
  const orphans = await Resume.find({ $or: [{ user: { $exists: false } }, { user: null }] }).select('_id name createdAt');
  console.log(`Found ${orphans.length} orphaned resumes:`);
  orphans.forEach(r => console.log(r));
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
