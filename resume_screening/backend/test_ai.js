const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function test() {
  try {
    const AI_SERVER_URL = "https://ai-based-resume-screening-system-1.onrender.com";
    const filePath = path.join(__dirname, 'test_resume.txt');
    fs.writeFileSync(filePath, 'This is a test resume with Python and React skills.');
    
    // Test 1: JSON payload
    console.log("Testing JSON payload...");
    const res1 = await axios.post(`${AI_SERVER_URL}/analyze`, {
      filePath: filePath,
      jobSkills: ["python", "react"]
    });
    console.log("JSON Result:", res1.data);
  } catch (err) {
    console.error("Test Error:", err.message, err.response?.data);
  }
}
test();
