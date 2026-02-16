const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/resume_ai_db");
        const email = "rrr41@gmail.com";
        const user = await User.findOne({ email });
        if (user) {
            console.log(`User: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`ID: ${user._id}`);
        } else {
            console.log("User not found");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
