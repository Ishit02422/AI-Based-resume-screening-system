const mongoose = require('mongoose');
const Resume = require('../models/Resume');

async function main(){
  await mongoose.connect('mongodb://127.0.0.1:27017/resume_ai_db', { serverSelectionTimeoutMS: 5000 });
  const total = await Resume.countDocuments();
  const withUser = await Resume.countDocuments({ user: { $exists: true, $ne: null } });
  const without = await Resume.countDocuments({ $or: [{ user: { $exists: false } }, { user: null }] });
  console.log({ total, withUser, without });
  await mongoose.disconnect();
}

main().catch(err=>{ console.error(err); process.exit(1); });
