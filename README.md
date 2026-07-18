# 🎯 Automated AI-Based Resume Screening System

An end-to-end recruitment solution that parses resumes, analyzes skill profiles, calculates matching scores against job descriptions using fuzzy logic algorithms, and visualizes candidate distribution with interactive charts.

---

## 🔗 Live Application Links
- **Frontend Dashboard:** [https://ai-based-resume-screening-system-2.onrender.com/](https://ai-based-resume-screening-system-2.onrender.com/)
- **Backend API Server:** [https://ai-based-resume-screening-system-b208.onrender.com/](https://ai-based-resume-screening-system-b208.onrender.com/)
- **AI-ML Python Engine:** [https://ai-based-resume-screening-system-1.onrender.com/](https://ai-based-resume-screening-system-1.onrender.com/)

---

## ✨ Key Features
- **Smart Parsing Engine:** Extracts name, contact details, and technical/non-technical skills from resumes (PDF, DOCX, TXT).
- **Fuzzy Skill Matcher:** Matches resume profiles against specific job descriptions using text-normalization and string similarity thresholding.
- **Interactive Recruiter Console:** Enables posting jobs, viewing applicants sorted by match percentage, and managing hiring statuses (Shortlisted, Interview Scheduled, Hired, Rejected).
- **Hiring Pipeline Visualizer:** Tracks candidate progression from application to system-screening to hiring state.
- **Analytics Dashboard (NEW):**
  - **Status Distribution:** Visual breakdown of candidates across different pipeline stages (Pie Chart).
  - **Score Distribution:** Grouping of candidates based on matching score brackets (Bar Chart).
- **Cross-Origin Security:** Fully secure, HTTP-only cookie-based authentication supporting cross-domain environments.

---

## 🛠️ Architecture & Tech Stack

### 💻 Frontend (React SPA)
- React.js with React Router DOM for SPA routing.
- Axios with credentials configuration for cross-domain requests.
- Premium, custom-tailored dark theme using Vanilla CSS grid layouts and micro-animations.

### ⚙️ Backend (Node.js & Express)
- RESTful API design.
- MongoDB with Mongoose schemas for Users, Jobs, and Resumes.
- JWT-based authentication stored securely in cookies.
- Multer middleware for secure file uploads.

### 🤖 AI-ML Parser Engine (Python & Flask)
- Flask micro-web framework.
- Skill Matcher using fuzzy string comparison algorithm.
- Regular Expressions (RegEx) matching for raw skill extraction.

---

## 📁 Repository Structure
```text
├── resume_screening/
│   ├── frontend/         # React SPA source code
│   ├── backend/          # Node.js + Express API server
│   └── ai-ml/            # Python Flask parsing service
```

---

## 🚀 Local Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- MongoDB Atlas account (or local MongoDB)

### 1. Setup Backend
1. Go to `resume_screening/backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   AI_SERVER_URL=http://localhost:5000
   ```
4. Run server:
   ```bash
   npm run dev
   ```

### 2. Setup AI-ML Server
1. Go to `resume_screening/ai-ml/`
2. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Start Flask app:
   ```bash
   python app.py
   ```

### 3. Setup Frontend
1. Go to `resume_screening/frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start React:
   ```bash
   npm start
   ```
4. Access app at `http://localhost:3000`
