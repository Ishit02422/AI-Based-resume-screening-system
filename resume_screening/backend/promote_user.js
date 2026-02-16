const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/resume_ai_db");
        console.log("Connected to DB");

        const email = "rrr41@gmail.com"; // User email from previous interaction
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found!");
            process.exit(1);
        }

        user.role = 'recruiter';
        await user.save();
        console.log(`User ${user.email} promoted to RECRUITER.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
