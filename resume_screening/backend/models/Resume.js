const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  name: String,
  skills: [String],              // raw skills extracted from resume
  matchedSkills: [String],      // skills matched against the job
  jobSkills: [String],          // the job skill list used for matching
  experience: Number,
  score: Number,
  missingSkills: [String],
  fileName: String,
  filePath: String,

  // Link to specific Job
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },

  // Status
  status: { type: String, default: 'Applied', enum: ['Applied', 'Screened', 'Interview Scheduled', 'Rejected', 'Hired'] },

  aiError: String,
  aiTries: { type: Number, default: 0 },
  interviewStatus: { type: String, default: 'Not Reviewed' }, // Keeping existing field for compatibility regarding detailed status
  interviewDate: Date,
  interviewNotes: String,
  interviewHistory: [
    {
      status: String,
      note: String,
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      at: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);
