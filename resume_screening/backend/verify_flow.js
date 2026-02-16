const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Resume = require('./models/Resume');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5001/api';
const RECRUITER = { name: 'Recruiter', email: 'recruiter_test@example.com', password: 'password123', role: 'recruiter' };
const CANDIDATE = { name: 'Candidate', email: 'candidate_test@example.com', password: 'password123', role: 'user' };

async function run() {
    console.log("=== Starting Verification Flow ===");

    try {
        // 1. Connect DB to clean up previous test data
        await mongoose.connect("mongodb://127.0.0.1:27017/resume_ai_db");
        await User.deleteOne({ email: RECRUITER.email });
        await User.deleteOne({ email: CANDIDATE.email });
        // We won't delete jobs/resumes to keep history, but we could.
        console.log("Cleaned up test users.");

        // 2. Register Recruiter
        console.log("\n1. [Recruiter] Registering...");
        let res = await axios.post(`${BASE_URL}/auth/register`, RECRUITER);
        const recruiterToken = res.headers['set-cookie'][0].split(';')[0];
        // Manually set role to recruiter since register might default to user
        await User.updateOne({ email: RECRUITER.email }, { role: 'recruiter' });
        console.log("   Recruiter registered.");

        // 3. Login Recruiter (to be sure)
        console.log("\n2. [Recruiter] Logging in...");
        res = await axios.post(`${BASE_URL}/auth/login`, { email: RECRUITER.email, password: RECRUITER.password });
        const recruiterCookie = res.headers['set-cookie'][0];
        console.log("   Recruiter logged in.");

        // 4. Create Job
        console.log("\n3. [Recruiter] Creating Job...");
        const jobData = {
            title: 'Senior Python Developer',
            description: 'Need an expert in Python and Flask.',
            requiredSkills: ['python', 'flask', 'django']
        };
        res = await axios.post(`${BASE_URL}/jobs`, jobData, {
            headers: { Cookie: recruiterCookie }
        });
        const jobId = res.data.data._id;
        console.log(`   Job Created! ID: ${jobId}`);

        // 5. Register Candidate
        console.log("\n4. [Candidate] Registering...");
        res = await axios.post(`${BASE_URL}/auth/register`, CANDIDATE);
        console.log("   Candidate registered.");

        // 6. Login Candidate
        console.log("\n5. [Candidate] Logging in...");
        res = await axios.post(`${BASE_URL}/auth/login`, { email: CANDIDATE.email, password: CANDIDATE.password });
        const candidateCookie = res.headers['set-cookie'][0];
        console.log("   Candidate logged in.");

        // 7. Upload Resume (Apply to Job)
        console.log("\n6. [Candidate] Applying to Job (Uploading Resume)...");

        // Create a dummy resume file
        const resumePath = path.resolve(__dirname, 'test_resume.txt');
        fs.writeFileSync(resumePath, "I am a Python expert with 5 years of experience in Flask and Django.");

        const FormData = require('form-data');
        const form = new FormData();
        form.append('resume', fs.createReadStream(resumePath));
        form.append('jobId', jobId); // Important!

        try {
            res = await axios.post(`${BASE_URL}/resume/upload`, form, {
                headers: {
                    ...form.getHeaders(),
                    Cookie: candidateCookie
                }
            });
            const resume = res.data.data;
            console.log("   Resume uploaded!");
            console.log(`   Resume Score: ${resume.score}`);
            console.log(`   Linked Job ID: ${resume.jobId}`);
            console.log(`   Matched Skills: ${resume.matchedSkills}`);
            console.log(`   Interview Status: ${resume.interviewStatus}`);

            if (resume.jobId === jobId) {
                console.log("\nSUCCESS: Resume successfully linked to Job!");
                if (resume.score > 50) {
                    console.log("SUCCESS: Skills matched correctly.");
                } else {
                    console.log("WARNING: Score seems low, check AI logic.");
                }
            } else {
                console.error("\nFAILURE: Job ID mismatch.");
            }

        } catch (err) {
            console.error("Upload failed:", err.response ? err.response.data : err.message);
        }

        // cleanup file
        fs.unlinkSync(resumePath);
        await mongoose.disconnect();

    } catch (err) {
        console.error("Verification Scrip Error:", err.message);
        if (err.response) console.error(err.response.data);
    }
}

run();
