import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Login.css';

function Login({ setUser }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    if (!formData.username && !formData.email) {
      setError('Username or email is required');
      return;
    }

    try {
      const response = await api.post('/users/login', formData);
      setUser(response.data.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Login</h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username or Email</label>
            <input
              type="text"
              value={formData.username || formData.email}
              onChange={(e) => setFormData({ ...formData, username: e.target.value, email: e.target.value })}
              placeholder="Enter username or email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <p className="auth-link">
          Don't have an account? <a href="/register">Register</a>
        </p>
        <p className="auth-link">
          <a href="/forgot-password">Forgot password?</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
