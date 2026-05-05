import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container text-center">
          <span className="badge-ai mb-4">Powered by Advanced Gemini AI</span>
          <h1 className="hero-display mb-6">
            Hire Smarter, <span className="text-gradient">Screen Faster</span>
          </h1>
          <p className="hero-lead mb-10 mx-auto" style={{ maxWidth: '700px' }}>
            Transform your recruitment process with AI-driven resume screening. Identify top talent in seconds, bridge skill gaps, and build your dream team with data-driven confidence.
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/signup" className="btn btn-primary btn-large">Start Free Trial</Link>
            <Link to="/login" className="btn btn-ghost btn-large">Schedule Demo</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-strip py-12">
        <div className="container grid grid-cols-4 gap-8">
          <div className="stat-item">
            <h3>98%</h3>
            <p>Accuracy Rate</p>
          </div>
          <div className="stat-item">
            <h3>10x</h3>
            <p>Faster Screening</p>
          </div>
          <div className="stat-item">
            <h3>5k+</h3>
            <p>Resumes Parsed</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>AI Support</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="section-title">Built for Modern Teams</h2>
          <p className="muted">Everything you need to automate your hiring pipeline.</p>
        </div>
        <div className="grid grid-cols-3 gap-10">
          <div className="feature-card">
            <div className="icon-box">🎯</div>
            <h4>Precision Scoring</h4>
            <p className="muted">Our AI ranks candidates based on 50+ data points including skills, experience, and context.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box">📊</div>
            <h4>Skill Gap Analysis</h4>
            <p className="muted">Visualize exactly what a candidate brings to the table and what training they might need.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box">⚡</div>
            <h4>Instant Parsing</h4>
            <p className="muted">Upload hundreds of resumes and get results in seconds. No more manual data entry.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-banner container mb-20">
        <div className="card bg-dark text-white p-12 flex justify-between items-center rounded-3xl">
          <div>
            <h2 className="mb-2">Ready to streamline your hiring?</h2>
            <p className="text-slate-400">Join 500+ companies using ARS to find their next star player.</p>
          </div>
          <Link to="/signup" className="btn btn-primary btn-large">Get Started Now</Link>
        </div>
      </section>

      <footer className="container py-12 border-t flex justify-between items-center muted small">
        <p>© 2026 AI Resume Screening System. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
