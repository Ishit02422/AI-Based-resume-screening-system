const mongoose = require('mongoose');
const Resume = require('./models/Resume');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/resume_ai_db');
  const last = await Resume.find().sort({ createdAt: -1 }).limit(5);
  console.log('LATEST RESUMES:');
  last.forEach(r => {
    console.log(`- ${r.fileName}: Score=${r.score}, AI_Error=${r.aiError}, Status=${r.status}`);
  });
  process.exit();
}

check();
