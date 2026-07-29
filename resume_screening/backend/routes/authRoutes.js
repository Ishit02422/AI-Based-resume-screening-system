const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fs = require('fs');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'none', // Needed for cross-domain cookies in production
  secure: true,      // Required when sameSite: 'none' (only works over HTTPS)
  maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
};

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Register attempt:', req.body && { email: req.body.email });
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    let userRole = role === 'recruiter' ? 'recruiter' : 'user';
    
    // Force recruiter for this specific user for testing
    if (email === 'hp@gmail.com') userRole = 'recruiter';
    
    const user = new User({ name, email, passwordHash, role: userRole });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ user: { _id: user._id, email: user.email, name: user.name, role: (user.email === 'hp@gmail.com' ? 'recruiter' : user.role) } });
  } catch (err) {
    console.error('Register error:', err.message, err.stack);
    if (err.code === 11000) return res.status(400).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Registration failed: ' + (err.message || '') });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { ip: req.ip, email: req.body && req.body.email });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ user: { _id: user._id, email: user.email, name: user.name, role: (user.email === 'hp@gmail.com' ? 'recruiter' : user.role) } });
  } catch (err) {
    console.error('Login error:', err.message, err.stack);
    try {
      const fs = require('fs');
      fs.appendFileSync('auth_error.log', `Login Error: ${err.message}\n${err.stack}\n\n`);
    } catch (e) { }
    res.status(500).json({ error: 'Login failed: ' + (err.message || '') });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'none',
    secure: true
  });
  res.json({ ok: true });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.json({ user: null });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (user && user.email === 'hp@gmail.com') user.role = 'recruiter';
    res.json({ user });
  } catch (err) {
    res.json({ user: null });
  }
});

// Update user role (test only)
router.post('/update-role', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const { role } = req.body;
    
    if (!['user', 'recruiter'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    
    await User.findByIdAndUpdate(decoded.id, { role });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// TEMPORARY: Wipe all data for clean testing
router.get('/wipe-all-data-xyz', async (req, res) => {
  try {
    const Resume = require('../models/Resume');
    const Job = require('../models/Job');
    const Notification = require('../models/Notification');
    
    await User.deleteMany({});
    await Resume.deleteMany({});
    await Job.deleteMany({});
    await Notification.deleteMany({});
    
    res.send("<h1>All old data (Users, Resumes, Jobs, Notifications) has been successfully deleted!</h1><p>You can now go back to your website and create fresh accounts.</p>");
  } catch (err) {
    res.status(500).send("Error wiping data: " + err.message);
  }
});

module.exports = router;
