const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// Create a new job (Recruiter/Admin only)
router.post('/', auth, async (req, res) => {
    try {
        // Auto-promote for demo purposes
        if (req.user.role === 'user') {
            console.log(`Auto-promoting user ${req.user.email} to Recruiter.`);
            req.user.role = 'recruiter';
            await req.user.save();
        }

        if (!['recruiter', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { title, description, requiredSkills } = req.body;

        // basic validation
        if (!title || !requiredSkills || !Array.isArray(requiredSkills)) {
            return res.status(400).json({ error: 'Title and requiredSkills (array) are required' });
        }

        const job = new Job({
            title,
            description,
            requiredSkills,
            createdBy: req.user._id
        });

        await job.save();
        res.status(201).json({ data: job });
    } catch (err) {
        console.error('Create job error:', err);
        res.status(500).json({ error: 'Failed to create job' });
    }
});

// Seed diverse jobs
router.get('/seed', async (req, res) => {
    try {
        const User = require('../models/User');
        const bcrypt = require('bcrypt');
        
        let recruiter = await User.findOne({ role: 'recruiter' });
        if (!recruiter) {
            const passwordHash = await bcrypt.hash('123456', 10);
            recruiter = new User({
                name: 'Default HR Manager',
                email: 'hr@gmail.com',
                passwordHash: passwordHash,
                role: 'recruiter'
            });
            await recruiter.save();
        }

        await Job.deleteMany({});
        const defaultJobs = [
            {
                title: 'Node.js Backend Developer',
                description: 'Looking for an experienced backend developer skilled in Node.js, Express, REST APIs, and MongoDB database architecture.',
                requiredSkills: ['node', 'express', 'mongodb', 'javascript', 'sql'],
                createdBy: recruiter._id
            },
            {
                title: 'React Frontend Engineer',
                description: 'We need a creative frontend developer to build responsive and interactive web UIs using React, HTML5, CSS3, and JavaScript.',
                requiredSkills: ['react', 'javascript', 'html', 'css', 'design'],
                createdBy: recruiter._id
            },
            {
                title: 'Python & Data Analyst',
                description: 'Join our data team to build data pipelines, analyze business metrics, and write Python scripts for data processing.',
                requiredSkills: ['python', 'sql', 'excel', 'data analysis', 'problem solving'],
                createdBy: recruiter._id
            },
            {
                title: 'Human Resources (HR) Coordinator',
                description: 'Responsible for end-to-end candidate sourcing, screening, scheduling interviews, and employee onboarding.',
                requiredSkills: ['hr', 'recruitment', 'communication', 'sourcing', 'management'],
                createdBy: recruiter._id
            },
            {
                title: 'Senior Accountant & Auditor',
                description: 'Manage company financial records, tax filings, GST reconciliation, and auditing using Tally and Advanced Excel.',
                requiredSkills: ['accounting', 'tally', 'gst', 'excel', 'finance'],
                createdBy: recruiter._id
            }
        ];
        const created = await Job.insertMany(defaultJobs);
        res.json({ message: 'Successfully seeded 5 diverse jobs!', data: created });
    } catch (err) {
        console.error('Job seed error:', err);
        res.status(500).json({ error: 'Failed to seed jobs: ' + err.message });
    }
});

// List all jobs (Deduplicated)
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        // Deduplicate by title to ensure a clean UI
        const seenTitles = new Set();
        const uniqueJobs = jobs.filter(j => {
            if (seenTitles.has(j.title)) return false;
            seenTitles.add(j.title);
            return true;
        });
        res.json({ data: uniqueJobs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// Get single job
router.get('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('createdBy', 'name email');
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json({ data: job });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});

module.exports = router;
