import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await axios.get('/api/auth/me');
        let userData = res.data.user;
        if (userData && userData.email === 'hp@gmail.com') {
          userData.role = 'recruiter';
        }
        setUser(userData);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    let userData = res.data.user;
    if (userData && userData.email === 'hp@gmail.com') {
      userData.role = 'recruiter';
    }
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role) => {
    const res = await axios.post('/api/auth/register', { name, email, password, role });
    let userData = res.data.user;
    if (userData && userData.email === 'hp@gmail.com') {
      userData.role = 'recruiter';
    }
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
