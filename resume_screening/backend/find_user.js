const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/resume_ai_db");
        console.log("Connected to DB");
        const users = await User.find({}, 'name email role');
        console.log("USERS IN DB:");
        users.forEach(u => console.log(`Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
