import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';

function Signup() {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Signup error', err);
      const msg = err?.response?.data?.error || err?.message || 'Signup failed';
      setError(msg);
    }
  };

  return (
    <div className="page auth-page">
      <div className="container flex justify-center">
        <div className="card auth-card">
          <h2 className="text-center mb-6">Create Account</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">Candidate</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-full">Sign Up</button>
            <p className="text-center mt-4 muted">
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;