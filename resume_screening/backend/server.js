const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const resumeRoutes = require("./routes/resumeRoutes");
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes'); // Added jobRoutes require

const app = express();
// Allow CORS for dev frontend. Use origin:true to reflect request origin (enables cookies with credentials)
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// simple request logger for debugging network issues
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} => ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// TEST ROUTE (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.send("Backend is running");
});

const fs = require('fs');

const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/resume_ai_db";
mongoose.connect(mongoURI)
  .then(() => {
    console.log("MongoDB Connected");
    try { fs.writeFileSync('db_status.log', 'Connected ' + new Date().toISOString()); } catch (e) { }
  })
  .catch(err => {
    console.log(err);
    try { fs.writeFileSync('db_error.log', 'DB Connect Error: ' + err.message); } catch (e) { }
  });

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jobs", jobRoutes);

// Serve uploaded files

const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Debug: print registered routes
const printRoutes = () => {
  if (!app._router || !app._router.stack) {
    console.log('Router not initialized yet');
    return;
  }
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push(Object.keys(middleware.route.methods).join(',').toUpperCase() + ' ' + middleware.route.path);
    } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push(Object.keys(handler.route.methods).join(',').toUpperCase() + ' ' + handler.route.path);
        }
      });
    }
  });
  console.log('Registered routes:\n', routes.join('\n'));
};
// call with small delay so app has time to register routers
setTimeout(printRoutes, 1000);

app.listen(5001, () => {
  console.log("Backend running on port 5001");
});
