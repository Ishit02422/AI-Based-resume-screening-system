const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const mongooseTypes = require('mongoose').Types;

if (!process.argv[2]) {
  console.error('Usage: node assign_orphans.js <userId>');
  process.exit(1);
}
const userId = process.argv[2];
if (!mongooseTypes.ObjectId.isValid(userId)) {
  console.error('Invalid userId provided');
  process.exit(1);
}

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/resume_ai_db', { serverSelectionTimeoutMS: 5000 });
  const res = await Resume.updateMany(
    { $or: [{ user: { $exists: false } }, { user: null }] },
    { $set: { user: mongooseTypes.ObjectId(userId) } }
  );
  console.log('Updated', res.modifiedCount, 'documents');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
