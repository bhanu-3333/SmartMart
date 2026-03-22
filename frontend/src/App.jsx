import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StaffDashboard from './pages/StaffDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './styles/App.css';

const PrivateRoute = ({ children, role }) => {
  const userRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  
  if (!token) return <Navigate to="/login" />;
  if (role && userRole !== role) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/staff" element={
          <PrivateRoute role="staff">
            <StaffDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/customer" element={
          <PrivateRoute role="customer">
            <CustomerDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/admin" element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
