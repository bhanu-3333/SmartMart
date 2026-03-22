import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import '../styles/App.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', JSON.stringify(data));
      
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'staff') navigate('/staff');
      else navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Supermarket Login</h2>
        {error && <div className="badge badge-danger" style={{ marginBottom: '1rem', width: '100%', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              required 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              required 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign In</button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" className="nav-link" style={{ color: 'var(--primary)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
