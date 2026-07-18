const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Use the deployed backend URL
const BASE_URL = 'https://ai-based-resume-screening-system-b208.onrender.com/api';

// Generate unique emails so the test can be run multiple times
const timestamp = Date.now();
const RECRUITER = {
    name: 'Auto Recruiter',
    email: `recruiter_${timestamp}@test.com`,
    password: 'password123',
    role: 'recruiter'
};
const CANDIDATE = {
    name: 'Auto Candidate',
    email: `candidate_${timestamp}@test.com`,
    password: 'password123',
    role: 'user'
};

async function run() {
    console.log("=========================================");
    console.log("   DEPLOYED BACKEND VERIFICATION FLOW    ");
    console.log(`Target URL: ${BASE_URL}`);
    console.log("=========================================\n");

    try {
        // 1. Register Recruiter
        console.log("1. Registering Recruiter...");
        let res = await axios.post(`${BASE_URL}/auth/register`, RECRUITER);
        console.log(`   [OK] Registered: ${RECRUITER.email}`);

        // 2. Login Recruiter to get session cookie
        console.log("\n2. Logging in Recruiter...");
        res = await axios.post(`${BASE_URL}/auth/login`, {
            email: RECRUITER.email,
            password: RECRUITER.password
        });
        const recruiterCookie = res.headers['set-cookie'][0];
        console.log("   [OK] Recruiter logged in successfully.");

        // 3. Create Job
        console.log("\n3. Creating a Job listing...");
        const jobPayload = {
            title: 'Node.js Developer',
            description: 'Looking for a backend engineer with Node.js, Express, and MongoDB skills.',
            requiredSkills: ['node', 'express', 'mongodb']
        };
        res = await axios.post(`${BASE_URL}/jobs`, jobPayload, {
            headers: { Cookie: recruiterCookie }
        });
        const jobId = res.data.data._id;
        console.log(`   [OK] Job Created! ID: ${jobId}`);

        // 4. Register Candidate
        console.log("\n4. Registering Candidate...");
        res = await axios.post(`${BASE_URL}/auth/register`, CANDIDATE);
        console.log(`   [OK] Registered: ${CANDIDATE.email}`);

        // 5. Login Candidate to get session cookie
        console.log("\n5. Logging in Candidate...");
        res = await axios.post(`${BASE_URL}/auth/login`, {
            email: CANDIDATE.email,
            password: CANDIDATE.password
        });
        const candidateCookie = res.headers['set-cookie'][0];
        console.log("   [OK] Candidate logged in successfully.");

        // 6. Upload Resume
        console.log("\n6. Creating dummy resume and uploading...");
        const resumePath = path.resolve(__dirname, 'temp_test_resume.txt');
        fs.writeFileSync(resumePath, "I am a backend engineer. I build applications using Node, Express, and MongoDB database.");

        const form = new FormData();
        form.append('resume', fs.createReadStream(resumePath));
        form.append('jobId', jobId);

        res = await axios.post(`${BASE_URL}/resume/upload`, form, {
            headers: {
                ...form.getHeaders(),
                Cookie: candidateCookie
            }
        });

        const resumeData = res.data.data;
        console.log("   [OK] Resume processed by backend and AI-ML server!");
        console.log("\n================ RESULTS ================");
        console.log(`- File Name: ${resumeData.fileName}`);
        console.log(`- AI Match Score: ${resumeData.score}%`);
        console.log(`- Matched Skills: ${(resumeData.matchedSkills || []).join(', ')}`);
        console.log(`- Missing Skills: ${(resumeData.missingSkills || []).join(', ')}`);
        console.log(`- System Status: ${resumeData.status}`);
        console.log(`- Interview Status: ${resumeData.interviewStatus}`);
        console.log(`- AI Error (if any): ${resumeData.aiError || 'None'}`);
        console.log("=========================================\n");

        if (resumeData.score > 0) {
            console.log("🎉 SUCCESS: Deployed flow verified! Everything works perfectly.");
        } else {
            console.log("⚠️ WARNING: Score is 0. Check if the AI service was able to parse/match successfully.");
        }

        // Cleanup local file
        fs.unlinkSync(resumePath);

    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:");
        if (error.response) {
            console.error(`Status Code: ${error.response.status}`);
            console.error("Response Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

run();
