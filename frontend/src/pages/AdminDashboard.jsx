import React, { useState, useEffect } from 'react';
import { getAdminStats, getTodayStats, getAllOrders } from '../services/api';
import { DollarSign, ShoppingBag, Box, AlertTriangle, Users, Clock, ChevronRight, X } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, lowStockProducts: [] });
  const [todayStats, setTodayStats] = useState({ todayRevenue: 0, todayCustomerCount: 0, todayOrders: [] });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [view, setView] = useState('overview'); // 'overview' or 'products'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("AdminDashboard: Fetching data from backend...");
      const [statsRes, todayRes, ordersRes] = await Promise.all([
        getAdminStats(),
        getTodayStats(),
        getAllOrders()
      ]);
      
      console.log("Admin Stats Data:", statsRes.data);
      console.log("Today Stats Data:", todayRes.data);
      console.log("All Orders Data:", ordersRes.data);

      setStats(statsRes.data);
      setTodayStats(todayRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (err) {
      console.error("AdminDashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading Dashboard...</div>;

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Admin Analytics</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={`btn ${view === 'overview' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('overview')}>Overview</button>
          <button className={`btn ${view === 'products' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('products')}>Product List</button>
        </div>
      </div>

      {view === 'overview' ? (
        <>
          <div className="grid grid-4" style={{ marginBottom: '3rem', gap: '1.5rem' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}>
                  <DollarSign size={24} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Revenue</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>${todayStats.todayRevenue.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--success)', cursor: 'pointer' }} onClick={() => setShowCustomerModal(true)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: '12px' }}>
                  <Users size={24} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Customers</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{todayStats.todayCustomerCount}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                    View Records <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--warning)', cursor: 'pointer' }} onClick={() => setView('products')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.75rem', borderRadius: '12px' }}>
                  <Box size={24} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Products</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalProducts}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 600, justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                    Inventory <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--danger)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '12px' }}>
                  <ShoppingBag size={24} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sales</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>${stats.totalRevenue.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Clock size={20} /> Recent Orders
              </h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order._id}>
                        <td><code>{order._id}</code></td>
                        <td>{order.userId?.name || 'Guest'}</td>
                        <td>${order.totalAmount.toFixed(2)}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--danger)' }}>
                <AlertTriangle size={20} /> Low Stock Alerts
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockProducts.map(product => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td><span className="badge badge-danger">{product.stock} units</span></td>
                      <td><button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }}>Refill</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <ProductListPage />
      )}

      {showCustomerModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Today's Customers</h2>
              <button className="btn btn-outline" onClick={() => setShowCustomerModal(false)}><X size={20} /></button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Time</th>
                  <th>Items Purchased</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {todayStats.todayOrders.map(order => (
                  <tr key={order._id}>
                    <td>{order.customerName}</td>
                    <td>{new Date(order.time).toLocaleTimeString()}</td>
                    <td>
                      <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.875rem' }}>
                        {order.items.map((item, idx) => (
                          <li key={idx}>{item.name} x {item.quantity}</li>
                        ))}
                      </ul>
                    </td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { getProducts } = await import('../services/api');
        const { data } = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div>Loading Products...</div>;

  return (
    <div className="card fade-in">
      <h2>All Inventory Products</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td><code>{p.barcode}</code></td>
                <td>{p.name}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>{p.weightValue}{p.weightUnit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
