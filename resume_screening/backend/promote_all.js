const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/resume_ai_db");
        // Update ALL users to be recruiters
        const res = await User.updateMany({}, { role: 'recruiter' });
        console.log(`Updated ${res.modifiedCount} users to RECRUITER role.`);

        // List them just to be sure
        const users = await User.find({}, 'email role');
        users.forEach(u => console.log(`${u.email}: ${u.role}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
