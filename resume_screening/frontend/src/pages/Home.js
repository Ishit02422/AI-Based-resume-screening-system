import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">AI-Powered Resume Screening</h1>
          <p className="hero-sub">Automatically analyze resumes, surface skill gaps, and rank candidates faster than ever.</p>
          <div className="hero-ctas">
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
            <Link to="/upload" className="btn btn-ghost">Upload Resume</Link>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="grid">
          <div className="card text-center">
            <h3>Instant Scoring</h3>
            <p className="muted">Get a clear match score for each resume based on job requirements.</p>
          </div>
          <div className="card text-center">
            <h3>Skill Analysis</h3>
            <p className="muted">Identify matched and missing skills at a glance.</p>
          </div>
          <div className="card text-center">
            <h3>Recruiter Ready</h3>
            <p className="muted">Rank candidates and make decisions with data-driven insights.</p>
          </div>
        </div>
      </section>

      <footer className="container text-center mt-12 muted">
        <p>© 2026 AI Resume Screening System</p>
      </footer>
    </div>
  );
}

export default Home;
