const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect("mongodb://127.0.0.1:27017/resume_ai_db");
        console.log("Connected to DB");

        const email = "rrr41@gmail.com";
        console.log(`Searching for user: ${email}`);
        const user = await User.findOne({ email });

        if (user) {
            console.log("User found:", user.email, "ID:", user._id);
            console.log("Role:", user.role);
            console.log("Has passwordHash?", !!user.passwordHash);
        } else {
            console.log("User NOT found");
        }

        process.exit(0);
    } catch (err) {
        console.error("DEBUG ERROR:", err);
        process.exit(1);
    }
};

run();
