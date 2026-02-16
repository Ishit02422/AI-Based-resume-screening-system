const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

async function test() {
    console.log("Starting debug...");

    try {
        const hash = await bcrypt.hash('test', 10);
        console.log("Bcrypt OK");
    } catch (e) {
        console.error("Bcrypt Error:", e);
    }

    try {
        console.log("Connecting to Mongo...");
        await mongoose.connect("mongodb://127.0.0.1:27017/resume_ai_db", {
            serverSelectionTimeoutMS: 2000
        });
        console.log("Mongo OK");
        await mongoose.disconnect();
    } catch (e) {
        console.error("Mongo Error:", e.message);
    }
}

test();
