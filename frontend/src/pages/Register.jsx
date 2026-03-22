import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import '../styles/App.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await register(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', JSON.stringify(data));
      
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'staff') navigate('/staff');
      else navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
        {error && <div className="badge badge-danger" style={{ marginBottom: '1rem', width: '100%', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your name" 
              required 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            />
          </div>
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
              placeholder="Create a password" 
              required 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label className="label">Role</label>
            <select onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" className="nav-link" style={{ color: 'var(--primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
