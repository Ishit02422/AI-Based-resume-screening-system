import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import Logo from '../assets/logo.svg';
import NotificationsMenu from './NotificationsMenu';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand-link">Automated Resume Screening System</Link>

        <nav className="nav-links">
          {!user ? (
            <>
              <Link to="/jobs" className="nav-link">Browse Jobs</Link>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '6px 12px' }}>Signup</Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mr-4">
                <NotificationsMenu />
                <span className={`badge ${isRecruiter ? 'bg-primary' : 'bg-success'}`} style={{ fontSize: '10px' }}>
                  {isRecruiter ? 'RECRUITER' : 'CANDIDATE'}
                </span>
                <span className="muted small font-bold">{user.name || user.email}</span>
              </div>
              {isRecruiter ? (
                <>
                  <Link to="/dashboard" className="nav-link">Recruiter Console</Link>
                  <Link to="/create-job" className="nav-link">Post Job</Link>
                  <Link to="/jobs" className="nav-link">My Jobs</Link>
                  <Link to="/history" className="nav-link">Applicants</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="nav-link">Candidate Hub</Link>
                  <Link to="/upload" className="nav-link">Upload Resume</Link>
                  <Link to="/jobs" className="nav-link">Browse Jobs</Link>
                  <Link to="/history" className="nav-link">My Analysis</Link>
                </>
              )}
              <button onClick={logout} className="btn btn-ghost" style={{ padding: '6px 12px', marginLeft: '10px' }}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
