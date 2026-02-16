const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fs = require('fs');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  // secure: true, // enable when running over HTTPS
  maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
};

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Register attempt:', req.body && { email: req.body.email });
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ user: { id: user._id, email: user.email, name: user.name } });
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
    res.json({ user: { id: user._id, email: user.email, name: user.name } });
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
  res.clearCookie('token');
  res.json({ ok: true });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.json({ user: null });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    res.json({ user });
  } catch (err) {
    res.json({ user: null });
  }
});

module.exports = router;
