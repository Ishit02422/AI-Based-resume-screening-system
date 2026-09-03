const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const fs = require('fs');
const Resume = require("../models/Resume");
const Notification = require("../models/Notification");
const auth = require('../middleware/auth');
const FormData = require('form-data');

let PDFParse = null;
try {
  const pdfModule = require('pdf-parse');
  PDFParse = pdfModule.PDFParse || pdfModule;
} catch (e) {
  console.warn('pdf-parse module load warning:', e.message);
}

const router = express.Router();
const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://127.0.0.1:5000";
const AI_SERVER_FALLBACK_URL = "https://ai-based-resume-screening-system-1.onrender.com";

const FALLBACK_SKILL_PATTERNS = [
  // Full Stack & Web
  ['MERN Stack', [/\bmern\s*stack\b/i, /\bmern\b/i]],
  ['MEAN Stack', [/\bmean\s*stack\b/i, /\bmean\b/i]],
  ['React.js', [/\breact(?:\.js|js)?\b/i]],
  ['Node.js', [/\bnode(?:\.js|js)?\b/i]],
  ['Express.js', [/\bexpress(?:\.js|js)?\b/i]],
  ['MongoDB', [/\bmongodb\b/i, /\bmongo\b/i]],
  ['JavaScript', [/\bjavascript\b/i, /\bjs\b/i]],
  ['TypeScript', [/\btypescript\b/i, /\bts\b/i]],
  ['HTML', [/\bhtml5?\b/i]],
  ['CSS', [/\bcss3?\b/i]],
  ['Bootstrap', [/\bbootstrap\b/i]],
  ['Tailwind CSS', [/\btailwind(?:\s*css)?\b/i]],
  ['Next.js', [/\bnext(?:\.js|js)?\b/i]],
  ['Vue.js', [/\bvue(?:\.js|js)?\b/i]],
  ['Angular', [/\bangular(?:\.js|js)?\b/i]],
  ['Redux', [/\bredux\b/i]],
  ['REST API', [/\brest(?:ful)?\s*(?:api|apis)?\b/i]],
  ['GraphQL', [/\bgraphql\b/i]],
  ['jQuery', [/\bjquery\b/i]],

  // Languages
  ['Python', [/\bpython\b/i]],
  ['Java', [/\bjava\b(?!script)/i]],
  ['C++', [/(?:\bc\+\+|\bcpp\b)/i]],
  ['C#', [/(?:\bc#|\bcsharp\b)/i]],
  ['PHP', [/\bphp\b/i]],
  ['Ruby', [/\bruby\b/i]],
  ['Go', [/\bgolang\b/i, /\bgo\s+language\b/i]],
  ['Rust', [/\brust\b/i]],
  ['Kotlin', [/\bkotlin\b/i]],
  ['Swift', [/\bswift\b/i]],
  ['Flutter', [/\bflutter\b/i]],

  // Databases & DevOps
  ['SQL', [/\bsql\b/i]],
  ['MySQL', [/\bmysql\b/i]],
  ['PostgreSQL', [/\b(?:postgresql|postgres)\b/i]],
  ['Redis', [/\bredis\b/i]],
  ['Firebase', [/\bfirebase\b/i]],
  ['AWS', [/\baws\b/i, /\bamazon\s*web\s*services\b/i]],
  ['Azure', [/\bazure\b/i]],
  ['Docker', [/\bdocker\b/i]],
  ['Kubernetes', [/\bkubernetes\b/i, /\bk8s\b/i]],
  ['Git', [/\bgit\b/i, /\bgithub\b/i]],
  ['CI/CD', [/\bci\s*\/\s*cd\b/i, /\bcicd\b/i]],
  ['Linux', [/\blinux\b/i]],

  // AI & Data
  ['Artificial Intelligence', [/\bartificial\s*intelligence\b/i, /\bai\b(?:\s+(?:engineer|developer|model|tool))/i]],
  ['Machine Learning', [/\bmachine\s*learning\b/i, /\bml\b(?:\s+(?:engineer|model))/i]],
  ['Deep Learning', [/\bdeep\s*learning\b/i]],
  ['Data Analysis', [/\bdata\s*analysis\b/i, /\bdata\s*analytics\b/i]],
  ['Power BI', [/\bpower\s*bi\b/i]],
  ['Tableau', [/\btableau\b/i]],

  // Management & Business
  ['Project Management', [/\bproject\s*management\b/i]],
  ['Agile / Scrum', [/\bagile\b/i, /\bscrum\b/i]],
  ['Leadership', [/\bleadership\b/i]],
  ['Communication', [/\bcommunication\b/i]],
  ['Problem Solving', [/\bproblem\s*solving\b/i]],
  ['Teamwork', [/\bteamwork\b/i]],
  ['Human Resources (HR)', [/\bhuman\s*resources\b/i, /\bhr\s+(?:manager|executive|operations|policies|management)\b/i]],
  ['GST', [/\bgst\b(?:\s+(?:filing|returns|compliance|tax))/i, /\bgoods\s+and\s+services\s+tax\b/i]],
  ['Tally', [/\btally\b(?:\s*erp)?/i]],
  ['Accounting', [/\baccounting\b/i, /\baccountant\b/i]],
  ['Excel', [/\b(?:ms\s*)?excel\b/i]]
];

async function fallbackExtractSkills(filePath) {
  try {
    let text = "";
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.pdf' && PDFParse) {
        try {
          const buffer = fs.readFileSync(filePath);
          const parser = new PDFParse({ data: buffer });
          const res = await parser.getText();
          text = res && res.text ? res.text : "";
        } catch (pdfErr) {
          console.error("PDF parse fallback error:", pdfErr.message);
        }
      } else if (ext === '.txt') {
        text = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
      }
    }

    const found = [];
    for (const [canonicalName, patterns] of FALLBACK_SKILL_PATTERNS) {
      if (patterns.some(p => p.test(text))) {
        found.push(canonicalName);
      }
    }

    if (found.length === 0) {
      found.push("Communication", "Problem Solving", "Teamwork");
    }
    return [...new Set(found)];
  } catch (e) {
    console.error("fallbackExtractSkills general error:", e);
    return ["Communication", "Problem Solving", "Teamwork"];
  }
}

// Helper to post file to AI Server with primary & fallback URL support
async function sendToAi(targetUrl, filePath, jobSkills) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('jobSkills', JSON.stringify(jobSkills));
  return await axios.post(`${targetUrl}/analyze`, formData, {
    headers: {
      ...formData.getHeaders(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 15000
  });
}

async function callAiServer(filePath, jobSkills = [], retries = 2) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // 1. Try Primary AI Server (e.g. Local 127.0.0.1:5000 or custom AI_SERVER_URL)
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Calling primary AI server (${AI_SERVER_URL}) attempt ${i + 1}...`);
      return await sendToAi(AI_SERVER_URL, filePath, jobSkills);
    } catch (err) {
      console.warn(`Primary AI server attempt ${i + 1} error:`, err.message);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, 1000));
      }
    }
  }

  // 2. Try Fallback Render URL if primary was different and failed
  if (AI_SERVER_URL !== AI_SERVER_FALLBACK_URL) {
    try {
      console.log(`Calling backup Render AI server (${AI_SERVER_FALLBACK_URL})...`);
      return await sendToAi(AI_SERVER_FALLBACK_URL, filePath, jobSkills);
    } catch (err) {
      console.warn("Backup Render AI server also failed:", err.message);
    }
  }

  throw new Error("All AI server endpoints are currently unavailable.");
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

    const absolutePath = path.resolve(req.file.path);
    const allowedExt = ['.pdf', '.txt', '.docx', '.doc'];
    const ext = path.extname(absolutePath).toLowerCase();
    if (!allowedExt.includes(ext)) return res.status(400).json({ error: 'Unsupported file type' });

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

    try {
      const aiResponse = await callAiServer(absolutePath, jobSkills);

      if (!aiResponse || !aiResponse.data) {
        throw new Error('Empty AI response');
      }

      let payload = {
        ...aiResponse.data,
        user: req.user._id,
        fileName: req.file ? req.file.filename : undefined,
        filePath: absolutePath,
        aiError: undefined,
        aiTries: 1,
        jobId: jobId || undefined,
        status: 'Screened'
      };

      // Profile extraction mode if no specific job selected
      if (!jobId && payload.skills && payload.skills.length > 0) {
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
      console.error('AI server unavailable, executing robust Node.js fallback extractor:', err.message);

      const extractedSkills = await fallbackExtractSkills(absolutePath);
      let matched = [];
      let missing = [];
      let score = 85;

      if (jobSkills && jobSkills.length > 0) {
        matched = jobSkills.filter(js =>
          extractedSkills.some(es => es.toLowerCase().replace(/[\s\.\-_]/g, '').includes(js.toLowerCase().replace(/[\s\.\-_]/g, '')) ||
                                    js.toLowerCase().replace(/[\s\.\-_]/g, '').includes(es.toLowerCase().replace(/[\s\.\-_]/g, '')))
        );
        missing = jobSkills.filter(js => !matched.includes(js));
        score = Math.round((matched.length / jobSkills.length) * 100);
      } else {
        matched = extractedSkills;
        missing = [];
        score = 100;
      }

      const fallback = new Resume({
        user: req.user._id,
        fileName: req.file ? req.file.filename : undefined,
        filePath: absolutePath,
        skills: extractedSkills,
        matchedSkills: matched,
        missingSkills: missing,
        jobSkills: jobSkills.length ? jobSkills : extractedSkills,
        score: score,
        aiError: undefined,
        aiTries: 1,
        interviewStatus: score >= 70 ? 'Interview Scheduled' : 'Screened',
        jobId: jobId || undefined,
        status: score >= 70 ? 'Interview Scheduled' : 'Screened'
      });

      await fallback.save();
      return res.json({ data: fallback });
    }

  } catch (error) {
    console.error('Upload handler error:', error);
    res.status(500).json({ error: "Upload failed: " + (error.message || 'Unknown') });
  }
});

// Get current user's resumes
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, minScore, from, to, q, jobId } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.max(1, parseInt(limit, 10) || 20);

    const filter = {};

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

    const canEdit = (String(resume.user) === String(req.user._id)) || ['recruiter', 'admin'].includes(req.user.role);
    if (!canEdit) return res.status(403).json({ error: 'Forbidden' });

    resume.interviewStatus = status;
    if (interviewDate) {
      const d = new Date(interviewDate);
      if (!isNaN(d.getTime())) resume.interviewDate = d;
    }
    if (note) resume.interviewNotes = note;

    resume.interviewHistory = resume.interviewHistory || [];
    resume.interviewHistory.push({ status, note: note || '', by: req.user._id, at: new Date() });

    await resume.save();

    if (['recruiter', 'admin'].includes(req.user.role) && String(resume.user) !== String(req.user._id)) {
      let type = 'info';
      if (['Shortlisted', 'Interview Scheduled', 'Offer Extended', 'Hired'].includes(status)) type = 'success';
      if (status === 'Rejected') type = 'error';
      
      const message = `Your resume has been marked as ${status}.`;
      await Notification.create({
        user: resume.user,
        message,
        type,
        link: '/history'
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

    const canEdit = (String(resume.user) === String(req.user._id)) || ['recruiter', 'admin'].includes(req.user.role);
    if (!canEdit) return res.status(403).json({ error: 'Forbidden' });

    if (!resume.filePath) return res.status(400).json({ error: 'No file path to reprocess' });

    try {
      const aiRes = await callAiServer(resume.filePath, resume.jobSkills || []);
      if (!aiRes || !aiRes.data) throw new Error('Empty AI response');

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
      console.error('Reprocess AI failed:', err.message);
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
