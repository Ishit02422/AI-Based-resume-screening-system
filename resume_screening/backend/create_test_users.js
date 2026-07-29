const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.mongodb.net/test?retryWrites=true&w=majority"; // Actually wait, let me check the existing scripts for the URI used in production if it's deployed on render. 
// Render uses environment variables, but locally they might be testing. Let me check the seed_jobs.js or check_db.js to find the exact MongoDB URI.
