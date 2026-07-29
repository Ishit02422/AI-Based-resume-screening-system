const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const Resume = require("../models/Resume");
const Notification = require("../models/Notification");
const auth = require('../middleware/auth');

const router = express.Router();
const AI_SERVER_URL = process.env.AI_SERVER_URL || "https://ai-based-resume-screening-system-1.onrender.com";
const fs = require('fs');

// Helper to call AI Server by uploading file as multipart/form-data
async function callAiServer(filePath, jobSkills = []) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const formData = new FormData();
  const fileBuffer = fs.readFileSync(filePath);
  const fileBlob = new Blob([fileBuffer]);
  formData.append('file', fileBlob, path.basename(filePath));
  formData.append('jobSkills', JSON.stringify(jobSkills));
  return await axios.post(`${AI_SERVER_URL}/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000
  });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Upload API (protected)
router.post("/upload", auth, upload.single("resume"), async (req, res) => {
  try {
    console.log('Upload attempt by user:', req.user && req.user._id, 'file:', req.file && req.file.originalname);
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // ✅ Absolute path (IMPORTANT)
    const absolutePath = path.resolve(req.file.path);

    // basic file extension whitelist
    const allowedExt = ['.pdf', '.txt', '.docx', '.doc'];
    const ext = path.extname(absolutePath).toLowerCase();
    if (!allowedExt.includes(ext)) return res.status(400).json({ error: 'Unsupported file type' });

    // ✅ Get Job ID from body
    const { jobId } = req.body;
    let jobSkills = [];
    if (jobId) {
      try {
        const Job = require('../models/Job');
        const job = await Job.findById(jobId);
        if (job && job.requiredSkills && job.requiredSkills.length > 0) {
          jobSkills = job.requiredSkills;
        }
      } catch (e) {
        console.error("Error fetching job:", e);
      }
    }

    // If no job is linked, we force a generic skill to bypass the old AI server's hardcoded IT defaults
    if (!jobSkills.length) {
      jobSkills = ["Professional Expertise"]; 
    }

    let aiResponse;
    try {
      aiResponse = await callAiServer(absolutePath, jobSkills);

      if (!aiResponse || !aiResponse.data) {
        console.error('Empty AI response for file', absolutePath);
        throw new Error('Empty AI response');
      }

      // ensure we persist file info and new fields returned by AI
      let payload = {
        ...aiResponse.data,
        user: req.user._id,
        fileName: req.file ? req.file.filename : undefined,
        filePath: absolutePath,
        aiError: undefined,
        aiTries: 1,
        jobId: jobId || undefined, // Link to job
        status: 'Screened'
      };

      // ✅ UNIVERSAL MODE HACK: If no job is linked and AI found skills but gave 0 score, 
      // we treat it as a profile extraction (100% match for its own field)
      if (!jobId && payload.score === 0 && payload.skills && payload.skills.length > 0) {
        payload.score = 100;
        payload.matchedSkills = payload.skills;
        payload.missingSkills = [];
        payload.jobSkills = payload.skills;
      }

      const resume = new Resume(payload);

      if (resume.score >= 70) {
        resume.interviewStatus = "Interview Scheduled";
        resume.status = "Interview Scheduled";
      }

      await resume.save();
      return res.json({ data: resume });

    } catch (err) {
      // AI failed — save a placeholder resume with aiError and allow manual retry
      console.error('AI processing failed, saving placeholder resume:', err.message, err.response && err.response.data);
      const msg = err.response?.data?.error || err.message || 'AI request failed';

      const fallback = new Resume({
        user: req.user._id,
        fileName: req.file ? req.file.filename : undefined,
        filePath: absolutePath,
        aiError: String(msg),
        aiTries: 1,
        interviewStatus: 'Processing Failed',
        jobId: jobId || undefined,
        status: 'Applied'
      });

      await fallback.save();
      return res.status(200).json({ data: fallback, warning: `AI processing error: ${msg} (saved file — you can retry later)` });
    }

  } catch (error) {
    console.error('Upload handler error:', error);
    res.status(500).json({ error: "Upload failed: " + (error.message || 'Unknown') });
  }
});

// Get current user's resumes (supports pagination, filters: minScore, from, to, q)
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, minScore, from, to, q, jobId } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.max(1, parseInt(limit, 10) || 20);

    const filter = {};

    // Permission check: recruiters see all (or filtered by job), users see only theirs
    if (['recruiter', 'admin'].includes(req.user.role)) {
      if (jobId) filter.jobId = jobId;
    } else {
      filter.user = req.user._id;
    }

    if (minScore !== undefined && minScore !== '') {
      filter.score = { $gte: Number(minScore) };
    }

    if (from || to) {
      const created = {};
      if (from) {
        const d = new Date(from);
        if (!isNaN(d.getTime())) created.$gte = d;
      }
      if (to) {
        const d2 = new Date(to);
        if (!isNaN(d2.getTime())) created.$lte = d2;
      }
      if (Object.keys(created).length) filter.createdAt = created;
    }

    if (q && q.trim()) {
      const re = new RegExp(q.trim(), 'i');
      filter.$or = [
        { skills: re },
        { matchedSkills: re },
        { missingSkills: re },
        { fileName: re }
      ];
    }

    const total = await Resume.countDocuments(filter);
    const resumes = await Resume.find(filter)
      .sort({ score: -1, createdAt: -1 })
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .populate('jobId', 'title')
      .populate('user', 'name email');

    res.json({ data: resumes, total, page: pageNum, pages: Math.ceil(total / perPage) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Export matching resumes as CSV
router.get('/my/export', auth, async (req, res) => {
  try {
    const { minScore, from, to, q } = req.query;
    const filter = { user: req.user._id };

    if (minScore !== undefined && minScore !== '') {
      filter.score = { $gte: Number(minScore) };
    }

    if (from || to) {
      const created = {};
      if (from) {
        const d = new Date(from);
        if (!isNaN(d.getTime())) created.$gte = d;
      }
      if (to) {
        const d2 = new Date(to);
        if (!isNaN(d2.getTime())) created.$lte = d2;
      }
      if (Object.keys(created).length) filter.createdAt = created;
    }

    if (q && q.trim()) {
      const re = new RegExp(q.trim(), 'i');
      filter.$or = [
        { skills: re },
        { matchedSkills: re },
        { missingSkills: re },
        { fileName: re }
      ];
    }

    const resumes = await Resume.find(filter).sort({ createdAt: -1 });

    const rows = resumes.map(r => [
      r.createdAt ? r.createdAt.toISOString() : '',
      r.fileName || '',
      r.score || '',
      (r.matchedSkills || []).join('|'),
      (r.missingSkills || []).join('|'),
      (r.jobSkills || []).join('|'),
      r.interviewStatus || '',
      r.interviewDate ? r.interviewDate.toISOString() : '',
      (r.interviewHistory || []).map(h => `${h.at ? new Date(h.at).toISOString() : ''}|${h.status}|${h.note || ''}`).join(';'),
      r.filePath || ''
    ]);

    const header = ['uploadedAt', 'fileName', 'score', 'matchedSkills', 'missingSkills', 'jobSkills', 'interviewStatus', 'interviewDate', 'history', 'filePath'];
    const csv = header.join(',') + '\n' + rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="resumes_export.csv"');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export resumes' });
  }
});

// Update interview status for a resume
router.post('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, interviewDate, note } = req.body;

    const ALLOWED = ['Not Reviewed', 'Shortlisted', 'Rejected', 'Interview Scheduled', 'Interviewed', 'Offer Extended', 'Hired'];
    if (!status || !ALLOWED.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    // permission: owner or recruiter/admin
    const canEdit = (String(resume.user) === String(req.user._id)) || ['recruiter', 'admin'].includes(req.user.role);
    if (!canEdit) return res.status(403).json({ error: 'Forbidden' });

    // apply updates
    resume.interviewStatus = status;
    if (interviewDate) {
      const d = new Date(interviewDate);
      if (!isNaN(d.getTime())) resume.interviewDate = d;
    }
    if (note) resume.interviewNotes = note;

    // push history entry
    resume.interviewHistory = resume.interviewHistory || [];
    resume.interviewHistory.push({ status, note: note || '', by: req.user._id, at: new Date() });

    await resume.save();

    // Create notification if a recruiter/admin updated the status
    if (['recruiter', 'admin'].includes(req.user.role) && String(resume.user) !== String(req.user._id)) {
      let type = 'info';
      if (['Shortlisted', 'Interview Scheduled', 'Offer Extended', 'Hired'].includes(status)) type = 'success';
      if (status === 'Rejected') type = 'error';
      
      const message = `Your resume has been marked as ${status}.`;
      await Notification.create({
        user: resume.user,
        message,
        type,
        link: '/my-resumes'
      });
    }

    res.json({ data: resume });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Re-run AI processing for a saved resume
router.post('/:id/reprocess', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    // permission: owner or recruiter/admin
    const canEdit = (String(resume.user) === String(req.user._id)) || ['recruiter', 'admin'].includes(req.user.role);
    if (!canEdit) return res.status(403).json({ error: 'Forbidden' });

    if (!resume.filePath) return res.status(400).json({ error: 'No file path to reprocess' });

    // call AI
    try {
      const aiRes = await callAiServer(resume.filePath, resume.jobSkills || []);
      if (!aiRes || !aiRes.data) throw new Error('Empty AI response');

      // merge results
      resume.skills = aiRes.data.skills || resume.skills;
      resume.matchedSkills = aiRes.data.matchedSkills || resume.matchedSkills;
      resume.jobSkills = aiRes.data.jobSkills || resume.jobSkills;
      resume.missingSkills = aiRes.data.missingSkills || resume.missingSkills;
      resume.score = aiRes.data.score || resume.score;
      resume.aiError = undefined;
      resume.aiTries = (resume.aiTries || 0) + 1;

      if (resume.score >= 70) resume.interviewStatus = 'Interview Scheduled';

      await resume.save();
      return res.json({ data: resume });
    } catch (err) {
      console.error('Reprocess AI failed:', err.message, err.response && err.response.data);
      resume.aiError = err.response?.data?.error || err.message || 'AI processing failed';
      resume.aiTries = (resume.aiTries || 0) + 1;
      await resume.save();
      return res.status(502).json({ error: 'AI reprocess failed: ' + resume.aiError, data: resume });
    }
  } catch (err) {
    console.error('Reprocess error:', err);
    res.status(500).json({ error: 'Failed to reprocess resume' });
  }
});

// Batch reprocess all resumes with aiError (admin/recruiter only)
router.post('/reprocess-failed', auth, async (req, res) => {
  try {
    if (!['recruiter', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });

    const failed = await Resume.find({ aiError: { $exists: true, $ne: null } });
    let succeeded = 0;
    let failedCount = 0;
    const details = [];

    for (const r of failed) {
      if (!r.filePath) {
        failedCount++;
        details.push({ id: r._id, error: 'No filePath' });
        continue;
      }
      try {
        const aiRes = await callAiServer(r.filePath, r.jobSkills || []);
        if (!aiRes || !aiRes.data) throw new Error('Empty AI response');

        r.skills = aiRes.data.skills || r.skills;
        r.matchedSkills = aiRes.data.matchedSkills || r.matchedSkills;
        r.jobSkills = aiRes.data.jobSkills || r.jobSkills;
        r.missingSkills = aiRes.data.missingSkills || r.missingSkills;
        r.score = aiRes.data.score || r.score;
        r.aiError = undefined;
        r.aiTries = (r.aiTries || 0) + 1;
        if (r.score >= 70) r.interviewStatus = 'Interview Scheduled';
        await r.save();
        succeeded++;
        details.push({ id: r._id, ok: true });
      } catch (err) {
        r.aiError = err.response?.data?.error || err.message || 'AI processing failed';
        r.aiTries = (r.aiTries || 0) + 1;
        await r.save();
        failedCount++;
        details.push({ id: r._id, error: r.aiError });
      }
    }

    res.json({ total: failed.length, succeeded, failed: failedCount, details });
  } catch (err) {
    console.error('Batch reprocess error:', err);
    res.status(500).json({ error: 'Failed to batch reprocess' });
  }
});

module.exports = router;

