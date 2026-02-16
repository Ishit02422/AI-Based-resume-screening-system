import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import Logo from '../assets/logo.svg';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand-link">ARS System</Link>

        <nav className="nav-links">
          {!user ? (
            <>
              <Link to="/jobs" className="nav-link">Browse Jobs</Link>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '6px 12px' }}>Signup</Link>
            </>
          ) : isRecruiter ? (
            <>
              <Link to="/dashboard" className="nav-link">Recruiter Console</Link>
              <Link to="/create-job" className="nav-link">Post Job</Link>
              <Link to="/jobs" className="nav-link">My Jobs</Link>
              <Link to="/history" className="nav-link">Applicants</Link>
              <button onClick={logout} className="btn btn-ghost" style={{ padding: '6px 12px' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="nav-link">Candidate Hub</Link>
              <Link to="/upload" className="nav-link">Upload Resume</Link>
              <Link to="/jobs" className="nav-link">Browse Jobs</Link>
              <Link to="/history" className="nav-link">My Analysis</Link>
              <button onClick={logout} className="btn btn-ghost" style={{ padding: '6px 12px' }}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
