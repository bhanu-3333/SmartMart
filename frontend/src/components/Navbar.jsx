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
    <nav className="fade-in">
      <Link to="/" className="nav-brand">SmartMart</Link>
      <div className="nav-links">
        {role === 'admin' && (
          <Link to="/admin" className="nav-link"><LayoutDashboard size={18} /> Dashboard</Link>
        )}
        {role === 'staff' && (
          <Link to="/staff" className="nav-link"><Package size={18} /> Inventory</Link>
        )}
        {role === 'customer' && (
          <>
            <Link to="/customer" className="nav-link"><ShoppingCart size={18} /> Shop</Link>
            <Link to="/orders" className="nav-link">My Orders</Link>
          </>
        )}
        <div className="nav-link" style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} /> {user.name} ({role})
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
