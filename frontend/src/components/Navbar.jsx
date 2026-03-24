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
    <nav className="fade-in" style={{ 
      background: 'rgba(255,255,255,0.7)', 
      backdropFilter: 'blur(12px)', 
      borderBottom: '1px solid var(--border)',
      padding: '0.75rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/" className="nav-brand" style={{ 
        fontSize: '1.5rem', 
        fontWeight: 900, 
        color: 'var(--primary)', 
        textDecoration: 'none',
        letterSpacing: '-1px'
      }}>SmartMart</Link>
      
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {role === 'customer' && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/customer" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShoppingCart size={18} /> Shop
            </Link>
            <Link to="/orders" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 600 }}>
              Orders
            </Link>
          </div>
        )}
        
        <div style={{ 
          background: 'var(--bg)', 
          padding: '0.5rem 1rem', 
          borderRadius: '20px', 
          border: '1px solid var(--border)',
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.6rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
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
