import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';

function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login error', err);
      const msg = err?.response?.data?.error || err?.message || 'Login failed';
      setError(msg);
    }
  };

  return (
    <div className="page auth-page">
      <div className="container flex justify-center">
        <div className="card auth-card">
          <h2 className="text-center mb-6">Login</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit} className="auth-form">
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
            <button type="submit" className="btn btn-primary w-full">Sign In</button>
            <p className="text-center mt-4 muted">
              No account? <a href="/signup">Sign up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
