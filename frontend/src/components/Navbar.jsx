import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ShoppingCart, LayoutDashboard, Package, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!role) return null;

  return (
    <nav className="navbar fade-in">
      <Link to="/" className="nav-brand">SmartMart</Link>
      
      <div className="nav-links">
        {role === 'customer' && (
          <>
            <Link to="/customer" className="nav-link">
              <ShoppingCart size={18} /> Shop
            </Link>
            <Link to="/orders" className="nav-link">
              Orders
            </Link>
          </>
        )}
        
        <div className="user-badge">
          <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }} />
          {user.name} <span style={{ opacity: 0.5, color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.7rem' }}>• {role}</span>
        </div>
 
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1.25rem', borderRadius: '10px' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
