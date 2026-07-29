import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCardClick = (type) => {
    if (!user) {
      navigate('/signup');
      return;
    }
    const isRecruiter = user.role === 'recruiter' || user.role === 'admin';
    if (type === 'scoring' || type === 'parsing') {
      navigate(isRecruiter ? '/dashboard' : '/upload');
    } else if (type === 'gap') {
      navigate(isRecruiter ? '/history' : '/history');
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container text-center">
          <span className="badge-ai mb-4">Powered by Smart Parsing Engine</span>
          <h1 className="hero-display mb-6">
            Hire Smarter, <span className="text-gradient">Screen Faster</span>
          </h1>
          <p className="hero-lead mb-10 mx-auto" style={{ maxWidth: '700px' }}>
            Transform your recruitment process with automated resume matching. Identify top talent in seconds, bridge skill gaps, and build your dream team with data-driven confidence.
          </p>
          <div className="flex justify-center gap-6">
            <Link to={user ? (user.role === 'recruiter' || user.role === 'admin' ? '/dashboard' : '/upload') : '/signup'} className="btn btn-primary btn-large">Get Started</Link>
            <Link to="/jobs" className="btn btn-ghost btn-large">Browse Jobs</Link>
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
          <div className="feature-card" onClick={() => handleCardClick('scoring')}>
            <div className="icon-box">🎯</div>
            <h4>Precision Scoring</h4>
            <p className="muted">Our smart algorithm ranks candidates based on key data points including skills and experience.</p>
          </div>
          <div className="feature-card" onClick={() => handleCardClick('gap')}>
            <div className="icon-box">📊</div>
            <h4>Skill Gap Analysis</h4>
            <p className="muted">Visualize exactly what a candidate brings to the table and what training they might need.</p>
          </div>
          <div className="feature-card" onClick={() => handleCardClick('parsing')}>
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
            <p className="text-slate-400">Use our automated platform to find and match top talent.</p>
          </div>
          <Link to={user ? (user.role === 'recruiter' || user.role === 'admin' ? '/dashboard' : '/upload') : '/signup'} className="btn btn-primary btn-large">Get Started Now</Link>
        </div>
      </section>

      <footer className="container py-12 border-t flex justify-between items-center muted small">
        <p>© 2026 Automated Resume Matching System. All rights reserved.</p>
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
