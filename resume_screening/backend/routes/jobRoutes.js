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

// List all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json({ data: jobs });
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
