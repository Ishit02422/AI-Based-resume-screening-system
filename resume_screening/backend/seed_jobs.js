const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Job = require('./models/Job');

const MONGO_URI = 'mongodb://127.0.0.1:27017/resume_ai_db';

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected.");

  // Find or create HR/Recruiter user
  const email = 'hp@gmail.com';
  let recruiter = await User.findOne({ email });
  if (!recruiter) {
    console.log("Creating default Recruiter user...");
    const passwordHash = await bcrypt.hash('password123', 10);
    recruiter = new User({
      name: 'H.P. Recruiter',
      email: email,
      passwordHash: passwordHash,
      role: 'recruiter'
    });
    await recruiter.save();
    console.log("Created Recruiter user:", email);
  } else {
    // Ensure role is recruiter
    recruiter.role = 'recruiter';
    await recruiter.save();
    console.log("Using existing Recruiter user:", email);
  }

  // Delete existing jobs to avoid duplicates on multiple runs
  await Job.deleteMany({});
  console.log("Cleared old jobs.");

  const jobsData = [
    {
      title: 'Senior Accountant',
      description: 'We are looking for a Senior Accountant to manage financial transactions, prepare tax filings (GST), reconcile ledger accounts, and perform audits using Tally and Advanced Excel.',
      requiredSkills: ['tally', 'excel', 'gst filing', 'bookkeeping', 'tax reconciliation'],
      createdBy: recruiter._id
    },
    {
      title: 'Human Resources (HR) Coordinator',
      description: 'Responsible for end-to-end recruitment, sourcing candidates, organizing interviews, managing documentation, and assisting in employee onboarding processes.',
      requiredSkills: ['recruitment', 'communication', 'onboarding', 'documentation', 'sourcing'],
      createdBy: recruiter._id
    },
    {
      title: 'Operations & Logistics Manager',
      description: 'Oversee daily administrative operations, monitor budgeting, schedule shifts, optimize logistics pipeline, and manage team performance.',
      requiredSkills: ['operations', 'scheduling', 'budgeting', 'logistics', 'leadership'],
      createdBy: recruiter._id
    }
  ];

  await Job.insertMany(jobsData);
  console.log("Successfully seeded 3 dummy jobs!");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  mongoose.disconnect();
});
