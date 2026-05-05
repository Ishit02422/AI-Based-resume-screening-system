const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect("mongodb://127.0.0.1:27017/resume_ai_db")
  .then(async () => {
    console.log("Connected to DB");
    const email = "hp@gmail.com";
    const res = await User.findOneAndUpdate({ email: email }, { role: 'recruiter' }, { new: true });
    if (res) {
      console.log(`Successfully updated ${email} to recruiter role.`);
    } else {
      console.log(`User ${email} not found.`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
